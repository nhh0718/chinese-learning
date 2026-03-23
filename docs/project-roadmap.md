# Project Roadmap

## Project Overview

**Learn Chinese** is a full-stack web application for HSK & TOCFL exam preparation using modern spaced repetition (FSRS algorithm). Users learn Chinese characters, vocabulary, and grammar through interactive lessons and daily review sessions.

**Current Status:** Phase 1 Complete (FSRS Review System MVP)

---

## Phase 1: FSRS Review System (COMPLETED ✅)

**Status:** Complete
**Completion Date:** 2024-03-24
**Duration:** ~3 weeks
**Priority:** Critical (MVP foundation)

### Objectives
- Implement Free Spaced Repetition System (FSRS) algorithm
- Build review card tracking database
- Create review API and frontend interface
- Add PWA support for offline functionality
- Enable offline-first grade queueing

### Deliverables

#### Backend
- [x] VocabularyProgress model with FSRS fields and indexes
- [x] FSRS service wrapper around ts-fsrs library
- [x] Review API with 4 endpoints (due, grade, stats, init)
- [x] Authentication middleware for protected routes

#### Frontend
- [x] Review store (Zustand) with offline queue support
- [x] Review page with 4-button FSRS grading interface
- [x] PWA configuration (vite-plugin-pwa + Workbox)
- [x] Offline grade queueing and sync on reconnection
- [x] Review types (ReviewCard, ReviewStats, FSRSGrade)

#### Infrastructure
- [x] vite-plugin-pwa integration
- [x] Service worker caching strategies
- [x] Online event listener for auto-sync
- [x] Environment configuration centralization

### Key Features
- **Spaced Repetition:** SM2-based algorithm with customizable difficulty curves
- **Offline Support:** Network-first caching with localStorage fallback
- **Efficient Queries:** Compound indexes for due date lookups
- **Bulk Initialization:** Lazy FSRS record creation to prevent database bloat
- **Real-time Stats:** Review statistics dashboard

### Success Metrics
- ✅ Users can review vocabulary with spaced repetition
- ✅ Offline reviews are queued and synced on reconnection
- ✅ Review session loads <1s for 50 cards
- ✅ PWA installable on mobile and desktop

---

## Phase 2: Advanced Review Features (PLANNED 📋)

**Status:** Not Started
**Estimated Duration:** 2-3 weeks
**Priority:** High
**Dependencies:** Phase 1 Complete

### Objectives
- Enhance review UX with timeline and progress visualization
- Add streak tracking and daily goals
- Implement review scheduling optimization
- Create detailed performance analytics

### Planned Features

#### UI Enhancements
- [ ] Spaced rep timeline visualization (next review dates)
- [ ] Progress bars for each review state (new/learning/review/relearning)
- [ ] Streak counter and milestone badges
- [ ] Review history with performance graphs

#### Scheduling & Optimization
- [ ] Smart review scheduling (prioritize difficult cards)
- [ ] Daily review goal system (e.g., "review 50 cards today")
- [ ] Review reminders and notifications
- [ ] Optimal batch sizing based on user pace

#### Analytics Dashboard
- [ ] Cards mastered (state = Review with 10+ reps)
- [ ] Retention rate (success rate % over time)
- [ ] Difficulty distribution histogram
- [ ] Daily/weekly/monthly review charts

#### Notifications
- [ ] Desktop notifications for due cards
- [ ] Email digest of daily goals
- [ ] Telegram reminder integration

### Implementation Notes
- Extend ReviewStats type with additional metrics
- Create analytics aggregation pipeline
- Build visualization components (charts, timelines)
- Consider database indexes for time-based queries

---

## Phase 3: Exam Simulation (PLANNED 📋)

**Status:** Backlog
**Estimated Duration:** 3-4 weeks
**Priority:** High
**Dependencies:** Phase 1-2 Complete

### Objectives
- Create timed practice exams mimicking real HSK/TOCFL format
- Track performance against exam standards
- Provide targeted weak area identification

### Planned Features

#### Exam Types
- [ ] HSK full mock exams (Levels 1-6)
- [ ] TOCFL full mock exams (Beginner-Advanced)
- [ ] Mini-quizzes by topic
- [ ] Custom exam builder

#### Exam Session Management
- [ ] Timed sections (reading, listening, writing)
- [ ] Question randomization
- [ ] Auto-submit on time limit
- [ ] Progress indicator during exam

