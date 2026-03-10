import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizResult extends Document {
  userId: mongoose.Types.ObjectId;
  quizId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  source: 'telegram' | 'web';
  completedAt: Date;
}

const QuizResultSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: Schema.Types.ObjectId, ref: 'DailyQuiz', required: true },
  date: { type: String, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  source: { type: String, enum: ['telegram', 'web'], default: 'web' },
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for fast lookups
QuizResultSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model<IQuizResult>('QuizResult', QuizResultSchema);
