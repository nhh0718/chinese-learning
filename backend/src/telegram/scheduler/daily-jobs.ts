import cron from 'node-cron';
import TelegramBot from 'node-telegram-bot-api';
import { sendDailyVocabulary } from '../handlers/daily-vocabulary';
import { sendReminders } from '../handlers/reminder';
import { calculatePoints } from '../../services/points-calculator';

let botInstance: TelegramBot | null = null;

export function initializeScheduler(bot: TelegramBot) {
  botInstance = bot;
  console.log('[Scheduler] Initializing daily jobs...');

  // Daily vocabulary at 7:00 AM
  cron.schedule('0 7 * * *', () => {
    console.log('[Scheduler] Running daily vocabulary job...');
    if (botInstance) {
      sendDailyVocabulary(botInstance);
    }
  });

  // Reminder at 8:00 PM
  cron.schedule('0 20 * * *', () => {
    console.log('[Scheduler] Running reminder job...');
    if (botInstance) {
      sendReminders(botInstance);
    }
  });

  // Calculate points and apply penalties at 23:30
  cron.schedule('30 23 * * *', () => {
    console.log('[Scheduler] Running points calculation job...');
    calculatePoints();
  });

  console.log('[Scheduler] Daily jobs scheduled successfully');
}

// Export for manual triggering
export async function triggerDailyVocabulary() {
  if (botInstance) {
    await sendDailyVocabulary(botInstance);
  }
}

export async function triggerReminders() {
  if (botInstance) {
    await sendReminders(botInstance);
  }
}
