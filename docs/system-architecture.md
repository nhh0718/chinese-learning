# System Architecture

## Overview

The Learn Chinese application is a full-stack web platform for HSK & TOCFL exam preparation. It uses a React frontend with TypeScript, Vite bundler, and a Node.js/Express backend connected to MongoDB.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend (SPA)                     │
│  - Vite dev server (port 5173)                              │
│  - PWA support (offline-first, caching)                     │
│  - Zustand state management                                 │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP/REST API
                      │ Bearer token auth
                      ↓
┌─────────────────────────────────────────────────────────────┐
│                  Express.js Backend API                      │
│  - Node.js (port 5000)                                      │
│  - Middleware: CORS, auth, logging                          │
│  - Routes: topics, lessons, vocabulary, auth, review, etc.  │
└─────────────────────┬───────────────────────────────────────┘
                      │ Mongoose ODM
                      │ MongoDB driver
                      ↓
┌─────────────────────────────────────────────────────────────┐
│                     MongoDB Database                         │
│  - Collections: users, topics, lessons, vocabulary,         │
│    progress, vocabulary_progress (FSRS cards)              │
└─────────────────────────────────────────────────────────────┘
```

## Phase 1: FSRS Review System (Completed)

### Backend Components

#### VocabularyProgress Model
**File:** `backend/src/models/VocabularyProgress.ts`

Stores FSRS (Free Spaced Repetition System) card state for each user-vocabulary pair.

**Fields:**
- `user_id` (ObjectId) - Reference to User
- `vocabulary_id` (ObjectId) - Reference to Vocabulary
- **FSRS Fields:**
  - `stability` - Card memorability (higher = more stable)
  - `difficulty` - Card hardness (1-10)
  - `elapsed_days` - Days since last review
  - `scheduled_days` - Days until next review
  - `reps` - Total review repetitions
  - `lapses` - Times marked "Again"
  - `state` - 'New' | 'Learning' | 'Review' | 'Relearning'
  - `last_review` - Timestamp of last review
  - `due` - Next review due date
- `is_bookmarked` - User bookmark flag
- Indexes: `(user_id, vocabulary_id)` unique; `(user_id, due)` for efficient queries

#### FSRS Service
**File:** `backend/src/services/fsrs-service.ts`

Wrapper around `ts-fsrs` library for spaced repetition scheduling.

**Key Functions:**
- `createNewCard()` - Initialize new FSRS card (empty state)
- `progressToCard()` - Convert VocabularyProgress document to ts-fsrs Card object
- `cardToProgressFields()` - Convert updated ts-fsrs Card back to model fields
- `getNextReview(card, grade)` - Schedule next review based on grade (1-4)
- `GRADE_MAP` - Maps numeric grades to ts-fsrs Rating enum

**Grade Scale:**
- 1 = Again (forgot)
- 2 = Hard (struggled)
- 3 = Good (knew)
- 4 = Easy (too easy)

#### Review API Routes
**File:** `backend/src/routes/review.ts`

All routes require authentication (Bearer token).

**Endpoints:**

1. **GET `/api/v1/review/due`**
   - Returns due cards for authenticated user
   - Filters: `due <= now`, sorted by due ascending, max 50 cards
   - Response includes vocabulary data (character, pinyin, meaning, etc.) + FSRS state

2. **POST `/api/v1/review/grade`**
   - Grade a card by vocabulary ID and grade (1-4)
   - Creates VocabularyProgress if doesn't exist
   - Updates FSRS state and schedules next review
   - Returns updated state and next due date

3. **GET `/api/v1/review/stats`**
   - Review statistics for user
   - State distribution (new, learning, review, relearning)
   - Due count and reviewed today count
   - Single aggregation pipeline for efficiency

4. **POST `/api/v1/review/init`**
   - Bulk initialize VocabularyProgress for all vocabulary items
   - Only creates records for vocabulary without existing FSRS data
   - Prevents race condition duplicates with ordered:false insertMany

### Frontend Components

#### Review Store (Zustand)
**File:** `src/stores/reviewStore.ts`

State management for review session.

**State:**
- `dueCards` - Array of ReviewCard objects for review
- `currentIndex` - Index of current card
- `stats` - ReviewStats summary
- `isLoading, isGrading` - Loading states
- `error` - Error message

**Actions:**
- `fetchDueCards()` - Fetch due cards from server
- `initCards()` - Initialize FSRS tracking for vocabulary items
- `gradeCard(vocabularyId, grade)` - Submit grade with offline fallback
- `fetchStats()` - Fetch review statistics
- `nextCard()` - Move to next card in session
- `reset()` - Clear session

**Offline Support:**
- `queueOfflineGrade()` - Queue grade to localStorage if network fails
- `syncOfflineGrades()` - Sync pending grades when back online (called on app init)

#### Review Page
**File:** `src/pages/ReviewPage.tsx`

Interactive review interface with 4-button FSRS grading.

**UI Components:**
- Vocabulary card display (character, pinyin, meaning)
- 4 grade buttons: Again | Hard | Good | Easy
- Review stats dashboard
- Loading and error states

### Frontend Types
**File:** `src/types/index.ts`

**New Types:**
```typescript
type FSRSGrade = 1 | 2 | 3 | 4;

