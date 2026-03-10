import TelegramBot from 'node-telegram-bot-api';

export async function handleHelp(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId,
    `📖 Hướng dẫn sử dụng Bot\n\n` +
    `Các lệnh có sẵn:\n\n` +
    `/start - Khởi động bot\n` +
    `/subscribe [email] - Đăng ký nhận từ vựng hàng ngày\n` +
    `/unsubscribe - Hủy đăng ký\n` +
    `/quiz - Làm bài kiểm tra hàng ngày\n` +
    `/status - Xem trạng thái học tập\n` +
    `/help - Xem hướng dẫn này\n\n` +
    `Ví dụ:\n` +
    `• /subscribe example@gmail.com\n` +
    `• /quiz - Làm bài kiểm tra\n` +
    `• /status - Xem điểm và streak`
  );
}
