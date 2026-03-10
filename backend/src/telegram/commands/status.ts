import TelegramBot from 'node-telegram-bot-api';
import TelegramSubscription from '../../models/TelegramSubscription';
import User from '../../models/User';
import QuizResult from '../../models/QuizResult';

const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export async function handleStatus(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;

  // Find subscription
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

  // Get user info
  const user = await User.findById(subscription.userId);

  if (!user) {
    bot.sendMessage(chatId, `❌ Lỗi: Không tìm thấy thông tin người dùng.`);
    return;
  }

  // Check today's quiz status
  const today = getTodayDateString();
  const todayResult = await QuizResult.findOne({
    userId: user._id,
    date: today
  });

  const status = todayResult
    ? `✅ Hoàn thành (${todayResult.correctAnswers}/${todayResult.totalQuestions} đúng)`
    : `❌ Chưa hoàn thành`;

  bot.sendMessage(chatId,
    `📊 Trạng thái học tập\n\n` +
    `👤 Người dùng: ${user.name}\n` +
    `📧 Email: ${user.email}\n\n` +
    `📈 Tiến độ:\n` +
    `• Điểm tích cực: ${user.points}\n` +
    `• Streak: ${user.streak} ngày\n\n` +
    `📝 Hôm nay (${today}):\n` +
    `• Bài kiểm tra: ${status}\n\n` +
    `⏰ Cài đặt:\n` +
    `• Múi giờ: ${subscription.timezone}\n` +
    `• Nhắc nhở lúc: ${subscription.reminderTime}\n\n` +
    `Sử dụng /help để xem các lệnh.`
  );
}
