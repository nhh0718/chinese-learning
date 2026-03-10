# Phase 4: Frontend Store & Components

## Context Links
- Phase 3: Backend API Endpoints
- `src/stores/authStore.ts` - existing auth store
- `src/stores/progressStore.ts` - existing progress store
- `src/router/index.tsx` - existing router

## Overview
- **Priority**: High
- **Status**: Completed
- **Description**: Create Zustand store for Telegram state and React components for subscription management

## Requirements

### Functional Requirements
1. Create Telegram store with subscription state
2. Create Telegram registration page
3. Create Telegram settings component
4. Display points/quiz status on dashboard
5. Show today's quiz on web interface

### Non-Functional Requirements
- Reuse existing auth token pattern
- Consistent styling with existing components
- Handle loading and error states

## Architecture

### Store Structure
```typescript
interface TelegramState {
  isSubscribed: boolean;
  telegramChatId: string | null;
  dailyPoints: number;
  totalPoints: number;
  quizCompleted: boolean;
  todayQuizScore: number | null;
  isLoading: boolean;
  error: string | null;

  subscribe: (chatId: string) => Promise<void>;
  unsubscribe: () => Promise<void>;
  fetchStatus: () => Promise<void>;
  fetchPoints: () => Promise<void>;
  fetchQuizStatus: () => Promise<void>;
  submitQuizResult: (score: number) => Promise<void>;
}
```

### Page/Component Structure
```
src/
  stores/
    telegramStore.ts          # NEW: Telegram state

  pages/
    TelegramPage.tsx          # NEW: Registration & settings
    HomePage.tsx              # MODIFY: Add points display

  components/
    telegram/
      TelegramSettings.tsx    # NEW: Subscription management
      PointsDisplay.tsx      # NEW: Points widget
      DailyQuizCard.tsx      # NEW: Today's quiz component
```

## Related Code Files

### Files to Create
- `src/stores/telegramStore.ts`
- `src/pages/TelegramPage.tsx`
- `src/components/telegram/TelegramSettings.tsx`
- `src/components/telegram/PointsDisplay.tsx`
- `src/components/telegram/DailyQuizCard.tsx`

### Files to Modify
- `src/router/index.tsx` - add TelegramPage route
- `src/pages/HomePage.tsx` - add points display
- `src/components/layout/Navbar.tsx` - add navigation

## Implementation Steps

### 4.1 Create Telegram Store
- [ ] Create `src/stores/telegramStore.ts`
- [ ] Define TelegramState interface
- [ ] Implement API calls to /api/v1/telegram/*
- [ ] Add subscribe, unsubscribe, fetchStatus, fetchPoints, fetchQuizStatus, submitQuizResult
- [ ] Use persist middleware for token storage

### 4.2 Add Telegram Route
- [ ] Modify `src/router/index.tsx`
- [ ] Add path: '/telegram' → TelegramPage

### 4.3 Create Telegram Page
- [ ] Create `src/pages/TelegramPage.tsx`
- [ ] Show subscription status
- [ ] Show "Connect Telegram" button if not subscribed
- [ ] Show "Disconnect" button if subscribed
- [ ] Display bot username for QR code / link

### 4.4 Create Points Display Component
- [ ] Create `src/components/telegram/PointsDisplay.tsx`
- [ ] Show total points
- [ ] Show daily streak
- [ ] Show today's quiz status

### 4.5 Create Daily Quiz Card Component
- [ ] Create `src/components/telegram/DailyQuizCard.tsx`
- [ ] Fetch today's quiz from API
- [ ] Display quiz questions
- [ ] Handle answer submission
- [ ] Show results and points earned

### 4.6 Update Navbar
- [ ] Modify `src/components/layout/Navbar.tsx`
- [ ] Add "Telegram" link in navigation (if authenticated)

### 4.7 Update Home Page
- [ ] Modify `src/pages/HomePage.tsx`
- [ ] Add PointsDisplay widget
- [ ] Show daily quiz prompt if not completed

### 4.8 Create Telegram Settings Component
- [ ] Create `src/components/telegram/TelegramSettings.tsx`
- [ ] Allow timezone preference
- [ ] Allow preferred notification time

## Todo List
- [ ] Create telegramStore.ts
- [ ] Add /telegram route
- [ ] Create TelegramPage.tsx
- [ ] Create PointsDisplay.tsx
- [ ] Create DailyQuizCard.tsx
- [ ] Update Navbar
- [ ] Update HomePage
- [ ] Test full flow

## Success Criteria
- [ ] Store persists across sessions
- [ ] Subscription flow works
- [ ] Points display updates in real-time
- [ ] Quiz can be completed on web

## Risk Assessment
- **Risk**: State conflicts between Telegram and web quiz
- **Mitiation**: Single source of truth in QuizResult collection

## Security Considerations
- Validate telegramChatId matches current user
- Sanitize API responses

## Next Steps
- Phase 5: Daily Quiz Logic
