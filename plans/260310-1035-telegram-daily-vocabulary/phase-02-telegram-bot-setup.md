# Phase 2: Telegram Bot Setup

## Context Links
- Phase 1: Database Schema Updates
- `backend/src/index.ts` - main Express app
- `backend/package.json` - dependencies

## Overview
- **Priority**: High
- **Status**: Completed
- **Description**: Set up Telegram bot with node-telegram-bot-api, define commands and message handlers

## Requirements

### Functional Requirements
1. Initialize Telegram bot with BotFather token
2. Handle /start command for registration
3. Handle /subscribe command for daily vocabulary
4. Handle /unsubscribe command
5. Handle /quiz command for daily quiz
6. Handle /status command to check subscription
7. Send daily vocabulary at scheduled time (by topic/theme)
8. Send daily quiz questions
9. **NEW: Send reminder to users who haven't completed daily vocabulary**
10. **NEW: Topic-based vocabulary selection (same topic for all words)**

### Non-Functional Requirements
- Bot should run on separate process or use webhook
- Handle rate limiting from Telegram
- Graceful error handling

## Architecture

### Bot Structure
```
backend/
  src/
    telegram/
      bot.ts              # Bot initialization
      commands/
        start.ts         # /start handler
        subscribe.ts     # /subscribe handler
        unsubscribe.ts   # /unsubscribe handler
        quiz.ts          # /quiz handler
        status.ts        # /status handler
      handlers/
        daily-vocabulary.ts
        daily-quiz.ts
      scheduler/
        daily-jobs.ts    # Cron jobs for daily tasks
```

### Command Flow
```
User sends /start
  → Check if telegramChatId exists in DB
  → If linked: Show welcome back message
  → If not linked: Show registration instructions

User sends /subscribe
  → Ask for web account email to link
  → Verify email exists in system
  → Link telegramChatId to user account
  → Confirm subscription

User sends /quiz
  → Get today's quiz questions
  → Send as inline keyboard buttons
  → Process answers and calculate score

Daily cron job (e.g., 09:00)
  → Fetch all active subscriptions
  → Get today's vocabulary (10-20 words)
  → Send vocabulary message to each user
```

## Related Code Files

### Files to Create
- `backend/src/telegram/bot.ts`
- `backend/src/telegram/commands/start.ts`
- `backend/src/telegram/commands/subscribe.ts`
- `backend/src/telegram/commands/unsubscribe.ts`
- `backend/src/telegram/commands/quiz.ts`
- `backend/src/telegram/commands/status.ts`
- `backend/src/telegram/handlers/daily-vocabulary.ts`
- `backend/src/telegram/handlers/daily-quiz.ts`
- `backend/src/telegram/scheduler/daily-jobs.ts`

### Files to Modify
- `backend/package.json` (add node-telegram-bot-api)
- `backend/src/index.ts` (initialize bot)

## Implementation Steps

### 2.1 Install Dependencies
- [ ] Add `node-telegram-bot-api` to package.json
- [ ] Add `node-cron` for scheduling (or use node-cron)

### 2.2 Create Bot Initialization
- [ ] Create `backend/src/telegram/bot.ts`
- [ ] Initialize bot with TOKEN from environment
- [ ] Export bot instance for reuse

### 2.3 Implement /start Command
- [ ] Create `start.ts` handler
- [ ] Check if chatId linked to user
- [ ] Show welcome message with keyboard options

### 2.4 Implement /subscribe Command
- [ ] Create `subscribe.ts` handler
- [ ] Prompt user for email
- [ ] Validate email against User collection
- [ ] Link telegramChatId to user
- [ ] Send confirmation message

### 2.5 Implement /unsubscribe Command
- [ ] Create `unsubscribe.ts` handler
- [ ] Update TelegramSubscription isActive = false
- [ ] Show confirmation

### 2.6 Implement /quiz Command
- [ ] Create `quiz.ts` handler
- [ ] Fetch today's quiz from DailyQuiz collection
- [ ] Send quiz as inline keyboard
- [ ] Handle callback queries for answers

### 2.7 Implement /status Command
- [ ] Create `status.ts` handler
- [ ] Show subscription status, points, streak

### 2.8 Create Daily Jobs Scheduler
- [ ] Create `daily-jobs.ts`
- [ ] Schedule vocabulary sending at configured time
- [ ] Schedule quiz result point calculation at end of day
- [ ] **NEW: Schedule reminder job (e.g., 20:00) for users who haven't completed**
- [ ] **NEW: Track completion status throughout the day**

### 2.9 Integrate with Express
- [ ] Modify `index.ts` to initialize bot
- [ ] Set up error handling for bot

## Todo List
- [ ] Install node-telegram-bot-api and node-cron
- [ ] Create bot initialization module
- [ ] Implement all command handlers
- [ ] Set up daily job scheduler
- [ ] Test bot responds to commands

## Success Criteria
- [ ] Bot starts without errors
- [ ] /start command responds correctly
- [ ] /subscribe links user account
- [ ] /quiz shows today's questions
- [ ] Daily jobs run on schedule

## Risk Assessment
- **Risk**: Bot polling may conflict with Express server
- **Mitigation**: Use separate process or webhook mode

## Security Considerations
- Validate all user inputs
- Sanitize messages before sending
- Rate limit command responses

## Next Steps
- Phase 3: Backend API Endpoints
