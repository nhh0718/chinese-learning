# Code Review: Phase 2 - SRS Flashcards & Enhanced Review

**Date:** 2026-03-24
**Reviewer:** code-reviewer
**Scope:** 9 new files, 4 modified files (~1,100 LOC)

## Overall Assessment

Solid implementation. Clean component architecture with good separation of concerns. Backend endpoints properly secured behind `protect` middleware. A few issues worth addressing before merge.

## Critical Issues

None found. No security vulnerabilities, no data exposure, no secrets in code.

## High Priority

### H1. Fire-and-forget grade API call silently drops errors
**File:** `src/stores/flashcardStore.ts:111-117`
```ts
fetch(`${REVIEW_URL}/grade`, { ... }).catch(() => {
  // Will be queued by reviewStore's offline logic if needed
});
```
Comment claims offline queueing but no such mechanism exists in this code. If the grade request fails (network blip, 500), the user sees success locally but the grade is lost permanently. The FSRS state diverges from what the user experienced.

**Fix options:**
- Add retry logic (1-2 retries with backoff)
- Queue failed grades in localStorage and flush on next session start
- At minimum, surface a toast notification so user knows grade was not saved

### H2. `_options` parameter accepted but never used
**File:** `src/stores/flashcardStore.ts:54`
```ts
startSession: async (mode, _options) => {
```
The `topicId` and `level` options are declared in the interface (line 26) but never wired to the URL. This is dead code that signals incomplete functionality. Either implement filtering or remove the parameter to avoid confusion.

### H3. Backend `review.ts` exceeds 200-line limit (329 lines)
Per project rules, files should stay under 200 lines. This route file has 7 endpoints. Consider extracting into:
- `review-due-routes.ts` (due + grade)
- `review-bookmark-routes.ts` (bookmark + bookmarks)
- `review-analytics-routes.ts` (stats + analytics)

### H4. Aggregation `user_id` type mismatch risk
**File:** `backend/src/routes/review.ts:269, 278, 292`
MongoDB aggregation `$match` with `user_id: userId` where `userId` comes from `(req as any).user._id`. If the auth middleware returns an ObjectId, this works. If it returns a string, all aggregation queries silently return empty results while `find()` queries may still work due to Mongoose casting.

**Recommendation:** Explicitly cast: `user_id: new mongoose.Types.ObjectId(userId)`

## Medium Priority

### M1. Swipe only maps to Again (1) and Good (3), skipping Hard (2) and Easy (4)
**File:** `src/components/flashcard/FlashcardSwipeable.tsx:23-27`
This is a valid UX simplification (swipe for quick binary, buttons for nuanced grading). However, there's no visual indication to the user that Hard/Easy require using buttons. Consider adding a subtle hint below the card.

### M2. `FlashcardSessionPage` reads mode from URL without validation
**File:** `src/pages/FlashcardSessionPage.tsx:21`
```ts
const mode = (searchParams.get('mode') || 'review') as FlashcardMode;
```
Casting directly without validation. If someone navigates to `?mode=invalid`, it passes through unchecked. The store's `startSession` URL building handles it gracefully (falls through to default `/due`), but this is fragile.

**Fix:** Validate against known modes:
```ts
const raw = searchParams.get('mode');
const mode: FlashcardMode = ['learn','review','quick','cram'].includes(raw!) ? raw as FlashcardMode : 'review';
```

### M3. `useEffect` missing `fetchStats` in dependency array
**File:** `src/pages/FlashcardsPage.tsx:23-24`
```ts
useEffect(() => { if (token) fetchStats(); }, [token]);
```
React strict mode / linter will warn about `fetchStats` not in deps. Since it comes from Zustand (stable reference), this works in practice but violates exhaustive-deps rule.

### M4. Analytics daily reviews aggregation counts unique cards, not review events
**File:** `backend/src/routes/review.ts:275-289`
Groups by `$dateToString` of `last_review` and counts matching documents. Since `last_review` is overwritten each time a card is graded, this gives "cards last reviewed on date X" not "total reviews per day." If a user reviews the same card 5 times on one day, it counts as 1.

This may be intentional, but if the goal is "review activity per day," you need a separate ReviewLog collection or use the `updatedAt` timestamp differently.

### M5. No pagination on bookmarks endpoint
**File:** `backend/src/routes/review.ts:241-246`
Returns all bookmarked items without limit. Could become slow for power users with hundreds of bookmarks.

## Low Priority

### L1. Hardcoded emoji in session complete message
**File:** `src/pages/FlashcardSessionPage.tsx:90`
```tsx
<h2>Session Complete! 🎉</h2>
```
Project rules say avoid emojis unless user requests. Minor, but noted.

### L2. Inconsistent auth header construction
`flashcardStore.ts` uses `getAuthHeaders()` helper (includes Content-Type). `WordListPage.tsx` and `ReviewAnalyticsPage.tsx` inline headers without Content-Type for GET requests. Consistent but could benefit from a shared `authFetch` utility to reduce repetition.

## Positive Observations

- **Clean component decomposition**: FlashcardSwipeable, FlashcardContent, GradeButtons, SessionProgress all single-responsibility, well-typed
- **Good type reuse**: FSRSGrade and ReviewCard types shared between store and components
- **Proper auth gating**: `router.use(protect)` at top of review routes covers all endpoints
- **Smart query optimization**: `Promise.all` for parallel DB queries in stats/analytics endpoints
- **Compound unique index** on VocabularyProgress prevents duplicate progress records
- **Bilingual UI** (Vietnamese + English labels) consistent with app design language
- **GradeButtons** is properly reusable with disabled prop
- **AnimatePresence** for smooth card transitions

## Recommended Actions (Priority Order)

1. **[H1]** Add retry or queue for failed grade API calls
2. **[H3]** Split `review.ts` into 3 smaller route files
3. **[H4]** Cast userId to ObjectId in aggregation queries
4. **[H2]** Remove unused `_options` param or implement topic/level filtering
5. **[M2]** Validate mode from URL params
6. **[M4]** Clarify whether daily reviews counts cards or events; document or fix

## Metrics

- Type Coverage: Good -- all components and store fully typed with interfaces
- Test Coverage: Not assessed (no test files in scope)
- Linting Issues: 1 potential exhaustive-deps warning (M3)
- File Size Violations: 1 (review.ts at 329 lines)

## Unresolved Questions

1. Is the fire-and-forget pattern for grading intentional? Is there an offline queue elsewhere in reviewStore?
2. Should daily review analytics track individual review events or unique cards reviewed?
3. Are there plans to implement topic/level filtering for sessions (the `_options` param)?
