import { Router, Request, Response } from 'express';
import { protect } from '../middleware/authMiddleware';
import VocabularyProgress from '../models/VocabularyProgress';
import Vocabulary from '../models/Vocabulary';
import { createNewCard, getNextReview, progressToCard, cardToProgressFields, GRADE_MAP } from '../services/fsrs-service';

const router = Router();

// All review routes require authentication
router.use(protect);

/**
 * GET /api/v1/review/due
 * Get due FSRS cards for the authenticated user.
 * Returns vocabulary items whose due date is <= now, sorted by due ASC, limit 50.
 */
router.get('/due', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const now = new Date();

    const dueCards = await VocabularyProgress.find({
      user_id: userId,
      due: { $lte: now }
    })
      .sort({ due: 1 })
      .limit(50)
      .populate('vocabulary_id');

    // Format response with vocabulary data + FSRS state
    const cards = dueCards.map((card) => {
      const vocab = card.vocabulary_id as any;
      if (!vocab) return null;
      return {
        progressId: card._id,
        vocabularyId: vocab._id,
        character: vocab.traditional || vocab.simplified,
        simplified: vocab.simplified,
        traditional: vocab.traditional,
        pinyin: vocab.pinyin,
        zhuyin: vocab.zhuyin,
        meaning: vocab.meaning_vi,
        hanViet: vocab.han_viet,
        state: card.state,
        reps: card.reps,
        due: card.due
      };
    }).filter(Boolean);

    res.json(cards);
  } catch (error: any) {
    console.error('[Review] Error fetching due cards:', error.message);
    res.status(500).json({ message: 'Failed to fetch due cards' });
  }
});

/**
 * POST /api/v1/review/grade
 * Grade a card and update its FSRS state.
 * Body: { vocabularyId: string, grade: 1|2|3|4 }
 */
router.post('/grade', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { vocabularyId, grade } = req.body;

    // Validate grade (1=Again, 2=Hard, 3=Good, 4=Easy)
    if (!vocabularyId || ![1, 2, 3, 4].includes(grade)) {
      return res.status(400).json({ message: 'Invalid vocabularyId or grade (must be 1-4)' });
    }

    // Find or create progress record
    let progress = await VocabularyProgress.findOne({
      user_id: userId,
      vocabulary_id: vocabularyId
    });

    if (!progress) {
      // Create new progress with empty FSRS card
      const newCard = createNewCard();
      const fields = cardToProgressFields(newCard);
      progress = await VocabularyProgress.create({
        user_id: userId,
        vocabulary_id: vocabularyId,
        ...fields
      });
    }

    // Convert to FSRS card, grade, and get next review
    const card = progressToCard(progress);
    const fsrsGrade = GRADE_MAP[grade];
    const updatedCard = getNextReview(card, fsrsGrade);
    const updatedFields = cardToProgressFields(updatedCard);

    // Update progress record
    Object.assign(progress, updatedFields);
    await progress.save();

    res.json({
      message: 'Card graded',
      nextDue: updatedFields.due,
      state: updatedFields.state,
      reps: updatedFields.reps
    });
  } catch (error: any) {
    console.error('[Review] Error grading card:', error.message);
    res.status(500).json({ message: 'Failed to grade card' });
  }
});

/**
 * GET /api/v1/review/stats
 * Get review statistics for the authenticated user.
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Single aggregation for all stats
    const [stateCounts, dueCount, reviewedToday] = await Promise.all([
      VocabularyProgress.aggregate([
        { $match: { user_id: userId } },
        { $group: { _id: '$state', count: { $sum: 1 } } }
      ]),
      VocabularyProgress.countDocuments({ user_id: userId, due: { $lte: now } }),
      VocabularyProgress.countDocuments({ user_id: userId, last_review: { $gte: todayStart } })
    ]);

    // Build state counts from aggregation result
    const counts: Record<string, number> = { New: 0, Learning: 0, Review: 0, Relearning: 0 };
    let total = 0;
    for (const { _id, count } of stateCounts) {
      counts[_id] = count;
      total += count;
    }

    res.json({
      new: counts.New,
      learning: counts.Learning,
      review: counts.Review,
      relearning: counts.Relearning,
      total,
      due: dueCount,
      reviewedToday
    });
  } catch (error: any) {
    console.error('[Review] Error fetching stats:', error.message);
    res.status(500).json({ message: 'Failed to fetch review stats' });
  }
});

/**
 * POST /api/v1/review/init
 * Initialize VocabularyProgress records for vocabulary items the user has learned
 * (from completed lessons) but doesn't have FSRS records for yet.
 */
router.post('/init', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;

    // Get existing vocabulary IDs for this user (IDs only, lean)
    const existingIds = await VocabularyProgress.find({ user_id: userId })
      .select('vocabulary_id')
      .lean();
    const existingVocabIds = new Set(existingIds.map((p) => p.vocabulary_id.toString()));

    // Get vocabulary IDs not yet tracked (IDs only, lean, limited batch)
    const allVocabIds = await Vocabulary.find()
      .select('_id')
      .lean()
      .limit(500);

    const newCard = createNewCard();
    const fields = cardToProgressFields(newCard);

    const newRecords = allVocabIds
      .filter((v) => !existingVocabIds.has(v._id.toString()))
      .map((v) => ({
        user_id: userId,
        vocabulary_id: v._id,
        ...fields
      }));

    if (newRecords.length > 0) {
      await VocabularyProgress.insertMany(newRecords, { ordered: false }).catch(() => {
        // Ignore duplicate key errors from race conditions
      });
    }

    res.json({ message: `Initialized ${newRecords.length} new cards`, total: newRecords.length });
  } catch (error: any) {
    console.error('[Review] Error initializing cards:', error.message);
    res.status(500).json({ message: 'Failed to initialize cards' });
  }
});

export default router;
