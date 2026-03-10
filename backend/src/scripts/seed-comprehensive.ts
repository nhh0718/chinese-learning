import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

// Models
import Topic from '../models/Topic';
import Lesson from '../models/Lesson';
import Vocabulary from '../models/Vocabulary';

dotenv.config();

const DATA_DIR = path.join(__dirname, '../../data');
const CVDICT_PATH = path.join(DATA_DIR, 'CVDICT.u8');
const HANVIET_PATH = path.join(DATA_DIR, 'hanviet.csv');
const HSK_DIR = path.join(DATA_DIR, 'raw/hsk/hsk-vocabulary-master/hsk-vocab-json');
const TOCFL_PATH = path.join(DATA_DIR, 'raw/tocfl/tocfl-main/tocfl_words.json');

interface DictEntry {
    traditional: string;
    simplified: string;
    pinyin: string;
    meaning_vi: string;
}

const traditionalMap = new Map<string, DictEntry>();
const simplifiedMap = new Map<string, DictEntry>();
const hanvietMap = new Map<string, string>();

async function loadDictionaries() {
    console.log('Loading CVDICT.u8...');
    const dictStream = fs.createReadStream(CVDICT_PATH);
    const rlDict = readline.createInterface({ input: dictStream });

    let count = 0;
    for await (const line of rlDict) {
        if (line.startsWith('#')) continue;
        // Format: Trad Simp [pinyin] /meaning1/meaning2/
        const match = line.match(/^(\S+) (\S+) \[([^\]]+)\] \/(.*)\/$/);
        if (match) {
            const [, trad, simp, pinyin, meanings] = match;
            const meaning_vi = meanings.split('/').join('; ');
            const entry: DictEntry = { traditional: trad, simplified: simp, pinyin, meaning_vi };
            traditionalMap.set(trad, entry);
            simplifiedMap.set(simp, entry);
            count++;
        }
    }
    console.log(`Loaded ${count} entries from CVDICT.`);

    console.log('Loading hanviet.csv...');
    const hvStream = fs.createReadStream(HANVIET_PATH);
    const rlHv = readline.createInterface({ input: hvStream });
    for await (const line of rlHv) {
        if (line.startsWith('char,')) continue;
        const parts = line.split(',');
        if (parts.length >= 2) {
            const char = parts[0];
            let hv = parts[1];
            // remove [' and ']
            hv = hv.replace(/^\['|'\]$/g, '').replace(/', '/g, ', ');
            if (hv.includes('[')) continue; // handle weird quotes if needed
            hanvietMap.set(char, hv.replace(/\[|\]|'/g, '').replace(/,/g, ', '));
        }
    }
    console.log(`Loaded ${hanvietMap.size} Han Viet prefixes.`);
}

function getHanViet(word: string): string {
    return Array.from(word).map(char => hanvietMap.get(char) || char).join(' ');
}

// Map HSK file level to integer
const HSK_LEVELS = [1, 2, 3, 4, 5, 6];

async function ingestHSK() {
    console.log('Starting HSK Ingestion...');
    
    // Create HSK Topics (one for each level)
    const topicMap = new Map<number, any>();
    for (const level of HSK_LEVELS) {
        const topic = new Topic({
            title: `HSK ${level}`,
            title_vi: `Từ vựng HSK ${level}`,
            description_vi: `Danh sách từ vựng chuẩn HSK cấp độ ${level}`,
            color: '#d4a843',
            standard: 'HSK',
            level: level.toString()
        });
        await topic.save();
        topicMap.set(level, topic);
        console.log(`Created Topic: HSK ${level}`);
    }

    // Process each HSK file
    for (const level of HSK_LEVELS) {
        const filePath = path.join(HSK_DIR, `hsk-level-${level}.json`);
        if (!fs.existsSync(filePath)) {
            console.warn(`File not found: ${filePath}`);
            continue;
        }

        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const vocabDocs = [];
        for (const item of data) {
            const simp = item.hanzi;
            const dictEntry = simplifiedMap.get(simp);
            const trad = dictEntry ? dictEntry.traditional : simp;
            const meaning_vi = dictEntry ? dictEntry.meaning_vi : item.translations.join('; ');
            const han_viet = getHanViet(trad);

            vocabDocs.push(new Vocabulary({
                traditional: trad,
                simplified: simp,
                pinyin: item.pinyin,
                zhuyin: '', 
                meaning_vi: meaning_vi,
                han_viet: han_viet,
                hsk_level: level
            }));
        }
        
        const insertedVocabs = await Vocabulary.insertMany(vocabDocs);
        const vocabIds = insertedVocabs.map(v => v._id);

        // Chunk vocabulary into Lessons (50 words per lesson)
        const chunkSize = 50;
        let lessonOrder = 1;
        const lessonDocs = [];
        for (let i = 0; i < vocabIds.length; i += chunkSize) {
            const chunk = vocabIds.slice(i, i + chunkSize);
            lessonDocs.push(new Lesson({
                topic_id: topicMap.get(level)._id,
                order: lessonOrder,
                title: `Bài ${lessonOrder} - HSK ${level}`,
                description_vi: `50 từ vựng phần ${lessonOrder}`,
                vocabulary_refs: chunk
            }));
            lessonOrder++;
        }
        await Lesson.insertMany(lessonDocs);
        console.log(`Ingested ${vocabIds.length} words for HSK ${level}`);
    }
}

async function ingestTOCFL() {
    console.log('Starting TOCFL Ingestion...');
    
    if (!fs.existsSync(TOCFL_PATH)) {
        console.warn(`TOCFL file not found: ${TOCFL_PATH}`);
        return;
    }

    const tocflContent = fs.readFileSync(TOCFL_PATH, 'utf-8');
    const lines = tocflContent.split('\n').filter(l => l.trim().length > 0);
    
    // TOCFL Categories
    const categories = new Set<string>();
    const vocabByCategory = new Map<string, any[]>();

    for (const line of lines) {
        try {
            const item = JSON.parse(line);
            categories.add(item.category);
            if (!vocabByCategory.has(item.category)) {
                vocabByCategory.set(item.category, []);
            }
            vocabByCategory.get(item.category)!.push(item);
        } catch (e) {
            // ignore JSON parse error for bad lines
        }
    }

    // Example categories: '基礎', '進階', etc. Map them to Band A, Band B, etc.
    // For simplicity, we'll just use the category name directly as level.
    const topicMap = new Map<string, any>();
    for (const cat of categories) {
        const topic = new Topic({
            title: `TOCFL ${cat}`,
            title_vi: `Từ vựng TOCFL: ${cat}`,
            description_vi: `Danh sách từ vựng chuẩn TOCFL phần ${cat}`,
            color: '#5cb270',
            standard: 'TOCFL',
            level: cat
        });
        await topic.save();
        topicMap.set(cat, topic);
        console.log(`Created Topic: TOCFL ${cat}`);
    }

    for (const [cat, words] of vocabByCategory.entries()) {
        const vocabDocs = [];
        for (const item of words) {
            const trad = item.text;
            const dictEntry = traditionalMap.get(trad);
            const simp = dictEntry ? dictEntry.simplified : trad;
            const meaning_vi = dictEntry ? dictEntry.meaning_vi : '(Cần cập nhật nghĩa)';
            const han_viet = getHanViet(trad);

            vocabDocs.push(new Vocabulary({
                traditional: trad,
                simplified: simp,
                pinyin: item.pinyin || '',
                zhuyin: item.zhuyin || '',
                meaning_vi: meaning_vi,
                han_viet: han_viet,
                tocfl_level: 0
            }));
        }

        const insertedVocabs = await Vocabulary.insertMany(vocabDocs);
        const vocabIds = insertedVocabs.map(v => v._id);

        const chunkSize = 50;
        let lessonOrder = 1;
        const lessonDocs = [];
        for (let i = 0; i < vocabIds.length; i += chunkSize) {
            const chunk = vocabIds.slice(i, i + chunkSize);
            lessonDocs.push(new Lesson({
                topic_id: topicMap.get(cat)._id,
                order: lessonOrder,
                title: `Bài ${lessonOrder} - ${cat}`,
                description_vi: `50 từ vựng phần ${lessonOrder}`,
                vocabulary_refs: chunk
            }));
            lessonOrder++;
        }
        await Lesson.insertMany(lessonDocs);
        console.log(`Ingested ${vocabIds.length} words for TOCFL ${cat}`);
    }
}

const THEMATIC_TOPICS = [
    {
        id: "theme-1",
        title: "Giao tiếp cơ bản",
        title_vi: "Chào hỏi hàng ngày",
        description_vi: "Những từ vựng cơ bản nhất để bắt đầu trò chuyện",
        color: "#fa8072",
        words: ["你好", "您好", "对不起", "没关系", "谢谢", "不客气", "再见", "请", "欢迎", "什么", "怎么", "谁"]
    },
    {
        id: "theme-2",
        title: "Gia đình & Xưng hô",
        title_vi: "Gia đình & Xưng hô",
        description_vi: "Học cách gọi tên các thành viên trong gia đình",
        color: "#ffa07a",
        words: ["爸爸", "妈妈", "哥哥", "姐姐", "弟弟", "妹妹", "爷爷", "奶奶", "家", "人", "孩子", "朋友", "先生"]
    },
    {
        id: "theme-3",
        title: "Ăn uống & Ẩm thực",
        title_vi: "Ăn uống & Ẩm thực",
        description_vi: "Từ vựng thường dùng trong nhà hàng và quán ăn",
        color: "#20b2aa",
        words: ["吃", "喝", "水", "茶", "米饭", "面条", "苹果", "菜", "饭店", "服务员", "杯子", "咖啡", "牛奶", "牛肉", "鱼", "羊肉"]
    },
    {
        id: "theme-4",
        title: "Thời gian & Ngày",
        title_vi: "Thời gian & Ngày",
        description_vi: "Nói về thời gian, các ngày trong tuần và tháng th",
        color: "#778899",
        words: ["今天", "明天", "昨天", "现在", "时候", "点", "分", "月", "日", "星期", "年", "早上", "晚上", "上午", "下午", "小时", "分钟"]
    },
    {
        id: "theme-5",
        title: "Mua sắm & Tiền",
        title_vi: "Mua sắm & Tiền bạc",
        description_vi: "Hỏi giá và các mệnh giá tiền tệ",
        color: "#dda0dd",
        words: ["钱", "块", "买", "卖", "多少", "贵", "便宜", "商店", "衣服", "东西", "百", "千", "万"]
    },
    {
        id: "theme-6",
        title: "Du lịch & Đi lại",
        title_vi: "Du lịch & Đi lại",
        description_vi: "Phương tiện giao thông và tìm đường",
        color: "#87ceeb",
        words: ["去", "来", "回", "坐", "飞机", "出租车", "火车站", "车", "里", "路", "远", "近", "宾馆", "机场"]
    }
];

async function ingestThematicTopics() {
    console.log('Starting Thematic Topics Ingestion...');
    
    for (const theme of THEMATIC_TOPICS) {
        const topic = new Topic({
            title: theme.title,
            title_vi: theme.title_vi,
            description_vi: theme.description_vi,
            color: theme.color,
            standard: 'THEME',
            level: 'ALL'
        });
        await topic.save();
        console.log(`Created Topic: THEME ${theme.title}`);

        const vocabDocs = [];
        for (const wordStr of theme.words) {
            // Find in dictionary 
            const dictEntry = simplifiedMap.get(wordStr) || traditionalMap.get(wordStr);
            if (dictEntry) {
                vocabDocs.push(new Vocabulary({
                    traditional: dictEntry.traditional,
                    simplified: dictEntry.simplified,
                    pinyin: dictEntry.pinyin || '',
                    zhuyin: '',
                    meaning_vi: dictEntry.meaning_vi,
                    han_viet: getHanViet(dictEntry.traditional),
                    theme_level: 1
                }));
            } else {
                vocabDocs.push(new Vocabulary({
                    traditional: wordStr,
                    simplified: wordStr,
                    pinyin: '',
                    zhuyin: '',
                    meaning_vi: '(Cần bổ sung nghĩa)',
                    han_viet: getHanViet(wordStr),
                    theme_level: 1
                }));
            }
        }

        const insertedVocabs = await Vocabulary.insertMany(vocabDocs);
        const vocabIds = insertedVocabs.map(v => v._id);

        await Lesson.create({
            topic_id: topic._id,
            order: 1,
            title: `Bài học: ${theme.title}`,
            description_vi: theme.description_vi,
            vocabulary_refs: vocabIds
        });
    }
}

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learning-chinese');
        console.log('MongoDB Connected');

        // Clear existing DB
        await Topic.deleteMany({});
        await Lesson.deleteMany({});
        await Vocabulary.deleteMany({});
        console.log('Cleared existing collections (Topic, Lesson, Vocabulary).');

        await loadDictionaries();
        await ingestHSK();
        await ingestTOCFL();
        await ingestThematicTopics();

        console.log('Database seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedDatabase();