interface ReviewCard {
  progressId: string;
  vocabularyId: string;
  character: string;
  simplified: string;
  traditional: string;
  pinyin: string;
  zhuyin: string;
  meaning: string;
  hanViet?: string;
  state: 'New' | 'Learning' | 'Review' | 'Relearning';
  reps: number;
  due: string;
}

interface ReviewStats {
  new: number;
  learning: number;
  review: number;
  relearning: number;
  total: number;
  due: number;
  reviewedToday: number;
}
```

## PWA & Offline Support

### Vite Configuration
**File:** `vite.config.ts`

**vite-plugin-pwa Settings:**
- **registerType:** 'autoUpdate' - Auto-update service workers
- **Workbox Caching Strategies:**
  - Vocabulary API: StaleWhileRevalidate (max 500 entries, 24h expiration)
  - Review API: NetworkFirst (max 100 entries, 1h expiration)
- **PWA Manifest:**
  - App name: "Học Tiếng Trung" (Vietnamese)
  - Short name: "學中文" (Chinese)
  - Theme color: #e53935 (red)
  - Display: standalone (full-screen app)
  - Icons: 192x192, 512x512 PNG

### Frontend Index
**File:** `index.html`

Added PWA meta tags:
- `theme-color`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`

**File:** `src/main.tsx`

Added online event listener to sync offline grades on reconnection:
```typescript
window.addEventListener('online', syncOfflineGrades);
```

## API Configuration

**File:** `src/config/api.ts`

Centralized API endpoint configuration:
```typescript
API_URLS = {
  auth: '/api/v1/auth',
  topics: '/api/v1/topics',
  lessons: '/api/v1/lessons',
  progress: '/api/v1/progress',
  telegram: '/api/v1/telegram',
  review: '/api/v1/review'
}
```

Reads `VITE_API_URL` environment variable (default: http://localhost:5000).

## Dependencies (Phase 1)

**Frontend:**
- `vite-plugin-pwa` - PWA support with Workbox caching

**Backend:**
- `ts-fsrs` - Free Spaced Repetition System algorithm

## Key Design Decisions

1. **FSRS Algorithm:** Chose ts-fsrs for proven SM2-variant spaced repetition with customizable difficulty curves
2. **Offline-First Review:** Network failures don't break review flow; grades queued and synced on reconnection
3. **Bulk Init Route:** Prevents database bloat by lazy-initializing only when user starts reviewing
4. **Workbox Caching:** Vocabulary cached stale-while-revalidate (long TTL), review data network-first (short TTL)
5. **Unique Index:** `(user_id, vocabulary_id)` prevents duplicate progress records
6. **Due Index:** Efficient `due` queries for fetching next batch of cards

## Data Flow

**Review Session Initialization:**
1. User navigates to Review page
2. Frontend calls `POST /review/init` (creates FSRS records for new vocabulary)
3. Frontend calls `GET /review/due` (fetches next 50 cards)
4. Frontend calls `GET /review/stats` (displays statistics)

**Grading Flow:**
1. User clicks grade button (1-4)
2. Frontend calls `POST /review/grade` with grade
3. Backend updates FSRS state and next due date
4. If online: Sync succeeds, move to next card
5. If offline: Grade queued to localStorage, frontend moves to next card
6. When online again: `syncOfflineGrades()` retries queued grades

## Next Phases

- Phase 2: Review UI enhancements (spaced rep timelines, statistics, streak tracking)
- Phase 3: Exam simulation (timed tests with performance analytics)
- Phase 4: Social features (leaderboards, study groups)
