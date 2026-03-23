# Code Review: Phase 1 - PWA + FSRS Spaced Repetition

**Date:** 2026-03-24
**Scope:** 11 files (3 new backend, 1 new frontend store, 7 modified)
**Focus:** Security, FSRS correctness, error handling, performance, code quality

## Overall Assessment

Solid implementation. Clean separation of concerns, proper auth middleware, correct FSRS integration via ts-fsrs. A few issues need attention -- one critical auth bug, and several medium-priority items.

---

## Critical Issues

### 1. Auth middleware does not return after "no token" response
**File:** `backend/src/middleware/authMiddleware.ts:34-36`

```typescript
if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
}
```

This block runs AFTER the `if (req.headers.authorization...)` block. If auth header exists but `jwt.verify` throws, the catch sends a 401 AND then this block also sends a 401 -- double response, causing `ERR_HTTP_HEADERS_SENT` crash.

**Fix:** Add `return` before the response, or restructure as `else if`:
```typescript
if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
}
```

**Note:** This is pre-existing, not introduced by this PR, but all review routes depend on it.

---

## High Priority

### 2. POST /review/init loads ALL vocabulary into memory
**File:** `backend/src/routes/review.ts:164`

```typescript
const allVocab = await Vocabulary.find().select('_id');
```

If vocabulary collection grows large (10k+ items), this loads all IDs into memory and creates that many insert documents. Should use an aggregation pipeline with `$lookup` or batch processing.

**Mitigation (short-term):** Add `.lean()` and consider a limit/pagination. For now acceptable if vocab count stays under ~5k.

### 3. Offline queue only triggers on `!navigator.onLine`
**File:** `src/stores/reviewStore.ts:90-91`

The grade catch block only queues offline if `!navigator.onLine`. But network errors can occur while `navigator.onLine` is `true` (e.g., server down, timeout). The grade is lost silently in that case.

**Fix:** Queue on any network/fetch error, not just offline:
```typescript
catch (err: any) {
    queueOfflineGrade(vocabularyId, grade);
    get().nextCard();
    set({ isGrading: false, error: navigator.onLine ? err.message : 'Saved offline' });
}
```

### 4. No `online` event listener to auto-sync offline queue
**File:** `src/stores/reviewStore.ts`

`syncOfflineGrades()` is only called on ReviewPage mount. If user grades cards offline, closes the page, then comes back online, the queue won't sync until they revisit ReviewPage.

**Fix:** Register `window.addEventListener('online', syncOfflineGrades)` in App.tsx or a top-level effect.

---

## Medium Priority

### 5. `handleGrade` uses `setTimeout` without cleanup
**File:** `src/pages/ReviewPage.tsx:44-46`

If component unmounts during the 150ms timeout, `gradeCard` still fires on unmounted store (harmless since Zustand is external, but the pattern is fragile).

**Fix:** Use `useRef` for timeout ID and clear on unmount, or remove the delay entirely -- the animation is handled by AnimatePresence anyway.

### 6. `useEffect` dependency array missing functions
**File:** `src/pages/ReviewPage.tsx:24-32`

```typescript
useEffect(() => {
    if (!token) return;
    syncOfflineGrades();
    initCards().then(() => {
      fetchDueCards();
      fetchStats();
    });
    return () => reset();
}, [token]);
```

`initCards`, `fetchDueCards`, `fetchStats`, `reset` are not in deps. Zustand store functions are stable references so this is safe in practice, but adding an eslint-disable comment would document the intent.

### 7. Stats query fires 7 parallel `countDocuments` calls
**File:** `backend/src/routes/review.ts:122-133`

Seven separate count queries for the same collection. Consider using a single aggregation pipeline with `$facet` to reduce round-trips.

**Fix (optional optimization):**
```typescript
const stats = await VocabularyProgress.aggregate([
  { $match: { user_id: new mongoose.Types.ObjectId(userId) } },
  { $facet: {
    byState: [{ $group: { _id: '$state', count: { $sum: 1 } } }],
    due: [{ $match: { due: { $lte: now } } }, { $count: 'count' }],
    today: [{ $match: { last_review: { $gte: todayStart } } }, { $count: 'count' }]
  }}
]);
```

### 8. PWA runtime caching regex may over-match
**File:** `vite.config.ts:15,20`

`/\/api\/v1\/review/` matches any URL containing `/api/v1/review` -- including grade POSTs. Caching POST responses with `NetworkFirst` is usually harmless (Workbox ignores non-GET by default), but the intent should be documented.

### 9. Missing `state` index for stats queries
**File:** `backend/src/models/VocabularyProgress.ts`

Stats endpoint queries by `{ user_id, state }` but no compound index exists for this. The `{ user_id, due }` index won't help state-based counts.

**Fix:** Add index:
```typescript
VocabularyProgressSchema.index({ user_id: 1, state: 1 });
```

---

## Low Priority

### 10. `(req as any).user._id` repeated across all routes
Consider extending Express Request type or creating a helper:
```typescript
function getUserId(req: Request): string {
  return (req as any).user._id;
}
```

### 11. `cardToProgressFields` uses array index for state name
**File:** `backend/src/services/fsrs-service.ts:71-79`

If ts-fsrs ever changes enum values, the array lookup breaks silently. Consider using `Rating` enum directly for the reverse map.

### 12. ReviewPage.css hardcoded colors
Grade button colors (`#ef4444`, `#f59e0b`, `#3b82f6`) don't use CSS variables. If the app has a dark/light theme system, these won't adapt.

---

## Positive Observations

- Auth middleware applied at router level (`router.use(protect)`) -- clean pattern
- Compound unique index prevents duplicate progress records
- `insertMany` with `{ ordered: false }` + catch for race conditions in `/init` -- good
- Offline queue with sequential processing maintains grade order
- FSRS service cleanly separated from routes
- CSS uses `color-mix()` for transparent variants -- modern approach
- Type definitions mirror backend shape accurately
- Progress bar, loading, error, empty, done states all handled

---

## Recommended Actions (Priority Order)

1. **Fix auth middleware double-response bug** (Critical, pre-existing)
2. **Queue grades on any fetch error, not just offline** (High)
3. **Add `online` event listener for sync** (High)
4. **Add `{ user_id, state }` index** (Medium)
5. **Consider aggregation for stats endpoint** (Medium, can defer)
6. **Add vocab count guard or pagination to /init** (Medium, can defer)

---

## Metrics

| Metric | Value |
|--------|-------|
| Files reviewed | 11 |
| Critical issues | 1 (pre-existing) |
| High priority | 3 |
| Medium priority | 5 |
| Low priority | 3 |
| Type safety | Good -- frontend types match backend response shape |
| Test coverage | Not assessed (no test files in scope) |
| Linting | Compiles cleanly per user report |

---

## Unresolved Questions

1. Is there a plan to add rate limiting on `/review/grade`? A malicious user could spam grades.
2. Should `/init` be idempotent and safe to call repeatedly, or should it be gated behind a "first time" check?
3. Are PWA icons (`icon-192.png`, `icon-512.png`) actual images or placeholders? Not verified.
4. Will there be a service worker registration prompt or is `autoUpdate` the final strategy?
