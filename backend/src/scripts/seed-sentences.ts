import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Models
import Lesson from '../models/Lesson';
import Sentence from '../models/Sentence';

dotenv.config();

const DATA_DIR = path.join(__dirname, '../../data/raw/tatoeba');
const TATOEBA_JSON = path.join(DATA_DIR, 'tatoeba_cmn_vie.json');

const seedSentences = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learning-chinese');
        console.log('MongoDB Connected');

        if (!fs.existsSync(TATOEBA_JSON)) {
            console.warn(`File not found: ${TATOEBA_JSON}`);
            process.exit(1);
        }

        const rawData = fs.readFileSync(TATOEBA_JSON, 'utf-8');
        const sentencePairs = JSON.parse(rawData);
        console.log(`Loaded ${sentencePairs.length} sentence pairs from local Tatoeba JSON.`);

        // Clear existing sentences
        await Sentence.deleteMany({});
        console.log('Cleared existing sentences.');

        // Get all lessons to distribute sentences
        const lessons = await Lesson.find({}, '_id').exec();
        if (lessons.length === 0) {
            console.error('No lessons found. Please run seed-comprehensive.ts first.');
            process.exit(1);
        }

        const sentenceDocs = [];
        let lessonIndex = 0;

        for (const pair of sentencePairs) {
            const lessonId = lessons[lessonIndex]._id;
            
            sentenceDocs.push(new Sentence({
                lesson_id: lessonId,
                chinese: pair.chinese,
                pinyin: '', // Requires external library to parse accurate pinyin per character, keeping blank for now
                zhuyin: '',
                translation: pair.vietnamese,
                vocabulary_refs: [] // Advanced: find common vocab in sentence to map vocab_refs
            }));

            lessonIndex = (lessonIndex + 1) % lessons.length; // distribute evenly
        }

        await Sentence.insertMany(sentenceDocs);
        console.log(`Ingested ${sentenceDocs.length} sentences across ${lessons.length} lessons.`);

        console.log('Database sentences seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedSentences();
