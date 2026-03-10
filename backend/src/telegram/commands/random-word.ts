import TelegramBot from 'node-telegram-bot-api';
import TelegramSubscription from '../../models/TelegramSubscription';
import DailyQuiz from '../../models/DailyQuiz';
import Vocabulary from '../../models/Vocabulary';
import { formatPinyin } from '../../utils/pinyin-utils';

const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export async function handleRandomWord(bot: TelegramBot, msg: TelegramBot.Message) {
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

  if (!dailyQuiz || dailyQuiz.questions.length === 0) {
    bot.sendMessage(chatId,
      `⏰ Chưa có từ vựng hôm nay.\n\n` +
      `Vui lòng thử lại sau!`
    );
    return;
  }

  // Pick a random word
  const randomIndex = Math.floor(Math.random() * dailyQuiz.questions.length);
  const randomQuestion = dailyQuiz.questions[randomIndex];

  // Get vocabulary details
  const vocab = await Vocabulary.findById(randomQuestion.vocabularyId);

  if (!vocab) {
    bot.sendMessage(chatId,
      `❌ Không tìm thấy từ vựng.\n\n` +
      `Thử lại: /word`
    );
    return;
  }

  // Create inline keyboard with multiple choice
  const options = [...randomQuestion.options];
  // Shuffle options
  const shuffledOptions = options
    .map((opt, idx) => ({ opt, idx }))
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);

  const keyboard: TelegramBot.InlineKeyboardMarkup = {
    inline_keyboard: [
      shuffledOptions.slice(0, 2).map(item => ({
        text: item.opt,
        callback_data: `w:${vocab._id}:${item.opt === randomQuestion.correctAnswer ? '1' : '0'}`
      })),
      shuffledOptions.slice(2, 4).map(item => ({
        text: item.opt,
        callback_data: `w:${vocab._id}:${item.opt === randomQuestion.correctAnswer ? '1' : '0'}`
      }))
    ]
  };

  const message = `💡 Thử từ ngẫu nhiên\n\n` +
    `Từ: ${vocab.simplified}\n` +
    `Pinyin: ${formatPinyin(vocab.pinyin)}\n\n` +
    `Nghĩa tiếng Việt là gì?`;

  await bot.sendMessage(chatId, message, { reply_markup: keyboard });
}
