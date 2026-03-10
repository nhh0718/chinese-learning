import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN not found in .env');
  process.exit(1);
}

// Create bot instance - use polling for development
const bot = new TelegramBot(TOKEN, { polling: true });

// Enable graceful stop
process.on('SIGINT', () => {
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  bot.stopPolling();
  process.exit(0);
});

export default bot;
