# Brainstorm: Comprehensive Upgrade - Learning Chinese Website

**Date:** 2026-03-23
**Status:** Agreed
**Target Users:** Students preparing for HSK/TOCFL exams
**Timeline:** 1-2 months, phased approach

---

## Problem Statement

Current app has solid foundation (React + Express + MongoDB + Telegram bot) but:
- ReviewPage uses **mock data**, not connected to backend
- No SRS algorithm (random shuffle only)
- No PWA support (not installable, no offline)
- No mock test engine for exam prep
- No listening/reading comprehension exercises
- Minimal gamification (only points + streaks)
- No tests
- TTS relies on browser SpeechSynthesis (quality varies by device)

## Evaluated Approaches

### Mobile App Strategy
| Approach | Effort | Verdict |
|----------|--------|---------|
| **PWA** | Low (1-2 days) | **Winner** - reuse 100% web code |
| Capacitor | Medium | Overkill for learning app |
| React Native | High | 2x maintenance, unnecessary |

**Decision: PWA** - installable, offline vocab, push notifications. Upgrade to Capacitor later if app store presence needed.

### AI Features
**Decision: Skip** - keep simple, focus on core learning features.

---

## Final Agreed Solution: 4 Phases

### Phase 1: Foundation & PWA (Week 1-2)

**Goal:** Solid technical foundation, PWA installable, fix existing gaps

**1.1 PWA Setup**
- Add `vite-plugin-pwa` (auto-generates service worker)
- Create `manifest.json` (app name, icons, theme color)
- Offline caching strategy: vocabulary data cached in IndexedDB
- App install prompt on mobile browsers

**1.2 Fix ReviewPage - Connect to Backend**
- Replace mock data imports with API calls via `progressStore`
- Fetch user's vocabulary from learned lessons
- Track review results in backend (known/unknown per word)

**1.3 Implement FSRS Algorithm**
- Add FSRS (Free Spaced Repetition Scheduler) - modern successor to SM-2
- npm package: `ts-fsrs` (TypeScript native)
- Backend: add `nextReview`, `stability`, `difficulty`, `reps` fields to UserProgress/Vocabulary
- Frontend: daily review queue based on due cards
- Priority: words marked "Study Again" appear sooner

**1.4 Database Schema Updates**
```
// Add to Vocabulary/UserProgress
{
  fsrs: {
    stability: Number,
    difficulty: Number,
    elapsedDays: Number,
    scheduledDays: Number,
    reps: Number,
    lapses: Number,
    state: String, // New, Learning, Review, Relearning
    lastReview: Date
  },
  nextReview: Date
}
```

**1.5 Project Docs & Code Quality**
- Write proper README.md
- Create docs/ folder structure (project-overview, code-standards, etc.)
- Add basic ESLint + Prettier config

**Deliverables:** PWA installable on mobile, SRS working, review connected to real data

---

### Phase 2: SRS Flashcards & Enhanced Review (Week 3-4)

**Goal:** Duolingo/Anki-quality flashcard experience

**2.1 Flashcard Modes**
- **Learn mode**: New words, show character → reveal pinyin + meaning
- **Review mode**: Due SRS cards, spaced repetition queue
- **Quick review**: Random 10-20 cards from specific topic/lesson
- **Exam cram**: All words from a HSK/TOCFL level

