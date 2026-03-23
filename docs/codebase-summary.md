# Codebase Summary

## Project Structure

```
learning-chinese/
├── backend/
│   └── src/
│       ├── config/           # Configuration (database, etc.)
│       ├── middleware/       # Express middleware (auth, logging)
│       ├── models/           # Mongoose schemas
│       │   ├── User.ts
│       │   ├── Topic.ts
│       │   ├── Lesson.ts
│       │   ├── Vocabulary.ts
│       │   ├── Progress.ts
│       │   └── VocabularyProgress.ts    # Phase 1: FSRS cards
│       ├── services/         # Business logic
│       │   └── fsrs-service.ts          # Phase 1: FSRS wrapper
│       ├── routes/           # API endpoints
│       │   ├── auth.ts
│       │   ├── topics.ts
│       │   ├── lessons.ts
│       │   ├── vocabulary.ts
│       │   ├── progress.ts
│       │   ├── telegram.ts
│       │   └── review.ts               # Phase 1: FSRS review API
│       ├── telegram/         # Telegram bot integration
│       └── index.ts          # Server entry point
├── src/                      # React frontend
│   ├── components/           # Reusable UI components
│   ├── config/
│   │   └── api.ts           # API endpoint configuration
│   ├── pages/
│   │   ├── LessonsPage.tsx
│   │   ├── ReviewPage.tsx    # Phase 1: FSRS review interface
│   │   └── ...
│   ├── stores/              # Zustand state management
│   │   ├── authStore.ts
│   │   ├── lessonStore.ts
│   │   └── reviewStore.ts   # Phase 1: FSRS review state
│   ├── styles/
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces (includes ReviewCard, ReviewStats)
│   ├── main.tsx             # App entry + offline sync listener
│   └── App.tsx
├── vite.config.ts           # PWA + bundler config (Phase 1)
├── index.html               # PWA meta tags (Phase 1)
├── package.json
├── tsconfig.json
└── docs/                    # Documentation
    ├── system-architecture.md
    ├── codebase-summary.md  # This file
    ├── project-roadmap.md
    └── code-standards.md
```

## Core Modules

### Backend

#### Authentication (Routes: `backend/src/routes/auth.ts`)
- POST `/register` - Create new user
- POST `/login` - Authenticate and return JWT token
- POST `/telegram-login` - Login via Telegram user data

#### Topics & Lessons
- Fetch learning topics (greetings, family, food, etc.)
- Retrieve lesson content with vocabulary and example sentences

#### Vocabulary
- Search and filter Chinese characters with pinyin, zhuyin, meaning
- Stored in MongoDB with Vietnamese translations (`meaning_vi`) and Han-Viet pronunciation

#### Progress Tracking
- User lesson completion tracking
- Learning statistics per lesson/topic

#### Telegram Integration
- Daily vocabulary quiz distribution
- User engagement tracking
- Quiz link generation with web app integration

#### FSRS Review System (Phase 1)
- **VocabularyProgress Model:** Tracks FSRS card state per user-vocabulary pair
- **Review Routes:**
  - `GET /due` - Fetch due cards for review session
  - `POST /grade` - Grade card and reschedule
  - `GET /stats` - User review statistics
  - `POST /init` - Initialize FSRS tracking for new vocabulary

### Frontend

#### State Management (Zustand)
- **authStore:** User authentication and JWT token
- **lessonStore:** Lesson content and user progress
- **reviewStore:** FSRS review session state with offline support

#### Pages
- **HomePage:** Topic selection
- **LessonPage:** Vocabulary and exercise content
- **ReviewPage:** FSRS spaced repetition interface
- **ProfilePage:** User settings and progress dashboard

#### Types (`src/types/index.ts`)
Core data models:
- `User` - User profile (id, email, name, role, avatar)
- `Topic` - Learning topic
- `Lesson` - Lesson content
- `Vocabulary` - Chinese word with pronunciation
- `UserProgress` - Lesson completion tracking
- `ReviewCard` - Card in FSRS review session
- `ReviewStats` - Review statistics
- `FSRSGrade` - Grade scale (1-4)
- `DailyWord` - Daily vocabulary item
- `DailyQuiz` - Telegram daily quiz
- `TelegramProgress` - Telegram engagement metrics

