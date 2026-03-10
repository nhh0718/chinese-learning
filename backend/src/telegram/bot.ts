import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PROXY_URL = process.env.TELEGRAM_PROXY_URL;

if (!TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN not found in .env');
  process.exit(1);
}

// Bot configuration
const botOptions: TelegramBot.ConstructorOptions = {
  polling: true
};

// Add proxy if configured
if (PROXY_URL) {
  console.log(`[TelegramBot] Using proxy: ${PROXY_URL}`);
  botOptions.request = {
    url: PROXY_URL
  } as any;
}

// Create bot instance
const bot = new TelegramBot(TOKEN, botOptions);

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
