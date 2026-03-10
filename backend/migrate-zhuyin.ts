import mongoose from 'mongoose';
import pinyin from 'pinyin';
import Vocabulary from './src/models/Vocabulary';
import dotenv from 'dotenv';
dotenv.config();

async function migrateZhuyin() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected.');

        const vocabs = await Vocabulary.find({ zhuyin: { $in: [null, ''] } });
        console.log(`Found ${vocabs.length} vocabularies missing zhuyin.`);

        let updated = 0;
        for (const vocab of vocabs) {
            // Convert traditional or simplified hanzi to bopomofo
            const hanzi = vocab.traditional || vocab.simplified || vocab.character;
            if (!hanzi) continue;

            // Generate Bopomofo
            // @ts-ignore
            const bopoArray: string[][] = pinyin(hanzi, { style: pinyin.STYLE_BOPOMOFO });
            // pinyin returns an array of arrays: [ [ 'ㄅㄚ' ], [ 'ㄅㄚ' ] ]
            const zhuyinStr = bopoArray.map((arr: string[]) => arr[0]).join(' ');

            if (zhuyinStr) {
                vocab.zhuyin = zhuyinStr;
                await vocab.save();
                updated++;
                if (updated % 500 === 0) {
                    console.log(`Updated ${updated} vocabularies...`);
                }
            }
        }

        console.log(`Successfully migrated ${updated} missing zhuyin entries!`);

    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

migrateZhuyin();
