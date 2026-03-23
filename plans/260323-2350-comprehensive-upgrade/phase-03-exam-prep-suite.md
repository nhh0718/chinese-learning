# Phase 3: Exam Prep Suite

## Context Links
- [Phase 2: SRS Flashcards](./phase-02-srs-flashcards.md) - prerequisite
- [Current Exercise model](../../backend/src/models/Exercise.ts)
- [Current quiz-generator](../../backend/src/services/quiz-generator.ts)
- [Current ExercisePage](../../src/pages/ExercisePage.tsx)
- [Current DailyQuizPage](../../src/pages/DailyQuizPage.tsx)

## Overview
- **Priority:** P1 - High
- **Status:** Pending
- **Effort:** 24h
- **Description:** HSK/TOCFL mock test engine with timed tests, listening comprehension, reading comprehension, score analytics, and readiness tracking

## Key Insights
- Existing Exercise model supports: multiple_choice, matching, fill_blank - need to extend
- quiz-generator.ts only creates vocabulary meaning questions - needs more question types
- Browser SpeechSynthesis (useTTS hook) works for listening - acceptable quality for now
- HSK test format: Listening (40%), Reading (40%), Writing (20%) - mock should mirror this
- Tatoeba sentences exist in `backend/data/raw/tatoeba/` - usable for reading passages
- DailyQuiz already has a working quiz UI - can adapt for mock tests

## Requirements

### Functional
- Mock test selection: choose HSK level (1-6) or TOCFL level
- Timed test: configurable timer matching real exam duration
- Question types:
  - Listening: hear audio → select meaning/character
  - Reading: passage → answer comprehension questions
  - Vocabulary: character → meaning, pinyin → character, fill blank
  - Matching: match characters to meanings
- Auto-submit when timer expires
- Detailed results: per-section scores, wrong answer review
- Test history: all past attempts with scores
- Readiness meter: "HSK 4: 72% ready" based on vocabulary mastery + test scores

### Non-functional
- Timer accurate to 1 second
- Listening audio plays within 500ms
- Support 50+ questions per mock test
- Test submission < 2s

## Architecture

### New Models
```typescript
// backend/src/models/MockTest.ts
interface IMockTest {
  title: string;                // "HSK 4 Mock Test #1"
  standard: 'HSK' | 'TOCFL';
  level: number;
  duration_minutes: number;     // 90 for HSK 4
  sections: {
    type: 'listening' | 'reading' | 'vocabulary';
    questions: IMockQuestion[];
    weight: number;             // percentage of total score
  }[];
  total_questions: number;
}

// backend/src/models/MockTestResult.ts
interface IMockTestResult {
  user_id: ObjectId;
  test_id: ObjectId;
  started_at: Date;
  submitted_at: Date;
  time_spent_seconds: number;
  sections: {
    type: string;
    score: number;
    total: number;
    answers: { questionIndex: number; answer: string; correct: boolean }[];
  }[];
  total_score: number;
  total_possible: number;
  percentage: number;
}
```

### Question Types (extend existing Exercise)
```typescript
type MockQuestionType =
  | 'listening_meaning'     // Hear word → select Vietnamese meaning
  | 'listening_character'   // Hear word → select correct character
  | 'reading_comprehension' // Read passage → answer questions
  | 'vocab_meaning'         // See character → select meaning
  | 'vocab_pinyin'          // See character → select correct pinyin
  | 'fill_blank'            // Sentence with blank → fill correct word
  | 'matching'              // Match characters to meanings
```

### New Pages
```
src/pages/
├── MockTestListPage.tsx       # Browse available tests by level
├── MockTestSessionPage.tsx    # Active test with timer
├── MockTestResultPage.tsx     # Detailed results + wrong answers
├── MockTestHistoryPage.tsx    # Past test attempts
└── ReadinessPage.tsx          # HSK readiness meter
```

### New API Endpoints
```
GET  /api/v1/mock-tests                  → List available tests by level
GET  /api/v1/mock-tests/:id              → Get test details (questions)
POST /api/v1/mock-tests/:id/start        → Start attempt (records start time)
POST /api/v1/mock-tests/:id/submit       → Submit answers, get results
GET  /api/v1/mock-tests/history          → User's test history
GET  /api/v1/mock-tests/readiness/:level → Readiness score for HSK level
```

## Related Code Files

### Files to Modify
- `src/router/index.tsx` - add mock test routes
- `backend/src/index.ts` - register mock-test routes
- `backend/src/services/quiz-generator.ts` - extend for mock test generation
- `src/components/layout/Navbar.tsx` - add Exam Prep link

### Files to Create
- `backend/src/models/MockTest.ts`
- `backend/src/models/MockTestResult.ts`
- `backend/src/routes/mock-tests.ts`
- `backend/src/services/mock-test-generator.ts` - generate tests from vocabulary
- `backend/src/services/readiness-calculator.ts` - calculate readiness %
- `backend/src/scripts/seed-mock-tests.ts` - seed initial mock tests
- `src/pages/MockTestListPage.tsx`
- `src/pages/MockTestSessionPage.tsx`
- `src/pages/MockTestResultPage.tsx`
- `src/pages/MockTestHistoryPage.tsx`
- `src/pages/ReadinessPage.tsx`
- `src/stores/mockTestStore.ts`
- `src/components/exam/Timer.tsx`
- `src/components/exam/QuestionRenderer.tsx` - renders different question types
- `src/components/exam/SectionNav.tsx` - navigate between sections
- `src/components/exam/ReadingPassage.tsx` - passage with hover tooltips
- `src/components/exam/ListeningPlayer.tsx` - audio player for listening Qs
- `src/components/exam/ReadinessGauge.tsx` - circular gauge component

