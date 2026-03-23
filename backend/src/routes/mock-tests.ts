import { Router, Request, Response } from 'express';
import { protect } from '../middleware/authMiddleware';
import MockTest from '../models/MockTest';
import MockTestResult from '../models/MockTestResult';
import { seedAllMockTests } from '../services/mock-test-generator';
import { calculateReadiness } from '../services/readiness-calculator';

const router = Router();
router.use(protect);

/**
 * GET /api/v1/mock-tests
 * List available mock tests, optionally filtered by standard/level.
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { standard, level } = req.query;
    const query: any = {};
    if (standard) query.standard = standard;
    if (level) query.level = Number(level);

    const tests = await MockTest.find(query)
      .select('title standard level duration_minutes total_questions')
      .sort({ level: 1 })
      .lean();

    res.json(tests);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to list mock tests' });
  }
});

/**
 * GET /api/v1/mock-tests/history
 * Get user's test history.
 */
router.get('/history', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const results = await MockTestResult.find({ user_id: userId })
      .populate('test_id', 'title standard level')
      .sort({ submitted_at: -1 })
      .limit(50)
      .lean();

    res.json(results);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch test history' });
  }
});

/**
 * GET /api/v1/mock-tests/readiness/:level
 * Get readiness score for a specific HSK level.
 */
router.get('/readiness/:level', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const level = Number(req.params.level);
    if (!level || level < 1 || level > 6) {
      return res.status(400).json({ message: 'Level must be 1-6' });
    }

    const readiness = await calculateReadiness(userId, level);
    res.json(readiness);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to calculate readiness' });
  }
});

/**
 * POST /api/v1/mock-tests/seed
 * Seed mock tests (admin action, generates missing tests).
 */
router.post('/seed', async (req: Request, res: Response) => {
  try {
    const created = await seedAllMockTests();
    res.json({ message: `Seeded ${created} mock tests` });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to seed mock tests' });
  }
});

/**
 * GET /api/v1/mock-tests/:id
 * Get a specific mock test with questions.
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const test = await MockTest.findById(req.params.id).lean();
    if (!test) return res.status(404).json({ message: 'Test not found' });
    res.json(test);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch test' });
  }
});

/**
 * POST /api/v1/mock-tests/:id/submit
 * Submit test answers and get graded results.
 * Body: { startedAt: string, answers: { sectionIndex: number, questionIndex: number, answer: string }[] }
 */
router.post('/:id/submit', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const test = await MockTest.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });

    const { startedAt, answers } = req.body;
    if (!startedAt || !answers) {
      return res.status(400).json({ message: 'startedAt and answers required' });
    }

    const startTime = new Date(startedAt);
    const submitTime = new Date();
    const timeSpent = Math.round((submitTime.getTime() - startTime.getTime()) / 1000);

    // Grade each section
    const sectionResults = test.sections.map((section, sIdx) => {
      const sectionAnswers = answers.filter((a: any) => a.sectionIndex === sIdx);
      let score = 0;
      const gradedAnswers = section.questions.map((q, qIdx) => {
        const userAnswer = sectionAnswers.find((a: any) => a.questionIndex === qIdx);
        const isCorrect = userAnswer?.answer === q.correctAnswer;
        if (isCorrect) score++;
        return { questionIndex: qIdx, answer: userAnswer?.answer || '', correct: isCorrect };
      });

      return {
        type: section.type,
        score,
        total: section.questions.length,
        answers: gradedAnswers
      };
    });

    const totalScore = sectionResults.reduce((sum, s) => sum + s.score, 0);
    const totalPossible = sectionResults.reduce((sum, s) => sum + s.total, 0);
    const percentage = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;

    const result = await MockTestResult.create({
      user_id: userId,
      test_id: test._id,
      started_at: startTime,
      submitted_at: submitTime,
      time_spent_seconds: timeSpent,
      sections: sectionResults,
      total_score: totalScore,
      total_possible: totalPossible,
      percentage
    });

    res.json(result);
  } catch (error: any) {
    console.error('[MockTest] Error submitting test:', error.message);
    res.status(500).json({ message: 'Failed to submit test' });
  }
});

export default router;
