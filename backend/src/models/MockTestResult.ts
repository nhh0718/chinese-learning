import mongoose, { Schema, Document } from 'mongoose';

export interface ISectionResult {
  type: string;
  score: number;
  total: number;
  answers: { questionIndex: number; answer: string; correct: boolean }[];
}

export interface IMockTestResult extends Document {
  user_id: mongoose.Types.ObjectId;
  test_id: mongoose.Types.ObjectId;
  started_at: Date;
  submitted_at: Date;
  time_spent_seconds: number;
  sections: ISectionResult[];
  total_score: number;
  total_possible: number;
  percentage: number;
}

const SectionResultSchema = new Schema({
  type: { type: String, required: true },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  answers: [{
    questionIndex: Number,
    answer: String,
    correct: Boolean
  }]
}, { _id: false });

const MockTestResultSchema: Schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  test_id: { type: Schema.Types.ObjectId, ref: 'MockTest', required: true },
  started_at: { type: Date, required: true },
  submitted_at: { type: Date, default: Date.now },
  time_spent_seconds: { type: Number, required: true },
  sections: [SectionResultSchema],
  total_score: { type: Number, required: true },
  total_possible: { type: Number, required: true },
  percentage: { type: Number, required: true }
}, { timestamps: true });

MockTestResultSchema.index({ user_id: 1, test_id: 1 });
MockTestResultSchema.index({ user_id: 1, submitted_at: -1 });

export default mongoose.model<IMockTestResult>('MockTestResult', MockTestResultSchema);
