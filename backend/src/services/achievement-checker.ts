import Achievement from '../models/Achievement';
import UserAchievement from '../models/UserAchievement';
import VocabularyProgress from '../models/VocabularyProgress';
import MockTestResult from '../models/MockTestResult';
import User from '../models/User';
import mongoose from 'mongoose';

/**
 * Check if user qualifies for any unearned achievements and award them.
 * Returns list of newly earned achievement keys.
 */
export async function checkAndAwardAchievements(
  userId: mongoose.Types.ObjectId | string
): Promise<string[]> {
  // Get all achievements and user's earned ones
  const [allAchievements, earnedAchievements] = await Promise.all([
    Achievement.find().lean(),
    UserAchievement.find({ user_id: userId }).select('achievement_key').lean()
  ]);

  const earnedKeys = new Set(earnedAchievements.map(a => a.achievement_key));
  const unearnedAchievements = allAchievements.filter(a => !earnedKeys.has(a.key));

  if (unearnedAchievements.length === 0) return [];

  // Gather user stats
  const user = await User.findById(userId).lean();
  if (!user) return [];

  const [vocabMastered, totalReviews, testsCompleted, perfectTests] = await Promise.all([
    VocabularyProgress.countDocuments({ user_id: userId, state: 'Review' }),
    VocabularyProgress.countDocuments({ user_id: userId, reps: { $gt: 0 } }),
    MockTestResult.countDocuments({ user_id: userId }),
    MockTestResult.countDocuments({ user_id: userId, percentage: 100 })
  ]);

  const stats: Record<string, number> = {
    streak: user.streak || 0,
    vocab_mastered: vocabMastered,
    reviews: totalReviews,
    tests_completed: testsCompleted,
    perfect_test: perfectTests,
    total_xp: user.xp || 0,
    lessons_completed: 0 // Could be calculated from UserProgress
  };

  // Check each unearned achievement
  const newlyEarned: string[] = [];

  for (const achievement of unearnedAchievements) {
    const { type, threshold } = achievement.condition;

    // Special case for HSK master (needs level-specific vocab check)
    if (type === 'hsk_master') {
      // Skip complex HSK mastery check for now — requires per-level vocab query
      continue;
    }

    const value = stats[type] || 0;
    if (value >= threshold) {
      try {
        await UserAchievement.create({
          user_id: userId,
          achievement_key: achievement.key
        });
        newlyEarned.push(achievement.key);
      } catch {
        // Duplicate key — already earned (race condition)
      }
    }
  }

  return newlyEarned;
}
