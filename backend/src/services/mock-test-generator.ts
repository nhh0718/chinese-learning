import Vocabulary from '../models/Vocabulary';
import MockTest from '../models/MockTest';
import type { IMockQuestion, IMockSection } from '../models/MockTest';

// HSK test config per level
const HSK_CONFIG: Record<number, { duration: number; vocabCount: number; listeningCount: number; readingCount: number }> = {
  1: { duration: 40, vocabCount: 10, listeningCount: 5, readingCount: 5 },
  2: { duration: 55, vocabCount: 12, listeningCount: 8, readingCount: 5 },
  3: { duration: 70, vocabCount: 15, listeningCount: 10, readingCount: 8 },
  4: { duration: 90, vocabCount: 20, listeningCount: 12, readingCount: 10 },
  5: { duration: 120, vocabCount: 20, listeningCount: 15, readingCount: 12 },
  6: { duration: 140, vocabCount: 25, listeningCount: 15, readingCount: 15 },
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function pickWrongOptions(correct: string, pool: string[], count: number = 3): string[] {
  const available = pool.filter(m => m !== correct);
  return shuffleArray(available).slice(0, count);
}

/**
 * Generate a mock test for a given HSK level.
 * Creates vocabulary, listening, and reading sections.
 */
export async function generateMockTest(level: number, testNumber: number = 1): Promise<void> {
  const config = HSK_CONFIG[level] || HSK_CONFIG[1];

  // Get vocabulary for this level (and lower levels as pool)
  const vocab = await Vocabulary.find({ hsk_level: { $lte: level } }).lean();
  if (vocab.length < 10) {
    console.log(`[MockTestGen] Not enough vocabulary for HSK ${level}`);
    return;
  }

  const levelVocab = vocab.filter(v => v.hsk_level === level);
  const allMeanings = vocab.map(v => v.meaning_vi);
  const allPinyin = vocab.map(v => v.pinyin);
  const allChars = vocab.map(v => v.traditional || v.simplified);

  const selected = shuffleArray(levelVocab.length >= config.vocabCount ? levelVocab : vocab);

  // --- Vocabulary Section ---
  const vocabQuestions: IMockQuestion[] = selected.slice(0, config.vocabCount).map((v, i) => {
    // Alternate between meaning and pinyin questions
    if (i % 2 === 0) {
      const wrong = pickWrongOptions(v.meaning_vi, allMeanings);
      return {
        type: 'vocab_meaning',
        question: `"${v.traditional || v.simplified}" có nghĩa là gì?`,
        questionChinese: `${v.traditional || v.simplified} (${v.pinyin})`,
        options: shuffleArray([v.meaning_vi, ...wrong]),
        correctAnswer: v.meaning_vi,
        explanation: `${v.traditional || v.simplified} = ${v.meaning_vi}`
      };
    } else {
      const wrong = pickWrongOptions(v.pinyin, allPinyin);
      return {
        type: 'vocab_pinyin',
        question: `Phiên âm của "${v.traditional || v.simplified}" là gì?`,
        questionChinese: v.traditional || v.simplified,
        options: shuffleArray([v.pinyin, ...wrong]),
        correctAnswer: v.pinyin,
        explanation: `${v.traditional || v.simplified} đọc là ${v.pinyin}`
      };
    }
  });

  // --- Listening Section ---
  const listeningVocab = shuffleArray(selected).slice(0, config.listeningCount);
  const listeningQuestions: IMockQuestion[] = listeningVocab.map((v, i) => {
    if (i % 2 === 0) {
      // Hear audio -> select meaning
      const wrong = pickWrongOptions(v.meaning_vi, allMeanings);
      return {
        type: 'listening_meaning',
        question: 'Nghe và chọn nghĩa đúng:',
        audioText: v.traditional || v.simplified,
        options: shuffleArray([v.meaning_vi, ...wrong]),
        correctAnswer: v.meaning_vi,
        explanation: `${v.traditional || v.simplified} (${v.pinyin}) = ${v.meaning_vi}`
      };
    } else {
      // Hear audio -> select correct character
      const wrong = pickWrongOptions(v.traditional || v.simplified, allChars);
      return {
        type: 'listening_character',
        question: 'Nghe và chọn chữ đúng:',
        audioText: v.traditional || v.simplified,
        options: shuffleArray([v.traditional || v.simplified, ...wrong]),
        correctAnswer: v.traditional || v.simplified,
        explanation: `Đáp án: ${v.traditional || v.simplified} (${v.pinyin})`
      };
    }
  });

  // --- Reading Section ---
  const readingVocab = shuffleArray(selected).slice(0, config.readingCount);
  const readingQuestions: IMockQuestion[] = readingVocab.map((v) => {
    const wrong = pickWrongOptions(v.meaning_vi, allMeanings);
    return {
      type: 'reading_comprehension',
      question: `Trong câu dưới đây, "${v.traditional || v.simplified}" có nghĩa là gì?`,
      passage: `${v.traditional || v.simplified}是一個常用的詞語。`,
      options: shuffleArray([v.meaning_vi, ...wrong]),
      correctAnswer: v.meaning_vi,
      explanation: `${v.traditional || v.simplified} = ${v.meaning_vi} (${v.pinyin})`
    };
  });

  const sections: IMockSection[] = [
    { type: 'listening', weight: 35, questions: listeningQuestions },
    { type: 'reading', weight: 35, questions: readingQuestions },
    { type: 'vocabulary', weight: 30, questions: vocabQuestions }
  ];

  const totalQuestions = listeningQuestions.length + readingQuestions.length + vocabQuestions.length;

  await MockTest.create({
    title: `HSK ${level} Mock Test #${testNumber}`,
    standard: 'HSK',
    level,
    duration_minutes: config.duration,
    sections,
    total_questions: totalQuestions
  });

  console.log(`[MockTestGen] Created HSK ${level} Mock Test #${testNumber} (${totalQuestions} questions)`);
}

/**
 * Seed mock tests for all HSK levels (2 tests each)
 */
export async function seedAllMockTests(): Promise<number> {
  let created = 0;
  for (let level = 1; level <= 6; level++) {
    const existing = await MockTest.countDocuments({ standard: 'HSK', level });
    const toCreate = Math.max(0, 2 - existing);
    for (let i = 0; i < toCreate; i++) {
      await generateMockTest(level, existing + i + 1);
      created++;
    }
  }
  return created;
}
