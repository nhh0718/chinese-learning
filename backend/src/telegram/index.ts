import TelegramBot, { CallbackQuery, Message } from 'node-telegram-bot-api';
import TelegramSubscription from '../models/TelegramSubscription';
import DailyQuiz from '../models/DailyQuiz';
import QuizResult from '../models/QuizResult';
import User from '../models/User';
import bot from './bot';
import { handleStart } from './commands/start';
import { handleSubscribe } from './commands/subscribe';
import { handleUnsubscribe } from './commands/unsubscribe';
import { handleQuiz } from './commands/quiz';
import { handleStatus } from './commands/status';
import { handleHelp } from './commands/help';
import { handleReviewVocabulary } from './commands/review';
import { handleGetVocabulary } from './commands/vocab';
import { handleRandomWord } from './commands/random-word';
import { initializeScheduler } from './scheduler/daily-jobs';
import { generateDailyQuiz } from '../services/quiz-generator';

// Initialize command handlers
export function initializeTelegramBot() {
  console.log('[TelegramBot] Initializing bot...');

  // Register commands
  bot.onText(/\/start/, (msg) => handleStart(bot, msg));

  bot.onText(/\/subscribe(?:\s+(.+))?/, (msg, match) => {
    const email = match?.[1];
    handleSubscribe(bot, msg, email);
  });

  bot.onText(/\/unsubscribe/, (msg) => handleUnsubscribe(bot, msg));

  bot.onText(/\/quiz/, (msg) => handleQuiz(bot, msg));

  bot.onText(/\/status/, (msg) => handleStatus(bot, msg));

  bot.onText(/\/help/, (msg) => handleHelp(bot, msg));

  bot.onText(/\/review/, (msg) => handleReviewVocabulary(bot, msg));

  bot.onText(/\/vocab(?:\s+(.+))?/, (msg, match) => {
    const dateString = match?.[1];
    handleGetVocabulary(bot, msg, dateString);
  });

  bot.onText(/\/word/, (msg) => handleRandomWord(bot, msg));

  // Handle callback queries (quiz answers & random word)
  bot.on('callback_query', async (query) => {
    if (!query.data) return;

    try {
      const data = JSON.parse(query.data);

      if (data.quizId) {
        // Handle quiz answer callback
        await handleQuizAnswer(query);
      } else if (data.type === 'word') {
        // Handle random word answer
        await handleWordAnswer(query);
      }
    } catch (error) {
      console.error('[TelegramBot] Error handling callback:', error);
    }

    // Answer callback to remove loading state
    bot.answerCallbackQuery(query.id);
  });

  // Initialize scheduler
  initializeScheduler(bot);

  // Generate today's quiz on startup
  generateDailyQuiz(15).then(quiz => {
    if (quiz) {
      console.log(`[TelegramBot] Today's quiz ready: ${quiz.topicName}`);
    }
  });

  console.log('[TelegramBot] Bot initialized and commands registered');
}

// In-memory storage for quiz answers (per user per day)
const userAnswers: Map<string, Map<number, number>> = new Map();

async function handleQuizAnswer(query: CallbackQuery) {
  const chatId = query.message?.chat.id;
  if (!chatId || !query.data) return;

  try {
    const data = JSON.parse(query.data);
    const qIdx = data.qIdx as number | undefined;
    const ans = data.ans as number | undefined;
    const quizId = data.quizId as string | undefined;

    if (qIdx === undefined || ans === undefined || !quizId) return;

    // Get user subscription
    const subscription = await TelegramSubscription.findOne({
      telegramChatId: chatId.toString(),
      isActive: true
    });

    if (!subscription) {
      bot.sendMessage(chatId, '❌ Bạn chưa đăng ký!');
      return;
    }

    // Store answer
    const userKey = `${subscription.userId}_${quizId}`;
    if (!userAnswers.has(userKey)) {
      userAnswers.set(userKey, new Map());
    }
    userAnswers.get(userKey)!.set(qIdx, ans);

    // Get quiz to check if all answered
    const quiz = await DailyQuiz.findById(quizId);
    if (!quiz) return;

    const answersMap = userAnswers.get(userKey)!;
    const answeredCount = answersMap.size;
    const totalQuestions = quiz.questions.length;

    // Calculate current score
    let correctCount = 0;
    for (const [idx, userAns] of answersMap) {
      const question = quiz.questions[idx];
      if (question && question.options[userAns] === question.correctAnswer) {
        correctCount++;
      }
    }

    const score = correctCount * 10;

    // Show feedback for this answer
    const question = quiz.questions[qIdx];
    const isCorrect = question.options[ans] === question.correctAnswer;

    let feedbackText = isCorrect
      ? `✅ Đúng! (+10 điểm)`
      : `❌ Sai! Đáp án đúng: ${question.correctAnswer}`;

    feedbackText += `\n\n📊 Tiến độ: ${answeredCount}/${totalQuestions} | Điểm: ${score}`;

    if (answeredCount === totalQuestions) {
      // Quiz completed - save result
      const today = new Date().toISOString().split('T')[0];

      await QuizResult.findOneAndUpdate(
        { userId: subscription.userId, date: today },
        {
          userId: subscription.userId,
          quizId,
          date: today,
          score,
          totalQuestions,
          correctAnswers: correctCount,
          source: 'telegram'
        },
        { upsert: true, new: true }
      );

      // Update user points
      const user = await User.findById(subscription.userId);
      if (user) {
        user.points += score;
        await user.save();
      }

      feedbackText += `\n\n🎉 Hoàn thành bài kiểm tra!`;
      feedbackText += `\n📝 Xem kết quả: /status`;

      // Clean up
      userAnswers.delete(userKey);
    }

    bot.sendMessage(chatId, feedbackText);

  } catch (error) {
    console.error('[TelegramBot] Error handling quiz answer:', error);
  }
}

async function handleWordAnswer(query: CallbackQuery) {
  const chatId = query.message?.chat.id;
  if (!chatId || !query.data) return;

  try {
    const data = JSON.parse(query.data);
    const isCorrect = data.correct === '1';

    const feedbackText = isCorrect
      ? `✅ Chính xác! Giỏi lắm! 🎉\n\n💡 Thử từ khác: /word`
      : `❌ Chưa đúng! Đừng nản nhé 💪\n\n💡 Thử từ khác: /word`;

    bot.sendMessage(chatId, feedbackText);

  } catch (error) {
    console.error('[TelegramBot] Error handling word answer:', error);
  }
}

// Export for external use
export { bot };
