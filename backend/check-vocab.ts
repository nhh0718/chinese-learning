import mongoose from 'mongoose';
import Vocabulary from './src/models/Vocabulary';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        const v1 = await Vocabulary.findOne({ traditional: '哥哥' });
        console.log('哥哥:', v1);

        const v2 = await Vocabulary.findOne({ traditional: '媽媽' });
        console.log('媽媽:', v2);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
check();
