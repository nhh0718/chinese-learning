import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Topic from '../models/Topic';
import Lesson from '../models/Lesson';
import Vocabulary from '../models/Vocabulary';
import connectDB from '../config/db';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const topicsData = [
    { id: 'greetings', title: '打招呼', title_vi: 'Chào hỏi', description_vi: 'Chào hỏi cơ bản và giới thiệu bản thân bằng tiếng Trung.', color: '#5cb270' },
    { id: 'numbers', title: '數字', title_vi: 'Chữ số', description_vi: 'Học cách đếm, nói tuổi và giá cả thương mại.', color: '#7ec98e' },
    { id: 'food', title: '食物', title_vi: 'Thức ăn', description_vi: 'Từ vựng cần thiết để gọi món tại nhà hàng và chợ đêm.', color: '#d4a843' },
    { id: 'daily-life', title: '日常生活', title_vi: 'Đời sống hàng ngày', description_vi: 'Hoạt động hàng ngày, thói quen và các biểu thức thời gian.', color: '#e07a5f' },
    { id: 'travel', title: '旅行', title_vi: 'Du lịch', description_vi: 'Chỉ đường, giao thông và đặt phòng.', color: '#6bbcd4' },
    { id: 'shopping', title: '購物', title_vi: 'Mua sắm', description_vi: 'Quần áo, trả giá và giao dịch cơ bản.', color: '#ace1af' },
];

const seedLessons = async () => {
    await connectDB();
    console.log('Clearing old topics and lessons...');
    await Topic.deleteMany({});
    await Lesson.deleteMany({});

    // 1. Create Topics
    console.log('Inserting Topics...');
    const insertedTopics: Record<string, any> = {};
    for (const t of topicsData) {
        const doc = await Topic.create({
            title: t.title,
            title_vi: t.title_vi,
            description_vi: t.description_vi,
            color: t.color
        });
        insertedTopics[t.id] = doc._id;
    }

    // 2. Query some basic vocabulary to link to lessons
    const nihao = await Vocabulary.findOne({ pinyin: /ni3 hao3/i });
    const xiexie = await Vocabulary.findOne({ pinyin: /xie4 xie5/i });
    const yi = await Vocabulary.findOne({ traditional: '一' });
    const er = await Vocabulary.findOne({ traditional: '二' });

    // 3. Create Sample Lessons
    console.log('Inserting Lessons...');
    const lessonsData = [
        {
            topic_id: insertedTopics['greetings'],
            order: 1,
            title: '基本問候',
            description_vi: 'Chào hỏi và tạm biệt cơ bản',
            vocabulary_refs: [nihao?._id, xiexie?._id].filter(Boolean)
        },
        {
            topic_id: insertedTopics['greetings'],
            order: 2,
            title: '自我介紹',
            description_vi: 'Giới thiệu bản thân và hỏi thăm người khác',
            vocabulary_refs: [] // empty for now
        },
        {
            topic_id: insertedTopics['numbers'],
            order: 1,
            title: '一到十',
            description_vi: 'Đếm từ một đến mười',
            vocabulary_refs: [yi?._id, er?._id].filter(Boolean)
        }
    ];

    await Lesson.insertMany(lessonsData);
    console.log('Topics and Lessons seeded successfully!');
    process.exit(0);
};

seedLessons().catch(err => {
    console.error(err);
    process.exit(1);
});
