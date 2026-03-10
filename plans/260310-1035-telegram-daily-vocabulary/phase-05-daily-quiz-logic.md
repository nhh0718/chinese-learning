# Phase 5: Daily Quiz Logic

## Context Links
- Phase 1: Database Schema Updates
- Phase 2: Telegram Bot Setup
- Phase 3: Backend API Endpoints
- Phase 4: Frontend Store & Components

## Overview
- **Priority**: High
- **Status**: Completed
- **Description**: Implement daily quiz generation, scoring, points calculation, and missed quiz penalties

## Requirements

### Functional Requirements
1. Generate daily quiz from vocabulary pool (10-20 words)
2. **NEW: Select vocabulary by topic/theme (same topic for all words in a day)**
3. Create multiple choice questions (4 options each)
4. Calculate scores and award points
5. Track quiz completion status
6. Apply negative points for missed quizzes
7. Handle timezone-aware daily reset
8. Sync quiz status between Telegram and web
9. **NEW: Send reminder to users who haven't completed daily vocabulary**
10. **NEW: Cycle through topics systematically**

### Non-Functional Requirements
- Questions shouldn't repeat within 7 days
- Quiz must be completable within 5 minutes
- Points must be calculated atomically

## Architecture

### Quiz Generation Flow
```
Daily at 00:00 (user timezone)
  → Check if DailyQuiz exists for date
  → If not: Generate new quiz
    → Select topic based on rotation (e.g., Mon: Greetings, Tue: Numbers...)
    → Select 10-20 vocabulary from that topic
    → For each word: create MCQ
    → Save to DailyQuiz collection with topic info
  → Return today's quiz to users
```

### Points System
```
Completion Points:
  - Base: +10 points for completing quiz
  - Score Bonus: +1 point per correct answer
  - Perfect Score: +5 bonus

Missed Quiz Penalty:
  - -5 points if quiz not completed by 23:59
  - Penalty applied at start of next day

Streak Bonus:
  - 7-day streak: +20 bonus
  - 30-day streak: +100 bonus
```

### Quiz Question Structure
```typescript
interface QuizQuestion {
  vocabularyId: string;
  question: string;          // "What does '你好' mean?"
  options: string[];         // ["Hello", "Goodbye", "Thank you", "Sorry"]
  correctAnswer: string;
  points: number;
}
```

## Related Code Files

### Files to Create
- `backend/src/services/quiz-generator.ts` - quiz generation logic
- `backend/src/services/points-calculator.ts` - points calculation
- `backend/src/services/daily-quiz-service.ts` - daily quiz orchestration
- `backend/src/scripts/generate-daily-quiz.ts` - CLI script

### Files to Modify
- `backend/src/telegram/scheduler/daily-jobs.ts` - add quiz generation
- Phase 3 routes - add quiz generation endpoint

## Implementation Steps

### 5.1 Create Quiz Generator Service
- [ ] Create `backend/src/services/quiz-generator.ts`
- [ ] Function: generateDailyQuiz(date, count: 10-20)
- [ ] Select random vocabulary from pool (avoid recent)
- [ ] Generate 4-option MCQ for each word
- [ ] Return DailyQuiz document

### 5.2 Create Points Calculator Service
- [ ] Create `backend/src/services/points-calculator.ts`
- [ ] Function: calculatePoints(score, totalQuestions)
- [ ] Function: applyMissedQuizPenalty(userId)
- [ ] Function: calculateStreak(userId)
- [ ] Handle streak bonuses

### 5.3 Create Daily Quiz Service
- [ ] Create `backend/src/services/daily-quiz-service.ts`
- [ ] Function: getOrCreateDailyQuiz(date)
- [ ] Function: submitQuizResult(userId, quizId, answers)
- [ ] Function: getQuizStatus(userId, date)

### 5.4 Add Quiz Generation Endpoint
- [ ] Add GET /api/v1/telegram/generate-quiz (admin only)
- [ ] Manually trigger quiz generation

### 5.5 Add Automatic Quiz Generation
- [ ] Modify daily-jobs.ts scheduler
- [ ] Run quiz generation at start of each day (per timezone)

### 5.6 Implement Missed Quiz Penalty
- [ ] Add scheduled job at 23:59 (user timezone)
- [ ] Check users who haven't completed quiz
- [ ] Apply -5 points penalty
- [ ] Log penalty applications

### 5.7 Implement Quiz Sync
- [ ] Ensure same quiz available on Telegram and web
- [ ] Share DailyQuiz collection between both
- [ ] QuizResult tracks source (telegram/web)

### 5.8 Implement Reminder System
- [ ] Add reminder job scheduler (e.g., 20:00 daily)
- [ ] Query users with incomplete daily quiz
- [ ] Send reminder message via Telegram
- [ ] Track reminder sent status per user per day
- [ ] Configurable reminder time per user

### 5.8 Create CLI Script
- [ ] Create `backend/src/scripts/generate-daily-quiz.ts`
- [ ] Standalone script for manual quiz generation
- [ ] Usage: `ts-node scripts/generate-daily-quiz.ts`

## Quiz Question Examples

### Example 1
```
Question: What does "你好" (nǐ hǎo) mean?
Options: ["Hello", "Goodbye", "Thank you", "Sorry"]
Correct: "Hello"
```

### Example 2
```
Question: How do you say "Thank you" in Chinese?
Options: ["你好", "再见", "谢谢", "对不起"]
Correct: "谢谢"
```

## Todo List
- [ ] Create quiz-generator.ts
- [ ] Create points-calculator.ts
- [ ] Create daily-quiz-service.ts
- [ ] Add quiz generation endpoint
- [ ] Set up automatic generation
- [ ] Implement missed quiz penalty
- [ ] Test quiz sync between Telegram and web

## Success Criteria
- [ ] Quiz generates 10-20 questions
- [ ] Points calculate correctly
- [ ] Missed quiz penalty applies
- [ ] Same quiz on Telegram and web

## Risk Assessment
- **Risk**: Quiz generation fails on timezone boundary
- **Mitiation**: Use UTC internally, convert for display

## Security Considerations
- Prevent answer tampering
- Validate quiz submission timing

## Next Steps
- Phase 6: Testing & Integration
