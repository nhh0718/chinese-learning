import User from '../models/User';
import QuizResult from '../models/QuizResult';
import TelegramSubscription from '../models/TelegramSubscription';

const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export async function calculatePoints() {
  console.log('[PointsCalculator] Calculating daily points...');

  const subscriptions = await TelegramSubscription.find({ isActive: true });
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  for (const subscription of subscriptions) {
    try {
      // Check if user completed yesterday's quiz
      const yesterdayResult = await QuizResult.findOne({
        userId: subscription.userId,
        date: yesterdayStr
      });

      const user = await User.findById(subscription.userId);

      if (!user) continue;

      if (!yesterdayResult) {
        // User missed the quiz - apply penalty
        user.points = Math.max(0, user.points - 5);
        user.streak = 0;
        console.log(`[PointsCalculator] Applied penalty to user ${user.email}, new points: ${user.points}`);
      } else {
        // User completed the quiz - award points
        const basePoints = 10;
        const scoreBonus = yesterdayResult.correctAnswers;
        const perfectBonus = yesterdayResult.correctAnswers === yesterdayResult.totalQuestions ? 5 : 0;

        user.points += basePoints + scoreBonus + perfectBonus;

        // Update streak
        if (user.lastQuizDate) {
          const lastDate = new Date(user.lastQuizDate).toISOString().split('T')[0];
          const daysDiff = Math.floor((new Date(yesterdayStr).getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24));

          if (daysDiff === 1) {
            user.streak += 1;

            // Streak bonuses
            if (user.streak === 7) {
              user.points += 20;
            } else if (user.streak === 30) {
              user.points += 100;
            }
          } else if (daysDiff > 1) {
            user.streak = 1;
          }
        } else {
          user.streak = 1;
        }

        user.lastQuizDate = new Date(yesterdayStr);
        console.log(`[PointsCalculator] Awarded points to user ${user.email}, new points: ${user.points}, streak: ${user.streak}`);
      }

      await user.save();
    } catch (error) {
      console.error(`[PointsCalculator] Error processing user ${subscription.userId}:`, error);
    }
  }

  console.log('[PointsCalculator] Daily points calculation complete');
}

export async function submitQuizResult(userId: string, quizId: string, answers: { questionIndex: number; answerIndex: number }[], source: 'telegram' | 'web' = 'web') {
  const today = getTodayDateString();
  const quiz = await import('../models/DailyQuiz').then(m => m.default.findById(quizId));

  if (!quiz) {
    throw new Error('Quiz not found');
  }

  // Calculate score
  let correctAnswers = 0;
  for (const answer of answers) {
    const question = quiz.questions[answer.questionIndex];
    if (question && question.options[answer.answerIndex] === question.correctAnswer) {
      correctAnswers++;
    }
  }

  const score = correctAnswers * 10; // 10 points per correct answer

  // Save result
  const result = await QuizResult.create({
    userId,
    quizId,
    date: today,
    score,
    totalQuestions: quiz.questions.length,
    correctAnswers,
    source
  });

  // Update user points immediately
  const user = await User.findById(userId);
  if (user) {
    user.points += score;
    await user.save();
  }

  return {
    result,
    correctAnswers,
    totalQuestions: quiz.questions.length,
    score
  };
}
