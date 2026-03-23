# Code Standards & Guidelines

## Overview

This document defines the coding standards, architectural patterns, and best practices for the Learn Chinese project. All code contributions must adhere to these standards to maintain consistency, readability, and maintainability.

---

## File Organization & Naming

### Backend Structure (`backend/src/`)

```
backend/src/
├── config/                 # Configuration files
│   └── db.ts              # MongoDB connection
├── middleware/             # Express middleware
│   └── authMiddleware.ts
├── models/                # Mongoose schemas (PascalCase)
│   ├── User.ts
│   ├── Vocabulary.ts
│   └── VocabularyProgress.ts
├── services/              # Business logic (kebab-case)
│   └── fsrs-service.ts
├── routes/                # API endpoints (kebab-case)
│   ├── auth.ts
│   ├── review.ts
│   └── ...
├── telegram/              # Telegram bot integration
│   └── index.ts
└── index.ts              # Server entry point
```

### Frontend Structure (`src/`)

```
src/
├── components/            # Reusable UI components (PascalCase)
│   ├── Button.tsx
│   ├── Card.tsx
│   └── ...
├── config/                # Configuration (kebab-case)
│   └── api.ts
├── pages/                 # Page components (PascalCase)
│   ├── ReviewPage.tsx
│   ├── LessonPage.tsx
│   └── ...
├── stores/                # Zustand stores (kebab-case)
│   └── review-store.ts
├── styles/                # CSS modules (kebab-case)
│   └── review.module.css
├── types/                 # TypeScript definitions
│   └── index.ts
└── main.tsx              # Entry point
```

### File Naming Conventions

| Category | Convention | Example |
|----------|-----------|---------|
| Models (Mongoose) | PascalCase | `VocabularyProgress.ts` |
| Services | kebab-case | `fsrs-service.ts` |
| Routes | kebab-case | `review.ts` |
| Components | PascalCase | `ReviewCard.tsx` |
| Stores (Zustand) | kebab-case | `review-store.ts` |
| Styles | kebab-case | `review.module.css` |
| Utilities | kebab-case | `date-utils.ts` |
| Types/Interfaces | TypeScript convention | `ReviewCard`, `FSRSGrade` |

**Rule:** Use descriptive names. Prefer longer names that clearly indicate purpose over short abbreviations.

---

## TypeScript Conventions

### Interfaces & Types

#### Naming
- **Interfaces:** PascalCase, no `I` prefix
  ```typescript
  interface ReviewCard {
    progressId: string;
    vocabularyId: string;
  }
  ```
- **Types:** PascalCase
  ```typescript
  type FSRSGrade = 1 | 2 | 3 | 4;
  type FSRSState = 'New' | 'Learning' | 'Review' | 'Relearning';
  ```
- **Enums:** PascalCase (avoid, use union types instead)
  ```typescript
  // Preferred
  type ReviewState = 'new' | 'in_progress' | 'complete';

  // Avoid
  enum ReviewState { New, InProgress, Complete }
  ```

#### Organization in `src/types/index.ts`
Group types by feature with comment separators:

```typescript
// ===== Core Data Types =====
export interface User { ... }
export interface Vocabulary { ... }

// ===== FSRS Review Types =====
export type FSRSGrade = 1 | 2 | 3 | 4;
export interface ReviewCard { ... }

// ===== Telegram Types =====
export interface DailyQuiz { ... }
```

### Generic Types
- Always define constraints
  ```typescript
  // Good
  function getItem<T extends { id: string }>(id: string, items: T[]): T | undefined

  // Avoid
  function getItem<T>(id: string, items: T[]): T | undefined
  ```

---

## Code Quality Standards

### Backend (Node.js/Express)

#### Error Handling
All async functions must have try-catch blocks:

```typescript
router.post('/grade', async (req: Request, res: Response) => {
  try {
    // Logic here
    res.json({ success: true });
  } catch (error: any) {
    console.error('[Review] Error grading card:', error.message);
    res.status(500).json({ message: 'Failed to grade card' });
  }
});
```

#### Logging
Use consistent log format: `[Module] Message`

```typescript
console.log('[Review] Initialized 50 new cards');
console.error('[Review] Error fetching due cards:', error.message);
```

#### Database Queries
- Use `lean()` for read-only queries (performance)
- Always add `.select()` to limit fields for read-only operations
- Use compound indexes for frequent query patterns

```typescript
// Good: optimized query
const ids = await Vocabulary.find()
  .select('_id')
  .lean()
  .limit(500);

// Avoid: unnecessary full document fetch
const docs = await Vocabulary.find().limit(500);
```

#### Mongoose Models
- Use interfaces extending `Document`
- Export both interface and model
- Add helpful indexes with comments

```typescript
export interface IVocabularyProgress extends Document {
  user_id: mongoose.Types.ObjectId;
  vocabulary_id: mongoose.Types.ObjectId;
  // ... fields
}

// Compound unique index: one progress record per user per word
VocabularyProgressSchema.index({ user_id: 1, vocabulary_id: 1 }, { unique: true });
// Index for efficient due card queries
VocabularyProgressSchema.index({ user_id: 1, due: 1 });
```

