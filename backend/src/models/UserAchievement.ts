import mongoose, { Schema, Document } from 'mongoose';

export interface IUserAchievement extends Document {
  user_id: mongoose.Types.ObjectId;
  achievement_key: string;
  earned_at: Date;
}

const UserAchievementSchema: Schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  achievement_key: { type: String, required: true },
  earned_at: { type: Date, default: Date.now }
});

UserAchievementSchema.index({ user_id: 1, achievement_key: 1 }, { unique: true });

export default mongoose.model<IUserAchievement>('UserAchievement', UserAchievementSchema);
