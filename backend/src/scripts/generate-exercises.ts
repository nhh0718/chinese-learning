import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Models
import Lesson from '../models/Lesson';
import Vocabulary from '../models/Vocabulary';
import Exercise from '../models/Exercise';

dotenv.config();

function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const generateExercises = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learning-chinese');
        console.log('MongoDB Connected');

        const totalLessons = await Lesson.countDocuments({});
        console.log(`Found ${totalLessons} lessons to generate exercises for.`);

        let processedCount = 0;
        let exerciseDocs = [];
        const batchSize = 50;

        for (let skip = 0; skip < totalLessons; skip += batchSize) {
            const lessons = await Lesson.find({}).skip(skip).limit(batchSize).exec();
            
            for (let index = 0; index < lessons.length; index++) {
                try {
                    const lesson = lessons[index];
                    if (!lesson || !lesson.vocabulary_refs || lesson.vocabulary_refs.length < 4) {
                        continue;
                    }

                    // Manually fetch vocabs to avoid strictly typed Mongoose populate bugs
                    const vocabIds = lesson.vocabulary_refs;
                    const vocabs = await Vocabulary.find({ _id: { $in: vocabIds } }).exec();

                    if (!vocabs || vocabs.length < 4) continue;

                    for (let i = 0; i < Math.min(3, vocabs.length); i++) {
                        const target = vocabs[i];
                        if (!target || !target.meaning_vi) continue;
                        
                        const distractors = vocabs.filter(v => v && v._id && v._id.toString() !== target._id.toString());
                        shuffleArray(distractors);
                        
                        const validDistractors = distractors.filter(d => d && d.meaning_vi).slice(0, 3);
                        if (validDistractors.length < 3) continue;

                        const options = [target.meaning_vi, ...validDistractors.map(d => d.meaning_vi)];
                        shuffleArray(options);

                        exerciseDocs.push(new Exercise({
                            lesson_id: lesson._id,
                            type: 'multiple_choice',
                            question: `Nghĩa của từ "${target.traditional}" (${target.pinyin || ''}) là gì?`,
                            questionChinese: target.traditional,
                            options: options,
                            correctAnswer: target.meaning_vi,
                            order: i + 1
                        }));
                    }

                    const matchVocabs = [...vocabs].filter(v => v && v.meaning_vi);
                    if (matchVocabs.length < 4) continue;
                    
                    shuffleArray(matchVocabs);
                    const selectedMatch = matchVocabs.slice(0, 4);

                    const matchingPairs = selectedMatch.map(v => ({
                        chinese: v.traditional,
                        meaning: v.meaning_vi
                    }));

                    exerciseDocs.push(new Exercise({
                        lesson_id: lesson._id,
                        type: 'matching',
                        question: 'Nối từ tiếng Trung với nghĩa tiếng Việt tương ứng',
                        correctAnswer: 'MATCHING_MODE',
                        pairs: matchingPairs,
                        order: 4
                    }));

                    processedCount++;
                } catch(e) {
                    console.error('Error on lesson', lessons[index]);
                    console.error(e);
                    throw e;
                }
            }

            if (exerciseDocs.length > 0) {
                await Exercise.insertMany(exerciseDocs);
                exerciseDocs = [];
            }
        }
        
        console.log(`Auto-generated exercises for ${processedCount} lessons.`);

        console.log('Exercise Auto-generation completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Generation error:', error);
        process.exit(1);
    }
};

generateExercises();
