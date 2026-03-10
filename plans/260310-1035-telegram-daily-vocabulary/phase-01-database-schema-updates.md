# Phase 1: Database Schema Updates

## Context Links
- `backend/src/models/User.ts` - existing user model
- `backend/src/models/UserProgress.ts` - existing progress model
- `backend/src/models/Vocabulary.ts` - existing vocabulary model

## Overview
- **Priority**: High
- **Status**: Completed
- **Description**: Extend User model and create new collections for Telegram subscriptions, daily quizzes, and quiz results

## Requirements

### Functional Requirements
1. Add Telegram fields to User model (telegramChatId, isSubscribed, subscriptionDate)
2. Create TelegramSubscription model for managing subscriptions
3. Create DailyQuiz model for storing daily vocabulary sets
4. Create QuizResult model for tracking completion and points

### Non-Functional Requirements
- Backward compatible with existing user data
- Index on telegramChatId for quick lookups
- Timestamp fields for tracking subscription lifecycle

## Architecture

### Data Models

#### User Model Updates (User.ts)
```typescript
// Add to existing User interface
telegramChatId?: string;
telegramUsername?: string;
isTelegramSubscribed: boolean;
telegramSubscribedAt?: Date;
dailyQuizTimezone: string; // e.g., "Asia/Ho_Chi_Minh"
```

#### TelegramSubscription Collection
- user_id: ObjectId (ref: User)
- telegramChatId: string
- isActive: boolean
- subscribedAt: Date
- unsubscribedAt?: Date
- preferredTime: string // "09:00" format
- timezone: string

#### DailyQuiz Collection
- date: string // "YYYY-MM-DD"
- vocabularyIds: ObjectId[]
- quizQuestions: QuizQuestion[]
- isPublished: boolean

#### QuizResult Collection
- user_id: ObjectId
- quizDate: string
- completed: boolean
- score: number
- points: number // +10 for completion, -5 for missed
- completedAt?: Date

## Related Code Files

### Files to Create
- `backend/src/models/TelegramSubscription.ts`
- `backend/src/models/DailyQuiz.ts`
- `backend/src/models/QuizResult.ts`

### Files to Modify
- `backend/src/models/User.ts`

## Implementation Steps

### 1.1 Update User Model
- [ ] Add telegramChatId (string, optional, unique)
- [ ] Add telegramUsername (string, optional)
- [ ] Add isTelegramSubscribed (boolean, default: false)
- [ ] Add telegramSubscribedAt (Date, optional)
- [ ] Add dailyQuizTimezone (string, default: "Asia/Ho_Chi_Minh")

### 1.2 Create TelegramSubscription Model
- [ ] Define interface ITelegramSubscription
- [ ] Create schema with user_id, telegramChatId, isActive, subscribedAt, unsubscribedAt, preferredTime, timezone
- [ ] Add index on telegramChatId
- [ ] Add compound index on user_id + isActive

### 1.3 Create DailyQuiz Model
- [ ] Define interface IDailyQuiz
- [ ] Create schema with date (unique), vocabularyIds, quizQuestions, isPublished
- [ ] Add index on date

### 1.4 Create QuizResult Model
- [ ] Define interface IQuizResult
- [ ] Create schema with user_id, quizDate, completed, score, points, completedAt
- [ ] Add compound index on user_id + quizDate (unique)

## Todo List
- [ ] Update User.ts with Telegram fields
- [ ] Create TelegramSubscription.ts
- [ ] Create DailyQuiz.ts
- [ ] Create QuizResult.ts
- [ ] Verify models load without errors

## Success Criteria
- [ ] All new models can be imported without errors
- [ ] User model backward compatible
- [ ] Indexes created for query performance
- [ ] TypeScript compiles without errors

## Risk Assessment
- **Risk**: Adding fields to User model may cause migration issues
- **Mitigation**: Fields are optional, existing users won't be affected

## Security Considerations
- Store telegramChatId securely
- Validate telegramChatId format before saving

## Next Steps
- Phase 2: Telegram Bot Setup (bot initialization, commands, message handlers)
