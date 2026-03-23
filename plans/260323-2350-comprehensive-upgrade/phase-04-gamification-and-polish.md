# Phase 4: Gamification & Polish

## Context Links
- [Phase 1-3 Prerequisites](./plan.md)
- [User model](../../backend/src/models/User.ts) - has points, streak, lastQuizDate
- [points-calculator service](../../backend/src/services/points-calculator.ts)
- [CSS variables](../../src/styles/variables.css)

## Overview
- **Priority:** P2 - Medium
- **Status:** Complete
- **Effort:** 20h
- **Note:** Core gamification features implemented. Deferred: Push notifications, loading skeletons, page transitions
- **Description:** XP/level system, achievements, learning paths, leaderboard, dark mode, push notifications, UI polish

## Key Insights
- User model already has `points` and `streak` fields - extend with `xp` and `level`
- points-calculator.ts exists - extend for XP calculation
- CSS variables.css already defines color scheme - add dark mode variants
- Framer motion already available for animations
- PWA from Phase 1 enables push notifications

## Requirements

### Functional
- XP earned from all activities (flashcards, tests, daily login, streaks)
- Level system (1-99) with Chinese-themed titles
- Achievement badges (15+ types)
- Learning paths per HSK level with progress tracking
- Weekly XP leaderboard
- Dark mode toggle
- Push notifications (daily review, streak warning)

### Non-functional
- Dark mode: instant toggle, no flash
- Leaderboard loads < 1s
- Notifications respect user timezone
- Smooth animations (60fps)

## Architecture

### New Models
```typescript
// backend/src/models/Achievement.ts
interface IAchievement {
  key: string;           // 'first_lesson', 'streak_7', 'hsk1_master'
  title: string;
  title_vi: string;
  description: string;
  icon: string;          // emoji or icon name
  category: 'learning' | 'streak' | 'exam' | 'social';
  condition: {
    type: string;        // 'streak', 'reviews', 'test_score', 'vocab_mastered'
    threshold: number;
    level?: number;      // for level-specific achievements
  };
}

// backend/src/models/UserAchievement.ts
interface IUserAchievement {
  user_id: ObjectId;
  achievement_key: string;
  earned_at: Date;
}
```

### XP System Design
```
Activity               | XP
-----------------------|-----
Flashcard review (per card) | 5
New word learned       | 10
Daily quiz completed   | 25
Mock test completed    | 50
Perfect mock test score| 100 (bonus)
Daily login            | 15
Streak bonus (7 days)  | 2x multiplier
Streak bonus (30 days) | 3x multiplier
```

### Level Thresholds
```
Level 1-10:   100 XP per level  (初學者 Beginner)
Level 11-30:  250 XP per level  (學生 Student)
Level 31-50:  500 XP per level  (進步者 Intermediate)
Level 51-70:  1000 XP per level (高手 Advanced)
Level 71-99:  2000 XP per level (大師 Master)
```

### New API Endpoints
```
GET  /api/v1/gamification/profile     → XP, level, streak, achievements
POST /api/v1/gamification/xp          → Award XP (internal, called by other routes)
GET  /api/v1/achievements             → All achievements with earned status
GET  /api/v1/leaderboard/weekly       → Top 50 users by weekly XP
GET  /api/v1/learning-paths/:level    → Learning path for HSK level
POST /api/v1/notifications/subscribe  → Subscribe to push notifications
```

## Related Code Files

### Files to Modify
- `backend/src/models/User.ts` - add xp, level fields
- `backend/src/services/points-calculator.ts` - extend for XP
- `backend/src/routes/review.ts` - award XP on grade
- `backend/src/routes/mock-tests.ts` - award XP on test submit
- `backend/src/routes/progress.ts` - award XP on lesson complete
- `src/styles/variables.css` - add dark mode CSS variables
- `src/hooks/useTheme.ts` - implement dark mode toggle
- `src/components/layout/Layout.tsx` - apply theme class
- `src/components/layout/Navbar.tsx` - add dark mode toggle, XP display
- `src/pages/ProgressPage.tsx` - show XP, level, achievements

### Files to Create
- `backend/src/models/Achievement.ts`
- `backend/src/models/UserAchievement.ts`
- `backend/src/routes/gamification.ts`
- `backend/src/services/xp-service.ts` - XP calculation + level-up logic
- `backend/src/services/achievement-checker.ts` - check & award achievements
- `backend/src/scripts/seed-achievements.ts` - seed achievement definitions
- `src/pages/AchievementsPage.tsx`
- `src/pages/LeaderboardPage.tsx`
- `src/pages/LearningPathPage.tsx`
- `src/stores/gamificationStore.ts`
- `src/components/gamification/XPBar.tsx` - animated XP progress bar
- `src/components/gamification/LevelBadge.tsx` - level display
- `src/components/gamification/AchievementToast.tsx` - popup on earn
- `src/components/gamification/StreakDisplay.tsx`

## Implementation Steps

