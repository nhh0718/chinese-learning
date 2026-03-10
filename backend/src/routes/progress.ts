import express, { Request, Response } from 'express';
import UserProgress from '../models/UserProgress';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// GET /api/v1/progress - Get all progress for current user
router.get('/', protect, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const progress = await UserProgress.find({ user_id: userId });
    res.json(progress);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/v1/progress/:lessonId - Upate progress for a specific lesson
router.post('/:lessonId', protect, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { lessonId } = req.params;
    const { topic_id, completed, score, mastery_level } = req.body;

    // Use findOneAndUpdate with upsert: true to create if it doesn't exist, update if it does.
    const progress = await UserProgress.findOneAndUpdate(
      { user_id: userId, lesson_id: lessonId },
      { 
        topic_id,
        completed: completed !== undefined ? completed : true,
        score: score || 0,
        mastery_level: mastery_level || 1
       },
      { new: true, upsert: true }
    );

    res.json(progress);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
