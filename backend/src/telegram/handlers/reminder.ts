import TelegramBot from 'node-telegram-bot-api';
import TelegramSubscription from '../../models/TelegramSubscription';
import QuizResult from '../../models/QuizResult';

const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export async function sendReminders(bot: TelegramBot) {
  console.log('[Reminder] Starting reminder broadcast...');

  const subscriptions = await TelegramSubscription.find({ isActive: true });
  const today = getTodayDateString();

  for (const subscription of subscriptions) {
    try {
      // Check if user has completed today's quiz
      const todayResult = await QuizResult.findOne({
        userId: subscription.userId,
        date: today
      });

      if (todayResult) {
        // User already completed quiz, skip reminder
        continue;
      }

      // Send reminder message
      const message =
        `⏰ Nhắc nhở học tập!\n\n` +
        `Bạn chưa hoàn thành bài kiểm tra hôm nay.\n\n` +
        `Hãy dành 5 phút để hoàn thành:\n` +
        `📝 /quiz - Làm bài kiểm tra\n\n` +
        `Đừng để streak của bạn bị gián đoạn! 🔥`;

      await bot.sendMessage(subscription.telegramChatId, message);
      console.log(`[Reminder] Sent to ${subscription.telegramChatId}`);
    } catch (error) {
      console.error(`[Reminder] Error sending to ${subscription.telegramChatId}:`, error);
    }
  }

  console.log('[Reminder] Reminder broadcast complete');
}