## Implementation Steps

### Step 1: Mock Test Models & Generator (5h)
1. Create `MockTest` model with sections structure
2. Create `MockTestResult` model
3. Create `mock-test-generator.ts`:
   - Input: HSK level, question count per section
   - Listening section: select vocab, use character as TTS text on frontend
   - Reading section: combine 3-5 Tatoeba sentences into a passage, generate comprehension Qs
   - Vocabulary section: reuse quiz-generator logic + add pinyin questions
4. Create `seed-mock-tests.ts` to generate 2-3 tests per HSK level

### Step 2: Mock Test API (4h)
1. Create `backend/src/routes/mock-tests.ts`:
   - `GET /` - list tests, filter by standard/level
   - `GET /:id` - get test with questions (auth required)
   - `POST /:id/start` - create MockTestResult with started_at
   - `POST /:id/submit` - grade answers, calculate scores, save result
   - `GET /history` - user's past results, sorted by date
2. Create `readiness-calculator.ts`:
   - Inputs: vocabulary mastery % for level + average test score
   - Formula: `readiness = (vocabMastery * 0.6) + (avgTestScore * 0.4)`
   - `GET /readiness/:level` endpoint

### Step 3: Mock Test Store (2h)
1. Create `src/stores/mockTestStore.ts`:
   - `availableTests`, `currentTest`, `currentAnswers`
   - `timeRemaining` (countdown timer)
   - `startTest()`, `answerQuestion()`, `submitTest()`
   - Timer logic: setInterval, auto-submit at 0

### Step 4: Mock Test Pages (8h)
1. **MockTestListPage.tsx** (2h):
   - Grid of HSK/TOCFL levels
   - Each level shows: available tests, best score, readiness %
   - Click → start test
2. **MockTestSessionPage.tsx** (4h):
   - Top bar: timer countdown, section tabs, question nav dots
   - Question area: renders QuestionRenderer based on type
   - Listening: play audio button (uses useTTS), options
   - Reading: passage panel + question panel side-by-side
   - Vocabulary: standard multiple choice
   - Bottom: Previous/Next buttons, Submit button
   - Auto-submit dialog when timer hits 0
3. **MockTestResultPage.tsx** (2h):
   - Score summary: total %, per-section %
   - Wrong answers list with correct answer + explanation
   - "Retry Wrong Only" button
   - Comparison to passing threshold

### Step 5: Reading Comprehension Component (3h)
1. `ReadingPassage.tsx`:
   - Display Chinese text passage (200-400 chars)
   - Tap/hover word → tooltip with pinyin + meaning (use vocabulary lookup)
   - Highlight key vocabulary
2. Load passages from Tatoeba data or create dedicated collection
3. Generate comprehension questions: "What does the passage mainly discuss?", "What does 他 refer to?"

### Step 6: Readiness & History (2h)
1. `ReadinessPage.tsx`:
   - Show readiness gauge per HSK level (1-6)
   - Breakdown: vocab mastery %, avg test score, recommendation
   - "Weak areas" list → link to relevant flashcard cram session
2. `MockTestHistoryPage.tsx`:
   - List of past attempts with date, score, duration
   - Click → MockTestResultPage for that attempt

## Todo List
- [ ] Create MockTest and MockTestResult models
- [ ] Create mock-test-generator.ts service
- [ ] Create readiness-calculator.ts service
- [ ] Create mock-tests API routes
- [ ] Seed 2-3 mock tests per HSK level
- [ ] Create mockTestStore.ts
- [ ] Build Timer component
- [ ] Build QuestionRenderer (handles all question types)
- [ ] Build MockTestListPage
- [ ] Build MockTestSessionPage with timer + auto-submit
- [ ] Build MockTestResultPage with wrong answer review
- [ ] Build ReadingPassage component with word tooltips
- [ ] Build ListeningPlayer component (SpeechSynthesis)
- [ ] Build ReadinessGauge component
- [ ] Build ReadinessPage and MockTestHistoryPage
- [ ] Add routes to router
- [ ] Test full mock test flow: start → answer → submit → results

## Success Criteria
- Complete HSK 1-4 mock test available (6+ tests)
- Timer works correctly, auto-submits at 0
- Listening questions play audio via TTS
- Reading passages display with vocabulary tooltips
- Score calculation accurate, per-section breakdown
- Readiness meter reflects actual vocabulary mastery + test performance
- Test history persists and shows trends

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Reading passage quality (auto-generated) | High | Start with Tatoeba sentences; manually curate later |
| TTS quality inconsistent across devices | Medium | Pre-test TTS availability, fallback message |
| Mock test too easy/hard | Medium | Calibrate question difficulty from vocab HSK level |
| Large test (50+ questions) UI perf | Low | Render current question only, lazy load |

## Security Considerations
- All mock test endpoints require auth
- Test questions not exposed without starting a test (prevent cheating)
- Results scoped to user_id
- Timer enforced server-side (check time between start and submit)

## Next Steps
- Phase 4 adds XP rewards for completing tests
- Achievement triggers: first test, perfect score, all HSK levels attempted
