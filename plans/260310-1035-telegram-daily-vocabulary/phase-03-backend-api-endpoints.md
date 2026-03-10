# Phase 3: Backend API Endpoints

## Context Links
- Phase 1: Database Schema Updates
- Phase 2: Telegram Bot Setup
- `backend/src/routes/auth.ts` - existing auth routes
- `backend/src/routes/progress.ts` - existing progress routes

## Overview
- **Priority**: High
- **Status**: Completed
- **Description**: Create REST API endpoints for Telegram subscription management, quiz data, and points

## Requirements

### Functional Requirements
1. POST /api/v1/telegram/subscribe - Link Telegram to user account
2. POST /api/v1/telegram/unsubscribe - Unlink Telegram account
3. GET /api/v1/telegram/status - Get subscription status
4. GET /api/v1/telegram/daily-vocabulary - Get today's vocabulary
5. GET /api/v1/telegram/daily-quiz - Get today's quiz questions
6. POST /api/v1/telegram/quiz-result - Submit quiz results
7. GET /api/v1/telegram/points - Get user points
8. GET /api/v1/telegram/quiz-status - Check if today's quiz completed

### Non-Functional Requirements
- Protected routes (require auth token)
- Validate telegramChatId format
- Return consistent JSON responses

## Architecture

### Route Structure
```
/api/v1/telegram
  ├── POST /subscribe          # Link Telegram account
  ├── POST /unsubscribe       # Unlink Telegram account
  ├── GET /status             # Get subscription status
  ├── GET /daily-vocabulary   # Get today's words
  ├── GET /daily-quiz        # Get today's quiz
  ├── POST /quiz-result      # Submit quiz result
  ├── GET /points            # Get total points
  └── GET /quiz-status       # Check today's completion
```

### Data Flow
```
Frontend → Auth Token → Express Route → MongoDB → Response
```

## Related Code Files

### Files to Create
- `backend/src/routes/telegram.ts` - main Telegram routes
- `backend/src/controllers/telegram-controller.ts` - route handlers

### Files to Modify
- `backend/src/index.ts` - add telegram routes

## Implementation Steps

### 3.1 Create Telegram Routes
- [ ] Create `backend/src/routes/telegram.ts`
- [ ] Import express, protect middleware
- [ ] Define all endpoint handlers

### 3.2 Implement /subscribe Endpoint
- [ ] Accept telegramChatId in request body
- [ ] Validate telegramChatId format
- [ ] Update User model with telegram fields
- [ ] Create TelegramSubscription record
- [ ] Return success/failure response

### 3.3 Implement /unsubscribe Endpoint
- [ ] Get user from auth token
- [ ] Update User telegram fields to null
- [ ] Update TelegramSubscription isActive = false
- [ ] Return confirmation

### 3.4 Implement /status Endpoint
- [ ] Get user from auth token
- [ ] Return telegramChatId, isTelegramSubscribed, subscription date
- [ ] Return timezone preference

### 3.5 Implement /daily-vocabulary Endpoint
- [ ] Get today's date
- [ ] Fetch DailyQuiz document for today
- [ ] Populate vocabularyIds with Vocabulary data
- [ ] Return array of 10-20 vocabulary items

### 3.6 Implement /daily-quiz Endpoint
- [ ] Get today's date
- [ ] Fetch DailyQuiz document
- [ ] Return quiz questions with options
- [ ] Exclude correct answers (for frontend)

### 3.7 Implement /quiz-result Endpoint
- [ ] Accept quizDate, score, answers
- [ ] Calculate points: +10 for completion, bonus for score
- [ ] Create QuizResult record
- [ ] Update user's total points
- [ ] Return final points

### 3.8 Implement /points Endpoint
- [ ] Aggregate all QuizResult points for user
- [ ] Return total points and streak info

### 3.9 Implement /quiz-status Endpoint
- [ ] Get today's date
- [ ] Check if QuizResult exists for user today
- [ ] Return { completed: boolean, score?: number }

### 3.10 Register Routes in Express
- [ ] Import telegram routes in index.ts
- [ ] Add: app.use('/api/v1/telegram', telegramRoutes)

## Todo List
- [ ] Create telegram routes file
- [ ] Implement all 8 endpoints
- [ ] Add route registration to index.ts
- [ ] Test endpoints with Postman/cURL

## Success Criteria
- [ ] All endpoints return valid JSON
- [ ] Protected endpoints require auth
- [ ] Points calculation correct
- [ ] Quiz status reflects actual completion

## Risk Assessment
- **Risk**: Race conditions in quiz submission
- **Mitigation**: Use upsert for QuizResult

## Security Considerations
- Verify user owns the telegramChatId
- Sanitize all inputs
- Rate limit submissions

## Next Steps
- Phase 4: Frontend Store & Components
