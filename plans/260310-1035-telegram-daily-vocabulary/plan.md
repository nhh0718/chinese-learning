# Telegram Daily Vocabulary - Implementation Plan

## Overview
Add Telegram bot integration for daily vocabulary delivery with quiz functionality and point system.

## Features
1. User registration for daily vocabulary via Telegram
2. Daily vocabulary推送 (10-20 words) to registered users
3. Daily quiz tied to vocabulary
4. Quiz completion tracking (synced with web)
5. Points system (+ for completion, - for missed)

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Zustand
- **Backend**: Express at localhost:5000/api/v1
- **Telegram Bot**: Node.js + node-telegram-bot-api
- **Database**: MongoDB (existing)

## Phases
| Phase | Status | Description |
|-------|--------|-------------|
| 1 | Completed | Database Schema Updates |
| 2 | Completed | Telegram Bot Setup |
| 3 | Completed | Backend API Endpoints |
| 4 | Completed | Frontend Store & Components |
| 5 | Completed | Daily Quiz Logic |
| 6 | Pending | Testing & Integration |

## Key Dependencies
- `node-telegram-bot-api` for Telegram bot
- New MongoDB collections: `telegram_subscriptions`, `daily_quizzes`, `quiz_results`

## Risks
- Telegram bot polling may conflict with Express port
- Timezone handling for daily quiz
- User linking between Telegram and web accounts

## Related Files
- `backend/src/models/User.ts` - extend for Telegram
- `backend/src/index.ts` - add bot routes
- `src/stores/authStore.ts` - add Telegram state
- `src/router/index.tsx` - add Telegram pages

## Next Steps
Start with Phase 1: Database Schema Updates
