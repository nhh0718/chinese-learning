---
phase: implementation
title: Implementation Guide — Chinese Learning Web
description: Technical implementation notes, patterns, and code guidelines for the Chinese learning web app
---

# Implementation Guide — Chinese Learning Web

## Development Setup
**How do we get started?**

### Prerequisites
- Node.js 18+ and npm/pnpm
- Git
- Code editor (VS Code recommended)
- Backend API running (or mock data files)

### Environment Setup
```bash
# Initialize project with React + TypeScript
npx -y create-vite@latest ./ --template react-ts

# Install dependencies
npm install
npm install react-router-dom zustand lucide-react framer-motion

# Dev server
npm run dev
```

### Configuration
- `.env` file for API base URL:
  ```
  VITE_API_BASE_URL=http://localhost:8080/api
  ```

## Code Structure
**How is the code organized?**

```
src/
├── assets/                 # Static assets, fonts, images
│   ├── fonts/
│   └── images/
├── components/             # Reusable UI components
│   ├── common/             # Button, ProgressBar, TTSButton, etc.
│   ├── lesson/             # VocabularyCard, SentenceDisplay, etc.
│   ├── exercise/           # ExerciseRenderer, MultipleChoice, etc.
│   ├── auth/               # LoginForm, RegisterForm, AuthGuard
│   └── layout/             # Navbar, Footer, ThemeToggle
├── hooks/                  # Custom React hooks
│   ├── useApi.ts
│   ├── useTTS.ts
│   ├── useAuth.ts
│   └── useProgress.ts
├── pages/                  # Page-level components
│   ├── HomePage.tsx
│   ├── TopicCatalogPage.tsx
│   ├── LessonDetailPage.tsx
│   ├── ExercisePage.tsx
│   ├── ReviewPage.tsx
│   ├── ProgressPage.tsx
│   └── LoginPage.tsx
├── api/                    # API client module
│   ├── client.ts           # Base HTTP client config
│   ├── topics.ts
│   ├── lessons.ts
│   ├── progress.ts
│   ├── auth.ts
│   └── review.ts
├── stores/                 # State management (Zustand)
│   ├── topicStore.ts
│   ├── lessonStore.ts
│   ├── authStore.ts
│   └── progressStore.ts
├── router/                 # Route definitions
│   └── index.ts
├── styles/                 # Global CSS
│   ├── variables.css       # Design tokens (colors, spacing, fonts)
│   ├── base.css            # CSS reset and base styles
│   ├── animations.css      # Keyframe animations
│   └── utilities.css       # Utility classes
├── types/                  # TypeScript type definitions
│   └── index.ts
├── mock/                   # Mock data for development
│   ├── topics.json
│   ├── lessons.json
│   └── exercises.json
├── App.tsx
└── main.tsx
```

### Naming Conventions
- Components: PascalCase (e.g., `VocabularyCard.tsx`)
- Files: camelCase for utilities, PascalCase for components
- CSS classes: BEM-inspired (e.g., `.vocab-card`, `.vocab-card__front`, `.vocab-card--flipped`)
- API functions: camelCase verbs (e.g., `getTopics()`, `updateProgress()`)

## Implementation Notes
**Key technical details to remember:**

### Core Features

#### Topic & Lesson System
- Topics are fetched once and cached in store; lessons are fetched on-demand per topic.
- Use route params for topic/lesson IDs: `/topics/:topicId/lessons/:lessonId`.
- Lesson detail page renders vocab → sentences → cultural note → exercise CTA in a vertical scroll layout.

#### Exercise Engine
- `ExerciseRenderer` receives an `Exercise` object and renders the correct sub-component based on `exercise.type`.
- Each exercise type is a standalone component with its own validation logic.
- On completion, results are collected and shown in a summary view with score and feedback.

#### Flashcard Review
- Flip animation via CSS `transform: rotateY(180deg)` with `backface-visibility: hidden`, enhanced with Framer Motion.
- Queue management: shuffle cards, allow "mark as known" / "study again".
- Optionally support spaced repetition algorithm (SM-2) on the backend side.

### Patterns & Best Practices
- **API-first**: Never hardcode content. All text, vocab, exercises come from API/mock.
- **Graceful loading**: Every data-fetching component shows a skeleton loader during fetch.
- **Error boundaries**: Wrap pages in error boundary components to catch and display API failures gracefully.
- **CSS custom properties**: All colors, spacing, and font sizes use `var(--token-name)` for easy theming.

## Integration Points
**How do pieces connect?**

- **API Client → Backend**: All HTTP requests go through `api/client.ts` which configures base URL, headers, and error interceptors.
- **Audio Playback**: `TTSButton` uses the **Web Speech API** (`speechSynthesis`) with `zh-TW` language locale for Taiwanese Mandarin pronunciation.
- **Authentication**: Login/register forms POST to backend auth endpoints; JWT token stored in memory (Zustand) + `httpOnly` cookie handled by backend.

## Error Handling
**How do we handle failures?**

- API errors → show inline error message with retry button.
- Network offline → show banner "You're offline" with cached content if available.
- 404 lesson/topic → redirect to catalog with toast notification.
- Exercise validation errors → highlight incorrect answer, show correct answer after attempt.

## Performance Considerations
**How do we keep it fast?**

- **Code splitting**: Lazy-load page components via dynamic imports.
- **Image optimization**: Use WebP format, lazy loading via `loading="lazy"`.
- **Font optimization**: Subset Chinese fonts to lesson content range; use `font-display: swap`.
- **Virtual scrolling**: For long vocabulary lists (> 50 items).
- **API caching**: Cache topic list and recently viewed lessons in store.

## Security Notes
**What security measures are in place?**

- All API calls over HTTPS.
- No sensitive data stored in localStorage (progress data only).
- Input sanitization for any user-submitted content (if future features require it).
- CSP headers recommended in deployment.
