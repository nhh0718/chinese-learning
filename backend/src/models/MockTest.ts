import mongoose, { Schema, Document } from 'mongoose';

export interface IMockQuestion {
  type: 'vocab_meaning' | 'vocab_pinyin' | 'listening_meaning' | 'listening_character' | 'fill_blank' | 'reading_comprehension';
  question: string;
  questionChinese?: string;
  // For listening questions, frontend uses TTS with this text
  audioText?: string;
  // For reading questions, the passage to display
  passage?: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface IMockSection {
  type: 'listening' | 'reading' | 'vocabulary';
  weight: number;
  questions: IMockQuestion[];
}

export interface IMockTest extends Document {
  title: string;
  standard: 'HSK' | 'TOCFL';
  level: number;
  duration_minutes: number;
  sections: IMockSection[];
  total_questions: number;
}

const MockQuestionSchema = new Schema({
  type: { type: String, required: true },
  question: { type: String, required: true },
  questionChinese: String,
  audioText: String,
  passage: String,
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
  explanation: String
}, { _id: false });

const MockSectionSchema = new Schema({
  type: { type: String, enum: ['listening', 'reading', 'vocabulary'], required: true },
  weight: { type: Number, required: true },
  questions: [MockQuestionSchema]
}, { _id: false });

const MockTestSchema: Schema = new Schema({
  title: { type: String, required: true },
  standard: { type: String, enum: ['HSK', 'TOCFL'], required: true },
  level: { type: Number, required: true, index: true },
  duration_minutes: { type: Number, required: true },
  sections: [MockSectionSchema],
  total_questions: { type: Number, required: true }
}, { timestamps: true });

MockTestSchema.index({ standard: 1, level: 1 });

export default mongoose.model<IMockTest>('MockTest', MockTestSchema);