#### Scoring & Analysis
- [ ] Section-level scores (listening, reading, writing)
- [ ] Difficulty-based performance (weak vs. strong areas)
- [ ] Comparison to historical attempts
- [ ] Benchmarking against average scores

#### Performance Insights
- [ ] Recommended weak area focus (return to Phase 2)
- [ ] Estimated real exam grade prediction
- [ ] Time management analysis
- [ ] Error pattern identification

### Data Model Extensions
```typescript
ExamSession {
  userId, examType, level, score, totalScore,
  startTime, endTime, answers, performanceMetrics
}
```

---

## Phase 4: Social & Gamification (PLANNED 📋)

**Status:** Backlog
**Estimated Duration:** 3-4 weeks
**Priority:** Medium
**Dependencies:** Phase 1-3 Complete

### Objectives
- Build community engagement features
- Implement gamification for motivation
- Enable peer learning and collaboration

### Planned Features

#### Leaderboards
- [ ] Global leaderboard (cards reviewed, streaks, exam scores)
- [ ] Weekly and monthly rankings
- [ ] Leaderboard filtering (by level, region, language)
- [ ] Achievement badges and trophies

#### Study Groups
- [ ] Create/join study groups
- [ ] Group progress tracking
- [ ] Shared study notes and tips
- [ ] Group challenges (who can review 100 cards first?)

#### Social Sharing
- [ ] Share review milestones (100th card, 30-day streak)
- [ ] Challenge friends to exams
- [ ] Share study progress snapshots
- [ ] Social login (WeChat, Line)

#### Gamification Elements
- [ ] Experience points (XP) system
- [ ] Level progression (novice → expert)
- [ ] Daily streaks and milestones
- [ ] Special events and limited-time challenges

### Notifications & Engagement
- [ ] Friend activity feed
- [ ] Group update notifications
- [ ] Challenge invitations
- [ ] Weekly engagement digest

---

## Phase 5: Content Expansion (PLANNED 📋)

**Status:** Backlog
**Estimated Duration:** Ongoing
**Priority:** Medium
**Dependencies:** Phase 1 Complete

### Objectives
- Expand vocabulary and lesson content
- Add media (audio, images, videos)
- Improve example sentence diversity

### Planned Content
- [ ] HSK 1-6 full vocabulary (5000+ words)
- [ ] Grammar explanations and examples
- [ ] Audio pronunciation for all vocabulary
- [ ] Sentence examples from real materials
- [ ] Cultural notes and contextual usage
- [ ] Radical decomposition for character learning
- [ ] Stroke order animations
- [ ] Video dialogues for listening practice

### Content Quality Metrics
- Pronunciation audio coverage: target 100%
- Example sentence diversity: 3+ per word
- Native speaker reviewed: all new content
- User-reported error rate: <0.5%

---

## Phase 6: Mobile App (PLANNED 📋)

**Status:** Backlog
**Estimated Duration:** 6+ weeks
**Priority:** Medium
**Dependencies:** Phase 1-2 Complete

### Objectives
- Native iOS and Android apps
- Offline-first architecture
- Platform-specific optimizations

### Considerations
- React Native for code sharing
- Offline SQLite database
- Push notifications
- Mobile-specific UI (bottom tabs, swipe gestures)
- Integration with native spaced repetition libraries

---

## Phase 7: AI & Personalization (PLANNED 📋)

**Status:** Backlog
**Estimated Duration:** 4-6 weeks
**Priority:** Low
**Dependencies:** Phase 1-3 Complete

### Objectives
- Personalize learning paths
- Generate custom exercises
- Provide intelligent feedback

### Planned Features

#### Adaptive Learning Paths
- [ ] AI-driven difficulty adjustment
- [ ] Custom review scheduling based on retention
- [ ] Recommend focus areas based on exam patterns
- [ ] Predict user readiness for next HSK level

#### Content Generation
- [ ] Generate practice sentences with new vocabulary
- [ ] Create fill-in-the-blank exercises
- [ ] Generate multiple choice questions
- [ ] Provide contextual usage examples

#### Intelligent Feedback
- [ ] Pronunciation feedback (audio comparison)
- [ ] Character stroke accuracy checking
- [ ] Grammar error explanation
- [ ] Performance trend analysis

### Technical Approach
- Fine-tuned LLM for Chinese education
- Speech-to-text for pronunciation assessment
- Computer vision for stroke validation
- Machine learning for retention prediction

