import TelegramBot, { CallbackQuery } from 'node-telegram-bot-api';
import bot from './bot';
import { handleStart } from './commands/start';
import { handleSubscribe } from './commands/subscribe';
import { handleUnsubscribe } from './commands/unsubscribe';
import { handleQuiz } from './commands/quiz';
import { handleStatus } from './commands/status';
import { handleHelp } from './commands/help';
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

  // Handle callback queries (quiz answers)
  bot.on('callback_query', async (query) => {
    if (!query.data) return;

    try {
      const data = JSON.parse(query.data);

      if (data.quizId) {
        // Handle quiz answer callback
        await handleQuizAnswer(query);
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

async function handleQuizAnswer(query: CallbackQuery) {
  const chatId = query.message?.chat.id;
  if (!chatId) return;

  // TODO: Implement quiz answer handling
  // This would track user answers and calculate score
  bot.sendMessage(chatId, 'Cảm ơn câu trả lời! Tính năng đang được phát triển.');
}

// Export for external use
export { bot };
