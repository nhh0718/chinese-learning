import TelegramBot from 'node-telegram-bot-api';
import TelegramSubscription from '../../models/TelegramSubscription';

export async function handleUnsubscribe(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;

  const subscription = await TelegramSubscription.findOne({ telegramChatId: chatId.toString() });

  if (!subscription || !subscription.isActive) {
    bot.sendMessage(chatId,
      `ℹ️ Bạn chưa đăng ký nhận từ vựng hàng ngày.\n\n` +
      `Để đăng ký, sử dụng: /subscribe [email]`
    );
    return;
  }

  // Deactivate subscription
  subscription.isActive = false;
  subscription.unsubscribedAt = new Date();
  await subscription.save();

  bot.sendMessage(chatId,
    `✅ Bạn đã hủy đăng ký nhận từ vựng hàng ngày.\n\n` +
    `Để đăng ký lại, sử dụng: /subscribe [email]\n\n` +
    `Cảm ơn bạn đã sử dụng dịch vụ! 👋`
  );
}
