import TelegramBot from 'node-telegram-bot-api';

export async function handleHelp(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId,
    `📖 Hướng dẫn sử dụng Bot\n\n` +
    `Các lệnh có sẵn:\n\n` +
    `/start - Khởi động bot\n` +
    `/subscribe [email] - Đăng ký nhận từ vựng hàng ngày\n` +
    `/unsubscribe - Hủy đăng ký\n` +
    `/review - Xem 10 từ vựng hôm nay\n` +
    `/vocab [ngày] - Xem từ vựng theo ngày\n` +
    `/quiz - Làm bài kiểm tra trên web\n` +
    `/word - Thử 1 từ ngẫu nhiên\n` +
    `/status - Xem điểm & streak\n` +
    `/help - Xem hướng dẫn này\n\n` +
    `💡 Mẹo: Làm bài quiz trên web để lưu điểm!`
  );
}
