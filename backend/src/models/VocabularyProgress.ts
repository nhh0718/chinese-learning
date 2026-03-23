import mongoose, { Schema, Document } from 'mongoose';

// FSRS card states
export type FSRSState = 'New' | 'Learning' | 'Review' | 'Relearning';

export interface IVocabularyProgress extends Document {
  user_id: mongoose.Types.ObjectId;
  vocabulary_id: mongoose.Types.ObjectId;
  // FSRS algorithm fields
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: FSRSState;
  last_review: Date | null;
  due: Date;
  // App fields
  is_bookmarked: boolean;
}

const VocabularyProgressSchema: Schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  vocabulary_id: { type: Schema.Types.ObjectId, ref: 'Vocabulary', required: true },
  // FSRS fields
  stability: { type: Number, default: 0 },
  difficulty: { type: Number, default: 0 },
  elapsed_days: { type: Number, default: 0 },
  scheduled_days: { type: Number, default: 0 },
  reps: { type: Number, default: 0 },
  lapses: { type: Number, default: 0 },
  state: { type: String, enum: ['New', 'Learning', 'Review', 'Relearning'], default: 'New' },
  last_review: { type: Date, default: null },
  due: { type: Date, default: Date.now },
  // App fields
  is_bookmarked: { type: Boolean, default: false }
}, { timestamps: true });

// Compound unique index: one progress record per user per word
VocabularyProgressSchema.index({ user_id: 1, vocabulary_id: 1 }, { unique: true });
// Index for efficient due card queries
VocabularyProgressSchema.index({ user_id: 1, due: 1 });

export default mongoose.model<IVocabularyProgress>('VocabularyProgress', VocabularyProgressSchema);
