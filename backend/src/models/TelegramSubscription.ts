import mongoose, { Schema, Document } from 'mongoose';

export interface ITelegramSubscription extends Document {
  userId: mongoose.Types.ObjectId;
  telegramChatId: string;
  telegramUsername?: string;
  isActive: boolean;
  timezone: string;
  reminderTime: string; // HH:mm format, e.g., "20:00"
  subscribedAt: Date;
  unsubscribedAt?: Date;
}

const TelegramSubscriptionSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  telegramChatId: { type: String, required: true, unique: true },
  telegramUsername: { type: String },
  isActive: { type: Boolean, default: true },
  timezone: { type: String, default: 'Asia/Ho_Chi_Minh' },
  reminderTime: { type: String, default: '20:00' },
  subscribedAt: { type: Date, default: Date.now },
  unsubscribedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model<ITelegramSubscription>('TelegramSubscription', TelegramSubscriptionSchema);
