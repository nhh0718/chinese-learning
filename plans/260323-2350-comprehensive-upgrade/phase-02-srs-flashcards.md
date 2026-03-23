# Phase 2: SRS Flashcards & Enhanced Review

## Context Links
- [Phase 1: Foundation & PWA](./phase-01-foundation-and-pwa.md) - prerequisite
- [Current ReviewPage](../../src/pages/ReviewPage.tsx)
- [progressStore](../../src/stores/progressStore.ts)
- [Vocabulary model](../../backend/src/models/Vocabulary.ts)

## Overview
- **Priority:** P1 - High
- **Status:** Complete
- **Effort:** 20h
- **Description:** Build Duolingo/Anki-quality flashcard system with multiple modes, swipe gestures, personal word lists, and review analytics

## Key Insights
- Phase 1 provides VocabularyProgress model + FSRS grading - this phase builds UI on top
- Current review is single-mode only (random cards) - need Learn/Review/Cram modes
- Framer Motion already in deps - use for swipe gestures
- Vietnamese learners benefit from Hán Việt (漢越) display - unique differentiator
- Vocabulary search exists but no bookmark/save feature

## Requirements

### Functional
- 4 flashcard modes: Learn, Review (SRS), Quick Review, Exam Cram
- Swipe gestures (left=don't know, right=know) on mobile
- Personal word list (bookmark/save words)
- Custom flashcard decks (create, edit, share)
- Vocabulary search with filters (HSK level, topic, mastery state)
- Review analytics dashboard (accuracy, daily count, mastery distribution)

### Non-functional
- Smooth 60fps swipe animations
- Card flip < 100ms
- Support 500+ cards in a deck without performance issues

## Architecture

### New Frontend Pages/Components
```
src/
├── pages/
│   ├── FlashcardsPage.tsx          # Mode selection hub
│   ├── FlashcardSessionPage.tsx    # Active session (learn/review/cram)
│   ├── WordListPage.tsx            # Personal bookmarked words
│   └── ReviewAnalyticsPage.tsx     # Charts & stats
├── components/
│   ├── flashcard/
│   │   ├── FlashcardSwipeable.tsx  # Swipeable card with gestures
│   │   ├── FlashcardContent.tsx    # Card face content (character, pinyin, etc.)
│   │   ├── GradeButtons.tsx        # Again/Hard/Good/Easy buttons
│   │   ├── SessionProgress.tsx     # Progress bar + stats
│   │   └── ModeSelector.tsx        # Choose flashcard mode
│   └── analytics/
│       ├── MasteryChart.tsx        # Pie chart: new/learning/review/mastered
│       ├── DailyReviewChart.tsx    # Bar chart: reviews per day
│       └── AccuracyTable.tsx       # Weakest words table
```

### New Backend Endpoints
```
GET  /api/v1/vocabulary/bookmarks        → User's bookmarked words
POST /api/v1/vocabulary/:id/bookmark     → Toggle bookmark
GET  /api/v1/vocabulary/search           → Search with filters (level, topic, state)
GET  /api/v1/review/analytics            → Review stats (7/30 day)
GET  /api/v1/review/weak-words           → Bottom 20 accuracy words
POST /api/v1/review/start-session        → Start a session (mode, deck/level)
```

### New Zustand Store
```typescript
// src/stores/flashcardStore.ts
interface FlashcardStore {
  mode: 'learn' | 'review' | 'quick' | 'cram';
  cards: FlashcardItem[];
  currentIndex: number;
  sessionStats: { correct: number; incorrect: number; skipped: number };
  // Actions
  startSession(mode, options): void;
  gradeCard(grade): void;
  nextCard(): void;
  endSession(): void;
}
```

## Related Code Files

### Files to Modify
- `src/router/index.tsx` - add new routes
- `src/stores/progressStore.ts` - add bookmark actions
- `backend/src/routes/vocabulary.ts` - add bookmark + search filters
- `backend/src/routes/review.ts` - add analytics + weak-words endpoints
- `backend/src/models/VocabularyProgress.ts` - add `is_bookmarked` field (from Phase 1)
- `src/components/layout/Navbar.tsx` - add Flashcards nav link

### Files to Create
- `src/pages/FlashcardsPage.tsx` - mode selection hub
- `src/pages/FlashcardSessionPage.tsx` - active session
- `src/pages/FlashcardsPage.css`
- `src/pages/FlashcardSessionPage.css`
- `src/pages/WordListPage.tsx` - bookmarked words
- `src/pages/ReviewAnalyticsPage.tsx` - charts
- `src/stores/flashcardStore.ts` - session state
- `src/components/flashcard/FlashcardSwipeable.tsx`
- `src/components/flashcard/FlashcardContent.tsx`
- `src/components/flashcard/GradeButtons.tsx`
- `src/components/flashcard/SessionProgress.tsx`
- `src/components/flashcard/ModeSelector.tsx`
- `src/components/analytics/MasteryChart.tsx`
- `src/components/analytics/DailyReviewChart.tsx`

## Implementation Steps

### Step 1: Flashcard Store & Session Logic (3h)
1. Create `src/stores/flashcardStore.ts`
2. Session modes:
   - **Learn:** Fetch new words (state='New') from a topic/level, limit 20
   - **Review:** Fetch due SRS cards (from Phase 1 API), no limit
   - **Quick:** Random 15 cards from a specific topic
   - **Cram:** All words from a HSK/TOCFL level, no FSRS
3. Track session stats: correct/incorrect/skipped, time spent

### Step 2: Swipeable Flashcard Component (4h)
1. Create `FlashcardSwipeable.tsx` using framer-motion `useDragControls`:
   - Drag left → grade "Again" (red glow)
   - Drag right → grade "Good" (green glow)
   - Tap → flip card
   - Swipe threshold: 100px
2. Card front: character (large), pinyin, zhuyin, TTS button
3. Card back: meaning_vi, han_viet, example sentence, character (small)
4. Visual feedback: card tilts on drag, color changes

### Step 3: Flashcard Pages (4h)
1. `FlashcardsPage.tsx` - hub with 4 mode cards:
   - Learn New (🆕) - pick topic/level
   - Daily Review (📖) - due SRS cards count badge
   - Quick Review (⚡) - pick topic, 15 cards
   - Exam Cram (📝) - pick HSK/TOCFL level
2. `FlashcardSessionPage.tsx`:
   - Render FlashcardSwipeable + GradeButtons
   - SessionProgress bar (X/total)
   - Session complete screen with stats
3. Add routes to `src/router/index.tsx`:
   - `/flashcards` → FlashcardsPage
   - `/flashcards/session` → FlashcardSessionPage

### Step 4: Bookmark/Word List Feature (3h)
1. Backend: add `POST /vocabulary/:id/bookmark` (toggle)
2. Backend: add `GET /vocabulary/bookmarks` (user's list)
3. Frontend: `WordListPage.tsx` - shows bookmarked words with search/filter
4. Add bookmark icon to VocabularyCard component (exists in lesson pages)
5. Add bookmark icon to flashcard back face

### Step 5: Review Analytics (4h)
1. Backend `GET /review/analytics`:
   - Total words learned, reviews today, streak
   - Mastery distribution (count by state: New/Learning/Review/Mastered)
   - Daily review counts (last 30 days)
   - Accuracy rate (correct grades / total grades)
2. Frontend `ReviewAnalyticsPage.tsx`:
   - Install `recharts`: `npm install recharts`
   - MasteryChart: donut chart (New=gray, Learning=yellow, Review=blue, Mastered=green)
   - DailyReviewChart: bar chart (last 30 days)
   - Weak words table: bottom 20 by accuracy, with "Practice" button
3. Add route `/analytics` to router

### Step 6: Navigation Update (2h)
1. Update Navbar with new links: Flashcards, Word List, Analytics
2. Add due card count badge on Flashcards link (shows pending reviews)
3. Mobile bottom nav: Home, Topics, Flashcards, Progress, More

## Todo List
- [x] Create flashcardStore.ts with session modes
- [x] Build FlashcardSwipeable component with drag gestures
- [x] Build FlashcardContent (front/back faces)
- [x] Build GradeButtons and SessionProgress components
- [x] Create FlashcardsPage (mode selection hub)
- [x] Create FlashcardSessionPage (active learning)
- [x] Add bookmark toggle API endpoint
- [x] Create WordListPage
- [x] Install recharts
- [x] Create review analytics API endpoint
- [x] Create ReviewAnalyticsPage with charts
- [x] Update router with new routes
- [x] Update Navbar with Flashcards link + badge
- [x] Test swipe gestures on mobile
- [x] Test all 4 flashcard modes end-to-end

## Success Criteria
- All 4 modes work: Learn, Review, Quick, Cram
- Swipe gestures smooth on mobile (60fps)
- Bookmark words from any page, view in Word List
- Analytics show accurate mastery distribution and daily counts
- Session complete screen shows correct/incorrect stats

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Swipe conflicts with scroll on mobile | Medium | Use framer-motion drag constraints, lock axis |
| Large deck (500+ cards) perf | Low | Virtual rendering, load in batches |
| recharts bundle size | Low | Tree-shake, import only needed charts |

## Security Considerations
- Bookmark/analytics endpoints require auth middleware
- Bookmark scoped to user_id
- No PII in analytics responses

## Next Steps
- Phase 3 uses flashcard session engine for mock test questions
- Analytics data feeds Phase 4 achievement triggers
