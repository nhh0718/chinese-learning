import mongoose, { Schema, Document } from 'mongoose';

export interface ITopic extends Document {
    title: string;
    title_vi: string;
    description_vi: string;
    color: string;
    standard: 'HSK' | 'TOCFL' | 'THEME';
    level: string; // e.g., 'A1', 'Band A', 'Level 1'
}

const TopicSchema: Schema = new Schema({
    title: { type: String, required: true },
    title_vi: { type: String, required: true },
    description_vi: { type: String, required: true },
    color: { type: String, default: '#5cb270' },
    standard: { type: String, enum: ['HSK', 'TOCFL', 'THEME'], required: true },
    level: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<ITopic>('Topic', TopicSchema);
