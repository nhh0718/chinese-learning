import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILesson extends Document {
    topic_id: Types.ObjectId;
    order: number;
    title: string;
    description_vi: string;
    vocabulary_refs: Types.ObjectId[];
}

const LessonSchema: Schema = new Schema({
    topic_id: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
    order: { type: Number, required: true },
    title: { type: String, required: true },
    description_vi: { type: String, required: true },
    vocabulary_refs: [{ type: Schema.Types.ObjectId, ref: 'Vocabulary' }]
}, { timestamps: true });

export default mongoose.model<ILesson>('Lesson', LessonSchema);