**2.2 Flashcard UI Enhancements**
- Swipe gestures (left = don't know, right = know) using framer-motion
- Progress bar showing remaining cards
- Card flip animation (3D CSS transform)
- Show Hán Việt (漢越) pronunciation for Vietnamese learners
- Stroke order animation (optional, if good library exists)

**2.3 Vocabulary Management**
- Personal word list (save/bookmark words)
- Custom flashcard decks
- Import/export vocabulary lists
- Search across all vocabulary with filters (HSK level, topic, mastery)

**2.4 Review Analytics**
- Accuracy rate per word
- Review history chart (words reviewed per day)
- Mastery distribution (pie chart: new/learning/review/mastered)
- Weak words list (lowest accuracy)

**Deliverables:** Full SRS system, swipeable flashcards, personal word lists, review analytics

---

### Phase 3: Exam Prep Suite (Week 5-6)

**Goal:** HSK/TOCFL mock test experience

**3.1 Mock Test Engine**
- Timed test mode (HSK format: listening, reading, writing sections)
- Question types:
  - Multiple choice (vocabulary meaning)
  - Fill in the blank (sentence completion)
  - Reading comprehension (passage + questions)
  - Listening comprehension (audio + questions)
  - Character/Pinyin matching
- Timer with auto-submit
- Difficulty scaled by HSK/TOCFL level

**3.2 Listening Comprehension**
- Current: browser SpeechSynthesis (acceptable for now)
- Enhancement: pre-generate audio files for key vocabulary using edge TTS or similar
- Listening exercises: play audio → select correct answer
- Speed control (0.5x, 0.75x, 1x, 1.25x)
- Replay limit in exam mode (simulate real test conditions)

**3.3 Reading Comprehension**
- Short passages (100-300 characters) with questions
- Vocabulary hover tooltip (tap word → see pinyin + meaning)
- Passage difficulty rated by HSK/TOCFL level
- Source: Tatoeba sentences combined into passages, or manually curated

**3.4 Score Analytics**
- Per-section score breakdown (listening, reading, vocabulary)
- Historical score trends (chart)
- Weak area detection → recommend practice topics
- Compare with HSK/TOCFL passing thresholds
- Estimated readiness meter (e.g., "HSK 4: 72% ready")

**3.5 Test History**
- Save all test attempts with detailed results
- Review wrong answers with explanations
- Retry wrong questions only

**Deliverables:** Full mock test engine, listening exercises, reading comprehension, score analytics

---

### Phase 4: Gamification & Polish (Week 7-8)

**Goal:** Engagement, retention, visual polish

**4.1 XP & Level System**
- XP earned from: flashcard reviews, exercises, mock tests, daily login, streaks
- Level progression (1-99) with titles (e.g., Level 10 = "Beginner Scholar 初學者")
- XP multiplier for streaks (2x on 7-day streak, 3x on 30-day)

**4.2 Achievement Badges**
- First lesson completed
- 7-day streak, 30-day streak, 100-day streak
- HSK level vocabulary mastered (all words in a level)
- Mock test high score
- 1000 flashcards reviewed
- Night owl (study after 10pm), Early bird (study before 7am)

**4.3 Learning Paths**
- Structured paths: "HSK 1 → HSK 6" roadmap
- Progress bars per HSK/TOCFL level
- Recommended next topic based on progress
- "This week's goal" setting (e.g., learn 50 new words)

**4.4 Leaderboard**
- Weekly XP leaderboard (anonymous or opt-in)
- Friends comparison (if social features desired)
- Top streaks display

**4.5 UI/UX Polish**
- Dark mode toggle (CSS variables already exist)
- Improved mobile responsive design
- Loading skeletons
- Toast notifications for achievements
- Smooth page transitions (framer-motion)
- Better error states and empty states

**4.6 Push Notifications (PWA)**
- Daily review reminder
- Streak warning ("Don't lose your 15-day streak!")
- Weekly progress summary
- New quiz available notification

**Deliverables:** XP system, badges, learning paths, leaderboard, dark mode, push notifications

---

## Architecture Considerations

### Frontend New Dependencies
```
vite-plugin-pwa     # PWA support
ts-fsrs             # FSRS algorithm
idb                 # IndexedDB wrapper for offline
chart.js / recharts # Analytics charts
```

### Backend New Collections
```
FlashcardDeck      # Custom user decks
MockTest           # Test templates
MockTestResult     # Detailed test results
Achievement        # Badge definitions
UserAchievement    # Earned badges per user
```

### API New Endpoints
```
GET  /api/v1/review/due          # Get due SRS cards
POST /api/v1/review/grade        # Grade a card (FSRS update)
GET  /api/v1/mock-tests          # List available tests
POST /api/v1/mock-tests/start    # Start a test
POST /api/v1/mock-tests/submit   # Submit test answers
GET  /api/v1/achievements        # List user achievements
GET  /api/v1/leaderboard         # Weekly leaderboard
GET  /api/v1/learning-path/:level # Get learning path for HSK level
```

### Offline Strategy (PWA)
- **Cache:** Static assets (JS, CSS, images) - Cache First
- **Cache:** Vocabulary data for learned lessons - Stale While Revalidate
- **Queue:** Review grades queued offline → sync when online
- **IndexedDB:** Store flashcard decks + due cards for offline review

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Audio quality (browser TTS) varies by device | Medium | Pre-generate key audio files; fallback to browser TTS |
| FSRS complexity | Low | `ts-fsrs` package handles algorithm; we just store/pass params |
| Mock test content quality | High | Use existing HSK vocabulary; manually curate reading passages |
| Scope creep | High | Strict phase gates; each phase has clear deliverables |
| Performance with large vocab sets | Medium | Pagination, virtual scrolling, IndexedDB for offline |

## Success Metrics

- **Phase 1:** PWA installable, Lighthouse PWA score >90, SRS review functional
- **Phase 2:** Users can review 50+ flashcards/session without lag, FSRS scheduling accurate
- **Phase 3:** Complete mock test for HSK 1-4, listening exercises work on mobile
- **Phase 4:** XP system tracking, 5+ achievement types, dark mode working

## Next Steps

If approved, create detailed implementation plan using `/plan` with phased approach.
