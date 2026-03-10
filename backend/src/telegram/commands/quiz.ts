import TelegramBot from 'node-telegram-bot-api';
import TelegramSubscription from '../../models/TelegramSubscription';
import DailyQuiz from '../../models/DailyQuiz';
import QuizResult from '../../models/QuizResult';

const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

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
      ` Quay lại vào ngày mai để làm bài mới!`
    );
    return;
  }

  // Get today's quiz
  const dailyQuiz = await DailyQuiz.findOne({ date: today });

  if (!dailyQuiz) {
    bot.sendMessage(chatId,
      `⏰ Bài kiểm tra hôm nay chưa có sẵn.\n\n` +
      `Vui lòng thử lại sau hoặc liên hệ admin.`
    );
    return;
  }

  // Send quiz questions
  const questions = dailyQuiz.questions.slice(0, 10); // Send 10 questions at a time

  let quizText = `📝 Bài kiểm tra hôm nay - Chủ đề: ${dailyQuiz.topicName}\n\n`;
  quizText += `Trả lời bằng cách nhấn vào đáp án đúng.\n\n`;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    quizText += `Câu ${i + 1}: ${q.question}\n`;
    if (q.questionChinese) {
      quizText += `${q.questionChinese}\n`;
    }
    quizText += '\n';
  }

  // Create inline keyboard for first question
  const firstQ = questions[0];
  const keyboard: TelegramBot.InlineKeyboardMarkup = {
    inline_keyboard: firstQ.options.map((opt, idx) => [{
      text: opt,
      callback_data: JSON.stringify({ qIdx: 0, ans: idx, quizId: dailyQuiz._id.toString() })
    }])
  };

  bot.sendMessage(chatId, quizText, { reply_markup: keyboard });
}
