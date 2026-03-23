import { Router, Request, Response } from 'express';
import { protect } from '../middleware/authMiddleware';
import User from '../models/User';
import Achievement, { ACHIEVEMENT_SEEDS } from '../models/Achievement';
import UserAchievement from '../models/UserAchievement';
import { calculateLevel, getLevelTitle } from '../services/xp-service';
import { checkAndAwardAchievements } from '../services/achievement-checker';

const router = Router();
router.use(protect);

/**
 * GET /api/v1/gamification/profile
 * Get user's XP, level, streak, and recent achievements.
 */
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const levelInfo = calculateLevel(user.xp);
    const title = getLevelTitle(user.level);

    // Check for new achievements
    const newAchievements = await checkAndAwardAchievements(userId);

    const earnedCount = await UserAchievement.countDocuments({ user_id: userId });

    res.json({
      xp: user.xp,
      level: user.level,
      levelTitle: title,
      xpForNext: levelInfo.xpForNext,
      xpProgress: levelInfo.xpProgress,
      streak: user.streak,
      weeklyXp: user.weeklyXp,
      achievementsEarned: earnedCount,
      newAchievements
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

/**
 * GET /api/v1/gamification/achievements
 * Get all achievements with earned status for the user.
 */
router.get('/achievements', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const [allAchievements, earned] = await Promise.all([
      Achievement.find().lean(),
      UserAchievement.find({ user_id: userId }).lean()
    ]);

    const earnedMap = new Map(earned.map(e => [e.achievement_key, e.earned_at]));

    const result = allAchievements.map(a => ({
      ...a,
      earned: earnedMap.has(a.key),
      earnedAt: earnedMap.get(a.key) || null
    }));

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch achievements' });
  }
});

/**
 * GET /api/v1/gamification/leaderboard
 * Weekly XP leaderboard (top 50).
 */
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const leaders = await User.find({ weeklyXp: { $gt: 0 } })
      .select('name level weeklyXp xp')
      .sort({ weeklyXp: -1 })
      .limit(50)
      .lean();

    const result = leaders.map((u, i) => ({
      rank: i + 1,
      name: u.name,
      level: u.level,
      weeklyXp: u.weeklyXp,
      totalXp: u.xp,
      levelTitle: getLevelTitle(u.level)
    }));

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
});

/**
 * POST /api/v1/gamification/seed-achievements
 * Seed achievement definitions.
 */
router.post('/seed-achievements', async (req: Request, res: Response) => {
  try {
    let created = 0;
    for (const seed of ACHIEVEMENT_SEEDS) {
      const exists = await Achievement.findOne({ key: seed.key });
      if (!exists) {
        await Achievement.create(seed);
        created++;
      }
    }
    res.json({ message: `Seeded ${created} achievements` });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to seed achievements' });
  }
});

export default router;
