---
title: "Comprehensive Upgrade - Learning Chinese Website"
description: "Full upgrade: PWA, FSRS spaced repetition, exam prep suite, gamification for HSK/TOCFL students"
status: pending
priority: P1
effort: 80h
branch: master
tags: [feature, frontend, backend, pwa, gamification]
created: 2026-03-23
---

# Comprehensive Upgrade - Learning Chinese Website

## Overview

Transform current learning app into a full HSK/TOCFL exam prep platform with PWA support, FSRS spaced repetition, mock tests, and gamification.

**Target:** Vietnamese students preparing for HSK/TOCFL exams
**Brainstorm Report:** [brainstorm-260323-2350-comprehensive-upgrade.md](../reports/brainstorm-260323-2350-comprehensive-upgrade.md)

## Phases

| # | Phase | Status | Effort | Link |
|---|-------|--------|--------|------|
| 1 | Foundation & PWA | Complete | 16h | [phase-01](./phase-01-foundation-and-pwa.md) |
| 2 | SRS Flashcards & Enhanced Review | Complete | 20h | [phase-02](./phase-02-srs-flashcards.md) |
| 3 | Exam Prep Suite | Pending | 24h | [phase-03](./phase-03-exam-prep-suite.md) |
| 4 | Gamification & Polish | Pending | 20h | [phase-04](./phase-04-gamification-and-polish.md) |

## Dependencies

- Phase 1 must complete before Phase 2 (FSRS schema needed for flashcards)
- Phase 2 must complete before Phase 3 (review system feeds exam prep)
- Phase 4 can partially overlap with Phase 3 (XP system independent of exam engine)

## Key Technical Decisions

- **Mobile:** PWA (not React Native) - reuse 100% web code
- **SRS Algorithm:** FSRS via `ts-fsrs` package
- **Offline:** IndexedDB via `idb` package + service worker caching
- **Charts:** `recharts` (React-native, lightweight)
- **No AI features** - keep it simple

## New Dependencies

**Frontend:** `vite-plugin-pwa`, `ts-fsrs`, `idb`, `recharts`
**Backend:** none (use existing stack)

## Architecture Changes

- New model: `VocabularyProgress` (per-user per-word FSRS state)
- New model: `MockTest`, `MockTestResult`, `Achievement`, `UserAchievement`
- New routes: `/review`, `/mock-tests`, `/achievements`, `/leaderboard`
- PWA: service worker + manifest.json + offline vocabulary cache
