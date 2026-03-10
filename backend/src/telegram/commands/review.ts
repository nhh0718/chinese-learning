import TelegramBot from 'node-telegram-bot-api';
import TelegramSubscription from '../../models/TelegramSubscription';
import DailyQuiz from '../../models/DailyQuiz';
import Vocabulary from '../../models/Vocabulary';
import { formatPinyin } from '../../utils/pinyin-utils';

const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export async function handleReviewVocabulary(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;

  // Check if user is subscribed
  const subscription = await TelegramSubscription.findOne({
    telegramChatId: chatId.toString(),
    isActive: true
  });

  if (!subscription) {
    bot.sendMessage(chatId,
      `❌ Bạn chưa đăng ký nhận từ vựng hàng ngày.\n\n` +
      `Để đăng ký, sử dụng: /subscribe [email]`
    );
    return;
  }

  const today = getTodayDateString();

  // Get today's quiz
  const dailyQuiz = await DailyQuiz.findOne({ date: today });

  if (!dailyQuiz) {
    bot.sendMessage(chatId,
      `⏰ Chưa có từ vựng hôm nay.\n\n` +
      `Vui lòng thử lại sau!`
    );
    return;
  }

  // Get vocabulary details
  const vocabIds = dailyQuiz.questions.map(q => q.vocabularyId);
  const vocabularyList = await Vocabulary.find({ _id: { $in: vocabIds } });

  // Create vocab map for quick lookup
  const vocabMap = new Map(vocabularyList.map(v => [v._id.toString(), v]));

  let message = `📚 Từ vựng hôm nay - ${dailyQuiz.topicName}\n\n`;
  message += `Hôm nay có ${Math.min(10, vocabularyList.length)} từ:\n\n`;

  for (let i = 0; i < Math.min(10, dailyQuiz.questions.length); i++) {
    const q = dailyQuiz.questions[i];
    const vocab = vocabMap.get(q.vocabularyId.toString());

    if (vocab) {
      message += `${i + 1}. ${vocab.simplified} (${formatPinyin(vocab.pinyin)})\n`;
      message += `   → ${vocab.meaning_vi}\n\n`;
    }
  }

  message += `\n📝 Làm bài kiểm tra: /quiz`;
  message += `\n💯 Xem điểm: /status`;

  await bot.sendMessage(chatId, message);
}
