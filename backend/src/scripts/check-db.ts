import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Topic from '../models/Topic';
import Lesson from '../models/Lesson';
import Vocabulary from '../models/Vocabulary';
import Exercise from '../models/Exercise';

dotenv.config();

async function checkDb() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learning-chinese');
    
    console.log('--- Stats ---');
    console.log('Total Topics:', await Topic.countDocuments());
    console.log('Total Lessons:', await Lesson.countDocuments());
    console.log('Total Vocabulary:', await Vocabulary.countDocuments());
    console.log('Total Exercises:', await Exercise.countDocuments());

    console.log('\n--- HSK Topics ---');
    const hskTopics = await Topic.find({ standard: 'HSK' }).sort({ level: 1 });
    for (const t of hskTopics) {
        const lessons = await Lesson.find({ topic_id: t._id });
        let vocabCount = 0;
        for(const l of lessons) vocabCount += l.vocabulary_refs.length;
        console.log(`- ${t.title} (${t.level}): ${lessons.length} lessons, ${vocabCount} vocabs`);
    }

    console.log('\n--- TOCFL Topics ---');
    const tocflTopics = await Topic.find({ standard: 'TOCFL' }).sort({ level: 1 });
    for (const t of tocflTopics) {
        const lessons = await Lesson.find({ topic_id: t._id });
        let vocabCount = 0;
        for(const l of lessons) vocabCount += l.vocabulary_refs.length;
        console.log(`- ${t.title} (${t.level}): ${lessons.length} lessons, ${vocabCount} vocabs`);
    }

    process.exit(0);
}

checkDb().catch(console.error);
