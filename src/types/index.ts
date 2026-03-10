// ===== Core Data Types =====
// All types mirror expected backend API responses

export interface Topic {
  id: string;
  title: string;           // Chinese title e.g. "打招呼"
  subtitle: string;        // Translation e.g. "Greetings"
  description: string;
  icon: string;            // Emoji icon
  lessonCount: number;
  order: number;
  coverImage?: string;
  color?: string;          // Accent color for topic theming
}

export interface Lesson {
  id: string;
  topicId: string;
  title: string;           // e.g. "基本問候 — Basic Greetings"
  description: string;
  order: number;
  vocabulary: Vocabulary[];
  sentences: Sentence[];
  exercises: Exercise[];
  culturalNote?: string;
}

export interface Vocabulary {
  id: string;
  character: string;       // 你好
  pinyin: string;          // nǐ hǎo
  zhuyin: string;          // ㄋㄧˇ ㄏㄠˇ
  meaning: string;         // Hello
  meaningVi?: string;      // Xin chào (Vietnamese)
  audioUrl?: string;
  exampleSentences: string[];
}

export interface Sentence {
  id: string;
  chinese: string;         // 你好！你叫什麼名字？
  pinyin: string;
  zhuyin: string;
  translation: string;
  audioUrl?: string;
}

export type ExerciseType = 'multiple_choice' | 'fill_blank' | 'matching';

export interface Exercise {
  id: string;
  type: ExerciseType;
  question: string;
  questionChinese?: string;
  options?: string[];
  correctAnswer: string;
  pairs?: MatchingPair[];   // For matching exercises
  explanation?: string;
}

export interface MatchingPair {
  chinese: string;
  meaning: string;
}

export interface UserProgress {
  topicId: string;
  lessonId: string;
  completed: boolean;
  score: number;
  lastStudied: string;     // ISO date string
  masteryLevel: number;    // 0-5
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt: string;
}

export interface DailyWord {
  character: string;
  pinyin: string;
  zhuyin: string;
  meaning: string;
  exampleSentence: string;
  exampleTranslation: string;
}

// ===== Telegram Daily Vocabulary Types =====

export interface DailyQuizQuestion {
  _id: string;
  vocabularyId: string;
  question: string;
  questionChinese?: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface DailyQuiz {
  _id: string;
  date: string;
  topicId: string | null;
  topicName: string;
  vocabularyCount: number;
  questions: DailyQuizQuestion[];
}

export interface TelegramProgress {
  points: number;
  streak: number;
  lastQuizDate?: string;
  todayCompleted: boolean;
  telegramConnected: boolean;
}

export interface TelegramSubscription {
  isSubscribed: boolean;
  reminderTime?: string;
  timezone?: string;
}
