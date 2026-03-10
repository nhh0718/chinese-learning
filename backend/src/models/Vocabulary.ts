import mongoose, { Schema, Document } from 'mongoose';

export interface IVocabulary extends Document {
    traditional: string;
    simplified: string;
    pinyin: string;
    zhuyin: string;
    meaning_vi: string;
    han_viet: string;
    hsk_level?: number;
    tocfl_level?: number;
}

const VocabularySchema: Schema = new Schema({
    traditional: { type: String, required: true, index: true },
    simplified: { type: String, required: true, index: true },
    pinyin: { type: String, required: true, index: true },
    zhuyin: { type: String },
    meaning_vi: { type: String, required: true },
    han_viet: { type: String },
    hsk_level: { type: Number },
    tocfl_level: { type: Number }
}, { timestamps: true });

export default mongoose.model<IVocabulary>('Vocabulary', VocabularySchema);