### Step 1: XP & Level System (4h)
1. Add to User model: `xp: Number`, `level: Number`, `weeklyXp: Number`, `weeklyXpResetAt: Date`
2. Create `xp-service.ts`:
   - `awardXP(userId, amount, reason)` - add XP, check level-up, apply streak multiplier
   - `calculateLevel(totalXp)` → level number + title
   - `getXPForNextLevel(currentLevel)` → XP needed
   - Reset `weeklyXp` every Monday
3. Integrate XP awards into existing routes:
   - `POST /review/grade` → +5 XP per card
   - `POST /mock-tests/:id/submit` → +50 XP (bonus for perfect)
   - `POST /progress/:lessonId` → +25 XP on completion

### Step 2: Achievements (4h)
1. Create Achievement + UserAchievement models
2. Create `achievement-checker.ts`:
   - `checkAndAward(userId, event, data)` - check conditions, create UserAchievement if met
   - Events: 'review_complete', 'test_complete', 'streak_update', 'vocab_mastered'
3. Seed 15+ achievements:
   - 🎯 First Steps: complete first lesson
   - 🔥 On Fire: 7-day streak
   - 🏆 Unstoppable: 30-day streak
   - 📚 Bookworm: learn 100 words
   - 🎓 HSK 1 Master: master all HSK 1 vocabulary
   - 💯 Perfect Score: 100% on a mock test
   - 🌙 Night Owl: study after 22:00
   - 🌅 Early Bird: study before 07:00
   - ⚡ Speed Runner: review 50 cards in one session
   - 📖 Dedicated: review 7 days in a row
4. Create `GET /achievements` endpoint

### Step 3: Gamification Pages (4h)
1. `gamificationStore.ts`: xp, level, achievements, leaderboard data
2. `AchievementsPage.tsx`: grid of all badges (earned = colored, unearned = gray)
3. `LeaderboardPage.tsx`: weekly ranking table with XP
4. `LearningPathPage.tsx`: HSK 1-6 roadmap, progress bars per level, recommended next topic
5. Update `ProgressPage.tsx`: show XP bar, level, streak, recent achievements

### Step 4: Dark Mode (3h)
1. Update `variables.css`:
   ```css
   :root { --bg: #ffffff; --text: #1a1a2e; ... }
   [data-theme="dark"] { --bg: #1a1a2e; --text: #e0e0e0; ... }
   ```
2. Update `useTheme.ts`: toggle `data-theme` on document, persist in localStorage
3. Add dark mode toggle to Navbar (sun/moon icon)
4. Test all pages in dark mode, fix contrast issues

### Step 5: Push Notifications (3h)
1. PWA already has service worker (Phase 1)
2. Add notification permission request on first login
3. Backend: schedule notifications via node-cron:
   - Daily review reminder (configurable time)
   - Streak warning ("Your 15-day streak expires in 2 hours!")
4. Frontend: handle notification click → open relevant page
5. Respect user timezone (stored in TelegramSubscription model, reuse)

### Step 6: UI Polish (2h)
1. Loading skeletons for pages (use CSS animation)
2. AchievementToast: slide-in notification when badge earned
3. XPBar animation: smooth fill on XP gain
4. Page transitions: framer-motion AnimatePresence on route changes
5. Empty states: friendly illustrations/messages when no data
6. Error states: retry buttons, helpful messages

## Todo List
- [x] Add xp, level, weeklyXp fields to User model
- [x] Create xp-service.ts with level calculation
- [x] Integrate XP awards into review, mock-test, progress routes
- [x] Create Achievement and UserAchievement models
- [x] Create achievement-checker.ts service
- [x] Seed 15+ achievement definitions
- [x] Create gamification API routes
- [x] Create gamificationStore.ts
- [x] Build AchievementsPage with badge grid
- [x] Build LeaderboardPage with weekly ranking
- [x] Build LearningPathPage with HSK roadmap
- [x] Update ProgressPage with XP bar and level
- [x] Implement dark mode CSS variables
- [x] Add dark mode toggle to Navbar
- [x] Test all pages in dark mode
- [ ] Add push notification support (DEFERRED)
- [x] Build AchievementToast component
- [ ] Add loading skeletons and empty states (DEFERRED)
- [ ] Add page transition animations (DEFERRED)

## Success Criteria
- XP awarded for all activities, level-up works correctly
- 15+ achievements earnable with visual feedback (toast)
- Leaderboard shows weekly top users
- Learning path shows clear HSK progression
- Dark mode: no flash on toggle, all pages readable
- Push notifications: daily reminder works on mobile
- UI smooth: no janky animations, proper loading states

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Push notification permission denied | Medium | Graceful fallback, re-ask later |
| Dark mode: missed color overrides | Low | Systematic CSS variable usage, manual testing |
| Leaderboard gaming (fake accounts) | Low | Rate limit, require email verification |
| XP formula imbalanced | Medium | Monitor, adjust multipliers post-launch |

## Security Considerations
- XP awards server-side only (no client manipulation)
- Leaderboard: no email/personal info exposed
- Push notification tokens stored securely
- Achievement conditions validated server-side

## Next Steps
- Post-Phase 4: gather user feedback, iterate
- Future: social features (friends, challenges), writing practice, character stroke order
