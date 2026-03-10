import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizQuestion {
  vocabularyId: mongoose.Types.ObjectId;
  question: string;
  questionChinese?: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface IDailyQuiz extends Document {
  date: string; // YYYY-MM-DD format
  topicId: mongoose.Types.ObjectId;
  topicName: string;
  vocabularyCount: number;
  questions: IQuizQuestion[];
  createdAt: Date;
}

const QuizQuestionSchema: Schema = new Schema({
  vocabularyId: { type: Schema.Types.ObjectId, ref: 'Vocabulary', required: true },
  question: { type: String, required: true },
  questionChinese: { type: String },
  options: { type: [String], required: true },
  correctAnswer: { type: String, required: true },
  explanation: { type: String }
});

const DailyQuizSchema: Schema = new Schema({
  date: { type: String, required: true, unique: true }, // YYYY-MM-DD
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: false, default: null },
  topicName: { type: String, required: true },
  vocabularyCount: { type: Number, required: true },
  questions: { type: [QuizQuestionSchema], required: true }
}, { timestamps: true });

export default mongoose.model<IDailyQuiz>('DailyQuiz', DailyQuizSchema);
