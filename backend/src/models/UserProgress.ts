import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProgress extends Document {
  user_id: mongoose.Types.ObjectId;
  lesson_id: mongoose.Types.ObjectId;
  topic_id: mongoose.Types.ObjectId;
  completed: boolean;
  score: number;
  mastery_level: number;
}

const UserProgressSchema: Schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lesson_id: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
  topic_id: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  completed: { type: Boolean, default: false },
  score: { type: Number, default: 0 },
  mastery_level: { type: Number, default: 0 }
}, { timestamps: true });

// Prevent a user from having multiple progress records for the same lesson
UserProgressSchema.index({ user_id: 1, lesson_id: 1 }, { unique: true });

export default mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);
