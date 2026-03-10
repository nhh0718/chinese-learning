import TelegramBot from 'node-telegram-bot-api';
import TelegramSubscription from '../../models/TelegramSubscription';
import DailyQuiz from '../../models/DailyQuiz';
import QuizResult from '../../models/QuizResult';

const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

const WEB_APP_URL = process.env.WEB_APP_URL || 'https://learning-chinese-five.vercel.app/quiz';
const API_URL = process.env.API_URL || 'http://localhost:5000';

export async function handleQuiz(bot: TelegramBot, msg: TelegramBot.Message) {
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

  // Check if already completed today's quiz
  const existingResult = await QuizResult.findOne({
    userId: subscription.userId,
    date: today
  });

  if (existingResult) {
    bot.sendMessage(chatId,
      `📝 Bạn đã hoàn thành bài kiểm tra hôm nay!\n\n` +
      `Điểm số: ${existingResult.score}\n` +
      `Đúng: ${existingResult.correctAnswers}/${existingResult.totalQuestions}\n\n` +
      ` Quay lại vào ngày mai để làm bài mới!\n\n` +
      `💡 Thử từ ngẫu nhiên: /word`
    );
    return;
  }

  // Get today's quiz
  const dailyQuiz = await DailyQuiz.findOne({ date: today });

  if (!dailyQuiz) {
    bot.sendMessage(chatId,
      `⏰ Bài kiểm tra hôm nay chưa có sẵn.\n\n` +
      `Vui lòng thử lại sau.`
    );
    return;
  }

  // Send link to web app for quiz
  let message = `📝 Bài kiểm tra hôm nay - ${dailyQuiz.topicName}\n\n`;
  message += `Có ${dailyQuiz.questions.length} câu hỏi.\n\n`;

  // Use web_app button (requires HTTPS)
  const keyboard: TelegramBot.InlineKeyboardMarkup = {
    inline_keyboard: [[
      { text: '📝 Làm bài kiểm tra', web_app: { url: WEB_APP_URL } }
    ]]
  };
  message += `📊 Xem điểm: /status\n`;
  message += `💡 Thử từ ngẫu nhiên: /word`;
  await bot.sendMessage(chatId, message, { reply_markup: keyboard });
}
