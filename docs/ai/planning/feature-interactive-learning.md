---
phase: planning
title: Interactive Learning & User Progress Implementation Plan
description: Task breakdown for Exercises, Sentences, Auth, and Progress
---

# Implementation Plan

## Task Breakdown

**Phase 1: Authentication API (Backend) (Estimated: 1 day)**
- [x] Install `bcryptjs` and `jsonwebtoken` in backend.
- [x] Create `User` Mongoose schema.
- [x] Implement `POST /api/v1/auth/register` (hash password, save user).
- [x] Implement `POST /api/v1/auth/login` (verify password, return JWT).
- [x] Create JWT authentication middleware to secure routes.
- [x] Implement `GET /api/v1/users/me` (return current user profile).

**Phase 2: Auth Integration (Frontend) (Estimated: 1 day)**
- [x] Create `authStore.ts` using Zustand to manage JWT state (login, logout, token persistance in localStorage).
- [x] Create `LoginPage` and `RegisterPage` UI components.
- [x] Update `App.tsx` or `router` to redirect unauthenticated users asking to access protected routes (if any) or show login state in `Navbar`.

**Phase 3: Learning Content Data Models (Backend) (Estimated: 1 day)**
- [x] Create `Sentence` Mongoose schema.
- [x] Create `Exercise` Mongoose schema.
- [x] Update `GET /api/v1/lessons/:id` to also populate/fetch related `sentences` and `exercises`.
- [x] Write a script to seed the database with mock sentences and exercises for existing lessons (e.g., "Greetings", "Numbers").

**Phase 4: Progress Tracking (Backend & Frontend) (Estimated: 1-2 days)**
- [x] Create `UserProgress` Mongoose schema.
- [x] Implement `POST /api/v1/progress/:lessonId` to save/update user score and completion status.
- [x] Implement `GET /api/v1/progress` to retrieve all progress for current user.
- [x] Create `progressStore.ts` in frontend to manage this state.
- [x] Update `TopicCatalogPage` to show visual checkmarks on completed lessons/topics based on fetched progress data.
- [x] Update `ExercisePage` to submit the final score to the `/progress/:lessonId` API upon completion.

## Implementation Order
Phase 1 (Auth Backend) -> Phase 2 (Auth Frontend) -> Phase 3 (Learning Content) -> Phase 4 (Progress Tracking).

## Dependencies & Blockers
- **Dependencies:** The previous feature (`feature-backend-data.md`) must be fully implemented and merged.
- **Blockers:** None identified. However, robust JWT secret management requires updating the `.env` file securely.