#### Route Organization
- Group related endpoints in one file
- All protected routes should use middleware
- Return consistent JSON response format

```typescript
router.use(protect);  // All routes in this file require auth

router.get('/due', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    // ...
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: 'Error message' });
  }
});
```

### Frontend (React/TypeScript)

#### Component Structure
- Functional components only (no class components)
- Keep components under 200 lines (split into smaller components)
- Props interface at top of file

```typescript
interface ReviewCardProps {
  card: ReviewCard;
  onGrade: (grade: FSRSGrade) => void;
  isLoading?: boolean;
}

export function ReviewCard({ card, onGrade, isLoading = false }: ReviewCardProps) {
  // Component logic
}
```

#### State Management (Zustand)
- Keep stores focused on single domain
- Use `get()` to access state within actions
- Document store actions with comments

```typescript
export const useReviewStore = create<ReviewState>((set, get) => ({
  dueCards: [],
  currentIndex: 0,

  gradeCard: async (vocabularyId: string, grade: FSRSGrade) => {
    set({ isGrading: true });
    try {
      const response = await api.post('/grade', { vocabularyId, grade });
      get().nextCard();
      set({ isGrading: false });
    } catch (err) {
      // Offline fallback
      get().nextCard();
      set({ isGrading: false });
    }
  }
}));
```

#### Async Data Fetching
- Always handle loading and error states
- Use abort controller for cleanup
- Provide meaningful error messages to users

```typescript
useEffect(() => {
  const controller = new AbortController();

  async function loadCards() {
    setIsLoading(true);
    try {
      const response = await fetch('/api/review/due', {
        signal: controller.signal,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to load cards');
      const cards = await response.json();
      setCards(cards);
    } catch (error) {
      if (error.name !== 'AbortError') {
        setError('Could not load review cards. Check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  loadCards();
  return () => controller.abort();
}, [token]);
```

#### Styling
- Use CSS Modules for component styles
- Namespace module styles: `review.module.css` → `import styles from './review.module.css'`
- No inline styles (except for dynamic values)

```typescript
// review.module.css
.cardContainer {
  padding: 1rem;
  border-radius: 8px;
}

// ReviewCard.tsx
import styles from './review.module.css';

export function ReviewCard() {
  return <div className={styles.cardContainer}>...</div>;
}
```

---

## API Design Standards

### Request/Response Format
All API responses follow this format:

```typescript
// Success response (200, 201)
{ data: T }

// Error response (4xx, 5xx)
{ message: string, code?: string }

// List response
{ data: T[], total: number, page: number }
```

### Endpoint Naming
- **Resources:** Plural nouns (`/api/v1/reviews`, `/api/v1/vocabulary`)
- **Actions:** POST with action in body or use sub-resource
  ```
  POST /api/v1/reviews/grade  ✓
  POST /api/v1/reviews/init   ✓
  ```

### Query Parameters
- Filtering: `?state=Review&user_id=123`
- Pagination: `?page=1&limit=50`
- Sorting: `?sort=-due` (ascending: `+due`)

### HTTP Methods
- **GET:** Retrieve data (read-only, idempotent)
- **POST:** Create resource or perform action
- **PATCH:** Update partial fields
- **DELETE:** Remove resource
- No PUT (use PATCH instead)

---

## Database Design

### MongoDB Naming Conventions
- **Collections:** snake_case, plural
  ```javascript
  db.vocabulary_progress
  db.user_progress
  ```
- **Fields:** snake_case (except TypeScript interfaces)
  ```typescript
  { user_id, vocabulary_id, last_review, scheduled_days }
  ```

### Index Design
- Add indexes for frequently queried fields
- Use compound indexes for AND conditions
- Document index purpose with comments

```typescript
// For: GET /due queries (find cards due for user)
schema.index({ user_id: 1, due: 1 });

// For: Uniqueness constraint (one progress per user/vocab pair)
schema.index({ user_id: 1, vocabulary_id: 1 }, { unique: true });
```

### Timestamps
- Always use MongoDB automatic `createdAt` and `updatedAt`
  ```typescript
  }, { timestamps: true });
  ```

---

## Performance Best Practices

### Backend
1. **Queries:** Always use indexes for frequently accessed data
2. **Projections:** Use `.select()` to limit returned fields
3. **Lean queries:** Use `.lean()` for read-only operations (no Mongoose overhead)
4. **Batching:** Use `insertMany()` with `{ ordered: false }` for bulk inserts
5. **Aggregation:** Use MongoDB aggregation pipeline for complex computations

### Frontend
1. **Code Splitting:** Use dynamic imports for heavy components
   ```typescript
   const ReviewPage = lazy(() => import('./pages/ReviewPage'));
   ```
2. **Memoization:** Use `useMemo` and `useCallback` for expensive computations
3. **Virtual Scrolling:** For large lists, use virtualization
4. **Caching:** Leverage HTTP cache headers and service worker

### Database
1. **Connection Pooling:** Configure appropriate pool size (default: 10)
2. **Replica Sets:** For high availability
3. **Sharding:** When collection exceeds 100GB

