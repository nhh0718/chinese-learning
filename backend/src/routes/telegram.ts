import express, { Request, Response } from 'express';
import TelegramSubscription from '../models/TelegramSubscription';
import User from '../models/User';
import DailyQuiz from '../models/DailyQuiz';
import QuizResult from '../models/QuizResult';
import { generateQuizNow } from '../services/quiz-generator';

const router = express.Router();

// Get today's quiz
router.get('/daily-quiz', async (req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const quiz = await DailyQuiz.findOne({ date: today });

    if (!quiz) {
      // Generate quiz if not exists
      const newQuiz = await generateQuizNow();
      if (!newQuiz) {
        return res.status(404).json({ error: 'No quiz available' });
      }
      return res.json(newQuiz);
    }

    res.json(quiz);
  } catch (error) {
    console.error('[TelegramAPI] Error getting daily quiz:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit quiz result (for web)
router.post('/quiz-result', async (req: Request, res: Response) => {
  try {
    const { userId, quizId, answers } = req.body;

    if (!userId || !quizId || !answers) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const quiz = await DailyQuiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Calculate score
    let correctAnswers = 0;
    for (const answer of answers) {
      const question = quiz.questions[answer.questionIndex];
      if (question && question.options[answer.answerIndex] === question.correctAnswer) {
        correctAnswers++;
      }
    }

    const score = correctAnswers * 10;

    // Save result
    const today = new Date().toISOString().split('T')[0];
    const result = await QuizResult.findOneAndUpdate(
      { userId, date: today },
      {
        userId,
        quizId,
        date: today,
        score,
        totalQuestions: quiz.questions.length,
        correctAnswers,
        source: 'web'
      },
      { upsert: true, new: true }
    );

    // Update user points
    const user = await User.findById(userId);
    if (user) {
      user.points += score;
      await user.save();
    }

    res.json({
      result,
      correctAnswers,
      totalQuestions: quiz.questions.length,
      score
    });
  } catch (error) {
    console.error('[TelegramAPI] Error submitting quiz result:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user progress/status
router.get('/progress/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const today = new Date().toISOString().split('T')[0];
    const todayResult = await QuizResult.findOne({ userId, date: today });

    const subscription = await TelegramSubscription.findOne({
      userId,
      isActive: true
    });

    res.json({
      points: user.points,
      streak: user.streak,
      lastQuizDate: user.lastQuizDate,
      todayCompleted: !!todayResult,
      telegramConnected: !!subscription
    });
  } catch (error) {
    console.error('[TelegramAPI] Error getting progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate quiz manually (admin)
router.post('/generate-quiz', async (req: Request, res: Response) => {
  try {
    const quiz = await generateQuizNow();
    if (!quiz) {
      return res.status(500).json({ error: 'Failed to generate quiz' });
    }
    res.json(quiz);
  } catch (error) {
    console.error('[TelegramAPI] Error generating quiz:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get telegram subscription status
router.get('/subscription/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const subscription = await TelegramSubscription.findOne({
      userId,
      isActive: true
    });

    res.json({
      isSubscribed: !!subscription,
      reminderTime: subscription?.reminderTime || null,
      timezone: subscription?.timezone || null
    });
  } catch (error) {
    console.error('[TelegramAPI] Error getting subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update reminder settings
router.put('/subscription/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { reminderTime, timezone } = req.body;

    const subscription = await TelegramSubscription.findOneAndUpdate(
      { userId, isActive: true },
      { reminderTime, timezone },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json(subscription);
  } catch (error) {
    console.error('[TelegramAPI] Error updating subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get quiz by date
router.get('/quiz/:date', async (req: Request, res: Response) => {
  try {
    const { date } = req.params; // YYYY-MM-DD format
    const quiz = await DailyQuiz.findOne({ date });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found for this date' });
    }

    res.json(quiz);
  } catch (error) {
    console.error('[TelegramAPI] Error getting quiz by date:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's quiz history
router.get('/history/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = '30' } = req.query;

    const results = await QuizResult.find({ userId })
      .sort({ date: -1 })
      .limit(parseInt(limit as string))
      .populate('quizId');

    const quizzes = await Promise.all(results.map(async (result) => {
      const quiz = result.quizId ? await DailyQuiz.findById(result.quizId) : null;
      return {
        date: result.date,
        score: result.score,
        correctAnswers: result.correctAnswers,
        totalQuestions: result.totalQuestions,
        source: result.source,
        topicName: quiz?.topicName || 'Unknown'
      };
    }));

    res.json(quizzes);
  } catch (error) {
    console.error('[TelegramAPI] Error getting quiz history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
