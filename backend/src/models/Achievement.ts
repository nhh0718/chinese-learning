import mongoose, { Schema, Document } from 'mongoose';

export interface IAchievement extends Document {
  key: string;
  title: string;
  title_vi: string;
  description: string;
  icon: string;
  category: 'learning' | 'streak' | 'exam' | 'social';
  condition: {
    type: string;
    threshold: number;
    level?: number;
  };
}

const AchievementSchema: Schema = new Schema({
  key: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  title_vi: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  category: { type: String, enum: ['learning', 'streak', 'exam', 'social'], required: true },
  condition: {
    type: { type: String, required: true },
    threshold: { type: Number, required: true },
    level: Number
  }
});

export default mongoose.model<IAchievement>('Achievement', AchievementSchema);

// --- Achievement definitions for seeding ---
export const ACHIEVEMENT_SEEDS = [
  { key: 'first_lesson', title: 'First Steps', title_vi: 'Bước đầu tiên', description: 'Complete your first lesson', icon: '🎯', category: 'learning', condition: { type: 'lessons_completed', threshold: 1 } },
  { key: 'vocab_50', title: 'Word Collector', title_vi: 'Người sưu tầm', description: 'Learn 50 vocabulary words', icon: '📚', category: 'learning', condition: { type: 'vocab_mastered', threshold: 50 } },
  { key: 'vocab_100', title: 'Bookworm', title_vi: 'Mọt sách', description: 'Learn 100 vocabulary words', icon: '📖', category: 'learning', condition: { type: 'vocab_mastered', threshold: 100 } },
  { key: 'vocab_500', title: 'Walking Dictionary', title_vi: 'Từ điển sống', description: 'Learn 500 vocabulary words', icon: '🏅', category: 'learning', condition: { type: 'vocab_mastered', threshold: 500 } },
  { key: 'streak_7', title: 'On Fire', title_vi: 'Cháy hết mình', description: 'Maintain a 7-day streak', icon: '🔥', category: 'streak', condition: { type: 'streak', threshold: 7 } },
  { key: 'streak_30', title: 'Unstoppable', title_vi: 'Không gì cản nổi', description: 'Maintain a 30-day streak', icon: '🏆', category: 'streak', condition: { type: 'streak', threshold: 30 } },
  { key: 'streak_100', title: 'Century', title_vi: 'Bách nhật', description: 'Maintain a 100-day streak', icon: '💎', category: 'streak', condition: { type: 'streak', threshold: 100 } },
  { key: 'reviews_100', title: 'Reviewer', title_vi: 'Ôn tập giỏi', description: 'Complete 100 card reviews', icon: '✅', category: 'learning', condition: { type: 'reviews', threshold: 100 } },
  { key: 'reviews_1000', title: 'Review Master', title_vi: 'Bậc thầy ôn tập', description: 'Complete 1000 card reviews', icon: '⭐', category: 'learning', condition: { type: 'reviews', threshold: 1000 } },
  { key: 'test_first', title: 'Test Taker', title_vi: 'Thí sinh', description: 'Complete your first mock test', icon: '📝', category: 'exam', condition: { type: 'tests_completed', threshold: 1 } },
  { key: 'test_perfect', title: 'Perfect Score', title_vi: 'Điểm tuyệt đối', description: 'Get 100% on a mock test', icon: '💯', category: 'exam', condition: { type: 'perfect_test', threshold: 1 } },
  { key: 'hsk1_master', title: 'HSK 1 Master', title_vi: 'HSK 1 thành thạo', description: 'Master all HSK 1 vocabulary', icon: '🎓', category: 'exam', condition: { type: 'hsk_master', threshold: 1, level: 1 } },
  { key: 'hsk2_master', title: 'HSK 2 Master', title_vi: 'HSK 2 thành thạo', description: 'Master all HSK 2 vocabulary', icon: '🎓', category: 'exam', condition: { type: 'hsk_master', threshold: 1, level: 2 } },
  { key: 'xp_1000', title: 'Rising Star', title_vi: 'Ngôi sao mới', description: 'Earn 1000 XP', icon: '🌟', category: 'social', condition: { type: 'total_xp', threshold: 1000 } },
  { key: 'xp_10000', title: 'Legend', title_vi: 'Huyền thoại', description: 'Earn 10000 XP', icon: '👑', category: 'social', condition: { type: 'total_xp', threshold: 10000 } },
];
