import User from '../models/User';
import mongoose from 'mongoose';

// Level thresholds
function getXPForLevel(level: number): number {
  if (level <= 10) return level * 100;
  if (level <= 30) return 1000 + (level - 10) * 250;
  if (level <= 50) return 6000 + (level - 30) * 500;
  if (level <= 70) return 16000 + (level - 50) * 1000;
  return 36000 + (level - 70) * 2000;
}

// Level titles in Chinese
const LEVEL_TITLES: Record<string, string> = {
  beginner: '初學者',
  student: '學生',
  intermediate: '進步者',
  advanced: '高手',
  master: '大師'
};

export function getLevelTitle(level: number): string {
  if (level <= 10) return LEVEL_TITLES.beginner;
  if (level <= 30) return LEVEL_TITLES.student;
  if (level <= 50) return LEVEL_TITLES.intermediate;
  if (level <= 70) return LEVEL_TITLES.advanced;
  return LEVEL_TITLES.master;
}

export function calculateLevel(totalXP: number): { level: number; xpForNext: number; xpProgress: number } {
  let level = 1;
  let xpUsed = 0;

  while (level < 99) {
    const needed = getXPForLevel(level);
    if (xpUsed + needed > totalXP) {
      return {
        level,
        xpForNext: needed,
        xpProgress: totalXP - xpUsed
      };
    }
    xpUsed += needed;
    level++;
  }

  return { level: 99, xpForNext: 0, xpProgress: 0 };
}

/**
 * Award XP to a user, handle level-up, streak multiplier, weekly XP tracking.
 */
export async function awardXP(
  userId: mongoose.Types.ObjectId | string,
  amount: number,
  _reason: string
): Promise<{ xp: number; level: number; leveledUp: boolean }> {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Apply streak multiplier
  let multiplier = 1;
  if (user.streak >= 30) multiplier = 3;
  else if (user.streak >= 7) multiplier = 2;

  const xpGained = Math.round(amount * multiplier);
  const oldLevel = user.level;

  user.xp += xpGained;

  // Reset weekly XP if needed (Monday reset)
  const now = new Date();
  if (!user.weeklyXpResetAt || now.getTime() - user.weeklyXpResetAt.getTime() > 7 * 24 * 60 * 60 * 1000) {
    user.weeklyXp = 0;
    user.weeklyXpResetAt = now;
  }
  user.weeklyXp += xpGained;

  // Calculate new level
  const { level } = calculateLevel(user.xp);
  user.level = level;

  await user.save();

  return {
    xp: user.xp,
    level: user.level,
    leveledUp: level > oldLevel
  };
}

// XP amounts for different activities
export const XP_AMOUNTS = {
  CARD_REVIEW: 5,
  NEW_WORD_LEARNED: 10,
  DAILY_QUIZ: 25,
  MOCK_TEST: 50,
  PERFECT_TEST_BONUS: 100,
  DAILY_LOGIN: 15,
  LESSON_COMPLETE: 25
};