---

## Completed Milestones

### Sprint 1: Project Setup & Foundation (Week 1)
- [x] React + Vite frontend scaffold
- [x] Express.js + MongoDB backend
- [x] User authentication (JWT)
- [x] Topic and lesson content model

### Sprint 2: Learning Interface (Week 2)
- [x] Lesson page with vocabulary display
- [x] Progress tracking model
- [x] Exercise types (multiple choice, fill-blank, matching)
- [x] Telegram daily quiz integration

### Sprint 3: FSRS Review System (Week 3) ✅ PHASE 1
- [x] VocabularyProgress model
- [x] FSRS algorithm integration (ts-fsrs)
- [x] Review API endpoints
- [x] PWA configuration
- [x] Offline grade queueing
- [x] ReviewPage component

### Bug Fixes & Optimization
- [x] Auth middleware double-response fix
- [x] Telegram username vs. name handling
- [x] Pinyin tone mark detection
- [x] Quiz link generation and web app integration

---

## Success Metrics & KPIs

### Phase 1 Metrics (Achieved ✅)
- [ ] Review session load time: <1s
- [ ] Offline sync success rate: >99%
- [ ] User retention week 1 to week 2: >60%
- [ ] Average cards reviewed per session: 20+
- [ ] PWA install rate on mobile: >30%

### Ongoing Metrics
- **Learning Engagement:** Cards reviewed per day, daily active users
- **Content Quality:** User-reported errors, pronunciation accuracy
- **Performance:** API response times, database query optimization
- **Retention:** 30-day retention, review consistency
- **Social Metrics:** Study group participation, streak rates

---

## Risk Mitigation

### Technical Risks
- **FSRS Algorithm Complexity:** Mitigated by using proven ts-fsrs library with test coverage
- **Database Scaling:** Plan sharding strategy as user base grows; current unique index prevents duplication
- **Offline Sync Race Conditions:** Handled by ordered:false insertMany; retry logic in store

### Business Risks
- **Content Moderation:** Partner with native speakers for quality reviews
- **User Acquisition:** Focus on Telegram integration for viral growth; referral system planned
- **Competitor Pressure:** Differentiate via FSRS, Telegram integration, PWA offline support

---

## Resource Requirements

### Backend
- 1 Backend engineer (Node.js, MongoDB, Express)
- 1 QA engineer (API testing, database validation)

### Frontend
- 1 Frontend engineer (React, Vite, PWA)
- 1 UI/UX designer (layouts, accessibility)

### DevOps
- 1 DevOps engineer (infrastructure, CI/CD, monitoring)
- Part-time: Deployment, scaling, monitoring

### Content
- 1-2 Content creators (vocabulary, lessons, example sentences)
- 1-2 Native speakers (review, pronunciation)

---

## Budget & Timeline

| Phase | Duration | Est. Cost | Status |
|-------|----------|-----------|--------|
| 1: FSRS | 3 weeks | Completed | ✅ Done |
| 2: Advanced Features | 2-3 weeks | $5K | 📋 Planned |
| 3: Exam Simulation | 3-4 weeks | $8K | 📋 Planned |
| 4: Social | 3-4 weeks | $10K | 📋 Planned |
| 5: Content Expansion | Ongoing | $15K/year | 📋 Planned |
| 6: Mobile App | 6+ weeks | $20K | 📋 Planned |
| 7: AI & Personalization | 4-6 weeks | $25K | 📋 Planned |

**Total Estimated:** ~$83K + Ongoing Content

---

## Next Actions

1. **Immediate (This Week):**
   - [ ] Deploy Phase 1 to production
   - [ ] Gather user feedback on review UX
   - [ ] Set up monitoring and analytics

2. **Next Sprint (Phase 2 Kickoff):**
   - [ ] Design Phase 2 UI mockups
   - [ ] Plan analytics aggregation pipeline
   - [ ] Prepare notification infrastructure
   - [ ] Start Phase 2 research/design

3. **Infrastructure:**
   - [ ] Database backup strategy
   - [ ] Auto-scaling configuration
   - [ ] Logging and error tracking (Sentry)
   - [ ] Performance monitoring (New Relic, Datadog)

---

## Contact & Questions

For roadmap updates, feature requests, or collaboration inquiries, please reach out to the development team.

Last Updated: 2024-03-24