#### PWA Configuration
- Service worker registration via vite-plugin-pwa
- Workbox caching strategies (StaleWhileRevalidate for vocab, NetworkFirst for review)
- Offline-first grade queueing in localStorage
- Online event listener for automatic sync

## Key Technologies

### Backend Stack
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Spaced Repetition:** ts-fsrs (SM2 variant algorithm)
- **Authentication:** JWT (Bearer token)
- **Telegram:** telegram-bot-api

### Frontend Stack
- **Framework:** React 18+ with TypeScript
- **Bundler:** Vite
- **State Management:** Zustand
- **Styling:** CSS Modules
- **PWA:** vite-plugin-pwa with Workbox
- **Offline Support:** localStorage queue + service worker

### Development Tools
- **Linting:** ESLint
- **Package Manager:** npm
- **Environment:** .env for configuration

## Phase 1 Changes Summary

### New Files
- `backend/src/models/VocabularyProgress.ts` - FSRS card model with indexes
- `backend/src/services/fsrs-service.ts` - FSRS algorithm wrapper
- `backend/src/routes/review.ts` - Review API endpoints
- `src/stores/reviewStore.ts` - Review state management with offline queue

### Modified Files
- `vite.config.ts` - Added VitePWA plugin and Workbox caching
- `index.html` - Added PWA meta tags
- `backend/src/index.ts` - Registered review routes
- `backend/src/middleware/authMiddleware.ts` - Fixed double-response bug
- `src/config/api.ts` - Added review API URL
- `src/types/index.ts` - Added ReviewCard, ReviewStats, FSRSGrade types
- `src/pages/ReviewPage.tsx` - Rewritten with real API and FSRS grading
- `src/pages/ReviewPage.css` - New FSRS 4-button layout
- `src/main.tsx` - Added online event listener for offline sync

### New Dependencies
- `vite-plugin-pwa` - PWA support
- `ts-fsrs` - Spaced repetition algorithm

## Database Schema

### VocabularyProgress Collection
Tracks FSRS review state per user-vocabulary pair.

**Indexes:**
- `{ user_id: 1, vocabulary_id: 1 }` (unique) - Prevent duplicates
- `{ user_id: 1, due: 1 }` (compound) - Efficient due date queries

**Sample Document:**
```json
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "vocabulary_id": ObjectId,
  "stability": 1.5,
  "difficulty": 5.2,
  "elapsed_days": 3,
  "scheduled_days": 7,
  "reps": 2,
  "lapses": 0,
  "state": "Review",
  "last_review": "2024-03-20T10:00:00Z",
  "due": "2024-03-27T10:00:00Z",
  "is_bookmarked": false,
  "createdAt": "2024-03-13T10:00:00Z",
  "updatedAt": "2024-03-20T10:00:00Z"
}
```

## API Endpoints

### Review API (`/api/v1/review`)
All require Bearer token authentication.

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/due` | Fetch due cards for review |
| POST | `/grade` | Grade card and reschedule |
| GET | `/stats` | Review statistics |
| POST | `/init` | Initialize FSRS tracking |

## Performance Optimizations

1. **Due Card Queries:** Compound index `(user_id, due)` for efficient sorting
2. **Offline Support:** localStorage queue prevents failed reviews from blocking session
3. **Bulk Init:** `insertMany(..., { ordered: false })` prevents race conditions
4. **Workbox Caching:**
   - Vocabulary: 24h stale-while-revalidate (safe, rarely changes)
   - Review: 1h network-first (must sync new grades)
5. **Aggregation:** Single pipeline for review statistics instead of multiple queries

## Future Architecture Considerations

- Service layer abstraction for business logic (currently in routes)
- Database connection pooling optimization
- Real-time sync via WebSocket for multi-device sessions
- Microservice extraction (auth, review, vocabulary as separate services)
- API versioning strategy for backward compatibility
