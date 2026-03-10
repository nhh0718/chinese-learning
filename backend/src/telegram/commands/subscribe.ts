import TelegramBot from 'node-telegram-bot-api';
import TelegramSubscription from '../../models/TelegramSubscription';
import User from '../../models/User';

export async function handleSubscribe(bot: TelegramBot, msg: TelegramBot.Message, email?: string) {
  const chatId = msg.chat.id;
  const username = msg.from?.username;

  // If no email provided, ask for it
  if (!email) {
    bot.sendMessage(chatId,
      `Để đăng ký, vui lòng cung cấp email của bạn:\n\n` +
      `/subscribe your@email.com\n\n` +
      `Ví dụ: /subscribe example@gmail.com`
    );
    return;
  }

  // Find user by email
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    bot.sendMessage(chatId,
      `❌ Không tìm thấy tài khoản với email: ${email}\n\n` +
      `Vui lòng kiểm tra lại email hoặc đăng ký tài khoản trên web trước.`
    );
    return;
  }

  // Check if already subscribed
  const existingSubscription = await TelegramSubscription.findOne({ telegramChatId: chatId.toString() });

  if (existingSubscription) {
    if (existingSubscription.isActive) {
      bot.sendMessage(chatId,
        `ℹ️ Bạn đã đăng ký nhận từ vựng hàng ngày rồi!\n\n` +
        `Để hủy đăng ký, sử dụng: /unsubscribe`
      );
      return;
    } else {
      // Reactivate subscription
      existingSubscription.isActive = true;
      existingSubscription.telegramUsername = username;
      existingSubscription.subscribedAt = new Date();
      await existingSubscription.save();
    }
  } else {
    // Create new subscription
    await TelegramSubscription.create({
      userId: user._id,
      telegramChatId: chatId.toString(),
      telegramUsername: username,
      isActive: true,
      timezone: 'Asia/Ho_Chi_Minh',
      reminderTime: '20:00'
    });
  }

  // Update user's telegramChatId
  user.telegramChatId = chatId.toString();
  user.telegramUsername = username;
  await user.save();

  bot.sendMessage(chatId,
    `✅ Đăng ký thành công! 🎉\n\n` +
    `Chào mừng ${user.name}!\n\n` +
    `Bạn sẽ nhận được:\n` +
    `📚 10-20 từ vựng mỗi ngày (theo chủ đề)\n` +
    `📝 Bài kiểm tra hàng ngày\n` +
    `⏰ Nhắc nhở lúc 20:00 nếu chưa hoàn thành\n\n` +
    `Sử dụng /help để xem các lệnh.`
  );
}
