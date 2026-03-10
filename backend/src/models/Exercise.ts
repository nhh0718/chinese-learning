import mongoose, { Schema, Document } from 'mongoose';

export interface IExercise extends Document {
  lesson_id: mongoose.Types.ObjectId;
  type: 'multiple_choice' | 'matching' | 'fill_blank';
  question: string;
  questionChinese?: string;
  options?: string[];
  correctAnswer: string;
  pairs?: { chinese: string; meaning: string }[];
  explanation?: string;
}

const ExerciseSchema: Schema = new Schema({
  lesson_id: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true, index: true },
  type: { type: String, enum: ['multiple_choice', 'matching', 'fill_blank'], required: true },
  question: { type: String, required: true },
  questionChinese: { type: String },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true }, // We can make this optional later if needed, but required is fine for now (we can just provide an empty string for matching)
  pairs: [{
    chinese: { type: String },
    meaning: { type: String }
  }],
  explanation: { type: String }
});

export default mongoose.model<IExercise>('Exercise', ExerciseSchema);
