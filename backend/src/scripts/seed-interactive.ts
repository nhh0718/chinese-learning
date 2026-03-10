import path from 'path';
import dotenv from 'dotenv';
import Lesson from '../models/Lesson';
import Sentence from '../models/Sentence';
import Exercise from '../models/Exercise';
import connectDB from '../config/db';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const seedInteractiveData = async () => {
  await connectDB();
  console.log('Clearing old sentences and exercises...');
  await Sentence.deleteMany({});
  await Exercise.deleteMany({});

  console.log('Fetching Lessons...');
  const greetings1 = await Lesson.findOne({ title: '基本問候' });
  const numbers1 = await Lesson.findOne({ title: '一到十' });

  if (greetings1) {
    console.log('Seeding Greetings 1 interactive content...');
    
    // Sentences
    await Sentence.insertMany([
      {
        lesson_id: greetings1._id,
        chinese: '你好！你叫什麼名字？',
        pinyin: 'nǐ hǎo! nǐ jiào shén me míng zi?',
        zhuyin: 'ㄋㄧˇ ㄏㄠˇ！ㄋㄧˇ ㄐㄧㄠˋ ㄕㄣˊ ㄇㄜ˙ ㄇㄧㄥˊ ㄗ˙？',
        translation: 'Hello! What is your name?',
      },
      {
        lesson_id: greetings1._id,
        chinese: '謝謝你！不客氣。',
        pinyin: 'xiè xie nǐ! bú kè qi.',
        zhuyin: 'ㄒㄧㄝˋ ㄒㄧㄝ˙ ㄋㄧˇ！ㄅㄨˊ ㄎㄜˋ ㄑㄧ˙。',
        translation: 'Thank you! You are welcome.',
      }
    ]);

    // Exercises
    await Exercise.insertMany([
      {
        lesson_id: greetings1._id,
        type: 'multiple_choice',
        question: 'How do you say "Hello" in Chinese?',
        options: ['謝謝 (xiè xie)', '你好 (nǐ hǎo)', '再見 (zài jiàn)'],
        correctAnswer: '你好 (nǐ hǎo)'
      },
      {
        lesson_id: greetings1._id,
        type: 'matching',
        question: 'Match the pinyin with the correct characters:',
        options: JSON.stringify([
            { chinese: '你好', meaning: 'nǐ hǎo' },
            { chinese: '謝謝', meaning: 'xiè xie' }
        ]), // Storing matching as JSON string in options for simplicity
        correctAnswer: 'match_all'
      }
    ]);
  }

  if (numbers1) {
    console.log('Seeding Numbers 1 interactive content...');
    // Sentences
    await Sentence.insertMany([
      {
        lesson_id: numbers1._id,
        chinese: '一二三四五',
        pinyin: 'yī èr sān sì wǔ',
        zhuyin: 'ㄧ ㄦˋ ㄙㄢ ㄙˋ ㄨˇ',
        translation: 'One two three four five',
      }
    ]);

    // Exercises
    await Exercise.insertMany([
      {
        lesson_id: numbers1._id,
        type: 'multiple_choice',
        question: 'Which character means "Two"?',
        options: ['一 (yī)', '二 (èr)', '三 (sān)'],
        correctAnswer: '二 (èr)'
      }
    ]);
  }

  console.log('Sentences and Exercises seeded successfully!');
  process.exit(0);
};

seedInteractiveData().catch(err => {
  console.error(err);
  process.exit(1);
});