---

## Testing Standards

### Unit Tests
- Minimum 70% code coverage for critical paths
- Test both success and error cases
- Use descriptive test names

```typescript
describe('fsrs-service', () => {
  it('should create new card with default FSRS state', () => {
    const card = createNewCard();
    expect(card.stability).toBe(0);
    expect(card.reps).toBe(0);
  });
});
```

### Integration Tests
- Test API endpoints with real database (test instance)
- Verify error responses
- Test authentication and authorization

```typescript
describe('POST /api/v1/review/grade', () => {
  it('should update card state and return next due date', async () => {
    const response = await request(app)
      .post('/api/v1/review/grade')
      .set('Authorization', `Bearer ${token}`)
      .send({ vocabularyId: '123', grade: 3 });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('nextDue');
  });
});
```

---

## Security Standards

### Authentication & Authorization
- **JWT Tokens:** Signed with RS256 (asymmetric), no expiration for now
- **Protected Routes:** All sensitive endpoints require `protect` middleware
- **User Isolation:** Always filter by `user_id` in queries

```typescript
const userId = (req as any).user._id;  // From JWT payload
const data = await Model.find({ user_id: userId });
```

### Input Validation
- Validate request bodies before processing
- Use TypeScript for compile-time type safety
- Validate enum values

```typescript
if (!vocabularyId || ![1, 2, 3, 4].includes(grade)) {
  return res.status(400).json({ message: 'Invalid input' });
}
```

### Sensitive Data
- Never log sensitive data (passwords, tokens)
- Use environment variables for secrets (.env, never commit)
- Sanitize error messages in production

```typescript
// Bad
console.log('Auth error:', error, password, token);

// Good
console.error('[Auth] Authentication failed for user:', userId);
```

---

## Documentation Standards

### Code Comments
- Comment **why**, not **what** (code already shows what)
- Document complex algorithms and business logic
- Add JSDoc for public functions

```typescript
/**
 * Schedule the next review based on the current card state and grade.
 * Uses the SM2 algorithm variant from ts-fsrs to compute new due date.
 * @param card - Current FSRS card state
 * @param grade - User's self-assessed grade (1-4, where 4 = easy)
 * @returns Updated card with new due date and FSRS parameters
 */
export function getNextReview(card: Card, grade: Grade): Card {
  // Implementation uses the ts-fsrs scheduler
  return scheduler.repeat(card, new Date())[grade].card;
}
```

### README Files
- Each major module should have a README explaining purpose and usage
- Include setup instructions
- Link to related documentation

---

## Git & Commit Standards

### Commit Messages
Use conventional commits:
```
feat: add offline grade queueing for review API
fix: prevent duplicate VocabularyProgress records
docs: update system architecture for Phase 1
refactor: extract FSRS logic into separate service
test: add integration tests for review endpoints
chore: update dependencies
```

Format:
```
<type>(<scope>): <subject>

<body (optional)>

<footer (optional)>
```

### Branching Strategy
- **main:** Production-ready code
- **develop:** Integration branch (staging)
- **feature/xxx:** Feature branches off develop
- **fix/xxx:** Bug fix branches off develop

### Pull Request Standards
- Link related issues
- Include test coverage changes
- Provide before/after for UI changes
- Request review from at least 1 maintainer

---

## Build & Deployment

### Frontend Build
```bash
npm run build  # Produces optimized bundle in dist/
```

### Backend Build
```bash
npm run build  # TypeScript compilation
```

### Environment Variables
All sensitive config goes in `.env` (never commit):
```
VITE_API_URL=http://localhost:5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
TELEGRAM_BOT_TOKEN=...
```

### Linting & Formatting
```bash
npm run lint    # Check for errors
npm run format  # Auto-fix formatting
```

---

## Common Pitfalls & How to Avoid

| Pitfall | ❌ Bad | ✅ Good |
|---------|--------|---------|
| Double response | `res.json(); res.send();` | Single response in all paths |
| Unhandled promises | `fetch(...).then(...)` | `await` with try-catch |
| Stale closure | `useEffect` without deps | Proper dependency array |
| N+1 queries | Loop with individual queries | `.populate()` or aggregation |
| Over-fetching | `find()` without `.select()` | `.select('_id field1 field2')` |
| Blocking I/O | Synchronous file operations | `fs.promises.readFile()` |
| Memory leaks | Uncanceled fetch in useEffect | AbortController cleanup |
| Race conditions | No check for existing record | Unique constraint + error handling |

---

## Review Checklist

Before submitting code for review, verify:

- [ ] Code follows naming conventions and file organization
- [ ] TypeScript types are properly defined
- [ ] Error handling with try-catch (backend) or try-catch + loading states (frontend)
- [ ] Database queries are optimized (indexes, projections, lean)
- [ ] No sensitive data in logs or git history
- [ ] Tests pass and coverage is adequate
- [ ] API responses follow standard format
- [ ] No console.log in production code
- [ ] Comments explain *why* not *what*
- [ ] Git commit message follows conventional format

---

Last Updated: 2024-03-24
