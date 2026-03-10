import mongoose, { Schema, Document } from 'mongoose';

export interface ISentence extends Document {
  lesson_id: mongoose.Types.ObjectId;
  chinese: string;
  pinyin: string;
  zhuyin: string;
  translation: string;
  vocabulary_refs?: mongoose.Types.ObjectId[];
}

const SentenceSchema: Schema = new Schema({
  lesson_id: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true, index: true },
  chinese: { type: String, required: true },
  pinyin: { type: String },
  zhuyin: { type: String },
  translation: { type: String, required: true },
  vocabulary_refs: [{ type: Schema.Types.ObjectId, ref: 'Vocabulary' }]
});

export default mongoose.model<ISentence>('Sentence', SentenceSchema);
