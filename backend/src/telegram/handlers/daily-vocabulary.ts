import TelegramBot from 'node-telegram-bot-api';
import TelegramSubscription from '../../models/TelegramSubscription';
import DailyQuiz from '../../models/DailyQuiz';
import Vocabulary from '../../models/Vocabulary';

const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export async function sendDailyVocabulary(bot: TelegramBot) {
  console.log('[DailyVocabulary] Starting daily vocabulary broadcast...');

  const subscriptions = await TelegramSubscription.find({ isActive: true });
  const today = getTodayDateString();

  // Get today's quiz to get the topic
  const dailyQuiz = await DailyQuiz.findOne({ date: today });

  if (!dailyQuiz) {
    console.log('[DailyVocabulary] No daily quiz found for today');
    return;
  }

  // Get vocabulary for the quiz questions (up to 10)
  const vocabIds = dailyQuiz.questions.slice(0, 10).map(q => q.vocabularyId);
  const vocabularyList = await Vocabulary.find({ _id: { $in: vocabIds } });

  for (const subscription of subscriptions) {
    try {
      let message = `📚 Từ vựng hôm nay - ${dailyQuiz.topicName}\n\n`;
      message += `Hãy học ${Math.min(10, vocabularyList.length)} từ vựng sau:\n\n`;

      for (const vocab of vocabularyList.slice(0, 10)) {
        message += `🈴 ${vocab.simplified}\n`;
        message += `   Pinyin: ${vocab.pinyin}\n`;
        message += `   Nghĩa: ${vocab.meaning_vi}\n`;
        if (vocab.han_viet) {
          message += `   (${vocab.han_viet})\n`;
        }
        message += '\n';
      }

      message += `\n📝 Làm bài kiểm tra với: /quiz`;

      await bot.sendMessage(subscription.telegramChatId, message);
      console.log(`[DailyVocabulary] Sent to ${subscription.telegramChatId}`);
    } catch (error) {
      console.error(`[DailyVocabulary] Error sending to ${subscription.telegramChatId}:`, error);
    }
  }

  console.log('[DailyVocabulary] Daily vocabulary broadcast complete');
}
