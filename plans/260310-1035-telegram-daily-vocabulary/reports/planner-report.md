# Telegram Daily Vocabulary - Planner Report

## Summary
Implementation plan for Telegram Daily Vocabulary feature covering:
1. User registration for daily vocabulary via Telegram
2. Daily vocabulary推送 (10-20 words)
3. Daily quiz with points system
4. Points display on web

## Current Project State
- Frontend: React 18 + TypeScript + Vite + Zustand (src/stores/*.ts, src/pages/*.tsx)
- Backend: Express at localhost:5000/api/v1 (backend/src/routes/*.ts, backend/src/models/*.ts)
- Database: MongoDB with existing collections (User, UserProgress, Vocabulary, Lesson)

## Plan Structure
| Phase | Description | Priority |
|-------|-------------|----------|
| 1 | Database Schema Updates | High |
| 2 | Telegram Bot Setup | High |
| 3 | Backend API Endpoints | High |
| 4 | Frontend Store & Components | High |
| 5 | Daily Quiz Logic | High |
| 6 | Testing & Integration | High |

## Key Dependencies
- `node-telegram-bot-api` - Telegram bot
- `node-cron` - scheduling

## New Files to Create
### Backend (~15 files)
- Models: TelegramSubscription.ts, DailyQuiz.ts, QuizResult.ts
- Routes: telegram.ts
- Services: quiz-generator.ts, points-calculator.ts, daily-quiz-service.ts
- Telegram: bot.ts, commands/*.ts, handlers/*.ts, scheduler/daily-jobs.ts
- Scripts: generate-daily-quiz.ts

### Frontend (~5 files)
- Stores: telegramStore.ts
- Pages: TelegramPage.tsx
- Components: TelegramSettings.tsx, PointsDisplay.tsx, DailyQuizCard.tsx

## Files to Modify
- backend/src/models/User.ts - add Telegram fields
- backend/src/index.ts - add routes + bot init
- src/router/index.tsx - add /telegram route
- src/pages/HomePage.tsx - add points display
- src/components/layout/Navbar.tsx - add navigation

## Points System
- Completion: +10 points
- Score Bonus: +1 per correct answer
- Perfect Score: +5 bonus
- Missed Quiz: -5 penalty

## Risks
1. Bot polling may conflict with Express port
2. Timezone handling for daily quiz
3. User linking between Telegram and web accounts

## Unresolved Questions
- What time should daily vocabulary be sent? (configurable per user)
- Should quiz be required for points?
- How to handle timezone changes mid-streak?
