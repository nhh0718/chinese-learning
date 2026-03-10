import TelegramBot from 'node-telegram-bot-api';
import TelegramSubscription from '../../models/TelegramSubscription';
import User from '../../models/User';

export async function handleStart(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  const username = msg.from?.username;

  // Check if this chat is already subscribed
  const subscription = await TelegramSubscription.findOne({ telegramChatId: chatId.toString() });

  if (subscription && subscription.isActive) {
    // Already subscribed - show welcome back message
    const user = await User.findById(subscription.userId);
    bot.sendMessage(chatId,
      `Chào mừng trở lại! 🎉\n\n` +
      `Bạn đang theo học chủ đề: ${user?.name || 'Unknown'}\n` +
      `Điểm tích cực: ${user?.points || 0}\n` +
      `Streak: ${user?.streak || 0} ngày\n\n` +
      `Sử dụng /help để xem các lệnh có sẵn.`
    );
  } else {
    // Not subscribed - show welcome and instructions
    bot.sendMessage(chatId,
      `Xin chào! 👋\n\n` +
      `Chào mừng bạn đến với ứng dụng học tiếng Trung!\n\n` +
      `Để đăng ký nhận từ vựng hàng ngày, vui lòng sử dụng lệnh:\n` +
      `/subscribe [email]\n\n` +
      `Ví dụ: /subscribe example@gmail.com\n\n` +
      `Sau khi đăng ký, bạn sẽ nhận được 10-20 từ vựng mỗi ngày kèm bài kiểm tra.`
    );
  }
}
