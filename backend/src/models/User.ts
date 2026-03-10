import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  password?: string;
  role: 'user' | 'admin';
  telegramChatId?: string;
  telegramUsername?: string;
  points: number;
  streak: number;
  lastQuizDate?: Date;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  telegramChatId: { type: String },
  telegramUsername: { type: String },
  points: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastQuizDate: { type: Date }
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
