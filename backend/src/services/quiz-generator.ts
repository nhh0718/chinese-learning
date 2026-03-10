import Vocabulary from '../models/Vocabulary';
import DailyQuiz, { IQuizQuestion, IDailyQuiz } from '../models/DailyQuiz';

const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Topic rotation based on day of week - using HSK levels
const TOPIC_ROTATION = [
  { name: 'Greetings (Chào hỏi)', level: 1 },
  { name: 'Numbers (Số đếm)', level: 1 },
  { name: 'Family (Gia đình)', level: 1 },
  { name: 'Time (Thời gian)', level: 1 },
  { name: 'Food (Thức ăn)', level: 1 },
  { name: 'Travel (Du lịch)', level: 2 },
  { name: 'Shopping (Mua sắm)', level: 2 }
];

function getTopicForToday(): { name: string; level: number } {
  const dayOfWeek = new Date().getDay();
  return TOPIC_ROTATION[dayOfWeek];
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateOptions(correctAnswer: string, allMeanings: string[]): string[] {
  const options = [correctAnswer];
  const availableMeanings = allMeanings.filter(m => m !== correctAnswer);

  // Shuffle and take 3 wrong answers
  const wrongAnswers = shuffleArray(availableMeanings).slice(0, 3);
  options.push(...wrongAnswers);

  return shuffleArray(options);
}

export async function generateDailyQuiz(vocabularyCount: number = 15): Promise<IDailyQuiz | null> {
  const today = getTodayDateString();

  // Check if quiz already exists for today
  const existingQuiz = await DailyQuiz.findOne({ date: today });
  if (existingQuiz) {
    console.log(`[QuizGenerator] Quiz already exists for ${today}`);
    return existingQuiz;
  }

  // Get topic for today
  const topicInfo = getTopicForToday();

  // Get vocabulary based on HSK level
  let vocabulary = await Vocabulary.find({ hsk_level: topicInfo.level });

  // If not enough vocabulary, get any vocabulary
  if (vocabulary.length < vocabularyCount) {
    vocabulary = await Vocabulary.find().limit(50);
  }

  if (vocabulary.length === 0) {
    console.log('[QuizGenerator] No vocabulary found');
    return null;
  }

  // Shuffle and select vocabulary
  const selectedVocab = shuffleArray(vocabulary).slice(0, Math.min(vocabularyCount, vocabulary.length));

  // Get all meanings for generating wrong options
  const allMeanings = vocabulary.map(v => v.meaning_vi);

  // Generate questions
  const questions: IQuizQuestion[] = selectedVocab.map(vocab => {
    const options = generateOptions(vocab.meaning_vi, allMeanings);

    return {
      vocabularyId: vocab._id as any,
      question: `Từ "${vocab.simplified}" có nghĩa là gì?`,
      questionChinese: `${vocab.simplified} (${vocab.pinyin})`,
      options,
      correctAnswer: vocab.meaning_vi,
      explanation: `${vocab.simplified} = ${vocab.meaning_vi}`
    };
  });

  // Create daily quiz
  const dailyQuiz = await DailyQuiz.create({
    date: today,
    topicId: null as any,
    topicName: topicInfo.name,
    vocabularyCount: selectedVocab.length,
    questions
  });

  console.log(`[QuizGenerator] Generated quiz for ${today}, topic: ${topicInfo.name}, questions: ${questions.length}`);
  return dailyQuiz;
}

// Export for manual triggering
export async function generateQuizNow() {
  return generateDailyQuiz(15);
}
