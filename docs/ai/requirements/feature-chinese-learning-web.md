---
phase: requirements
title: Requirements & Problem Understanding — Chinese Learning Web
description: A comprehensive, visually stunning, and interactive web application for learning Traditional Chinese (Taiwan-focused)
---

# Requirements & Problem Understanding — Chinese Learning Web

## Problem Statement
**What problem are we solving?**

- Learning Traditional Chinese (繁體中文) — especially Taiwanese Mandarin — is challenging due to the lack of engaging, modern, and well-designed web-based learning platforms.
- Most existing tools prioritize Simplified Chinese, leaving learners interested in Taiwan's writing system underserved.
- Current solutions often have outdated or dull interfaces, making learning feel like a chore rather than an enjoyable experience.
- Content is often rigid and not controlled by the administrator, making it hard to customize lessons for specific audiences.

**Who is affected?**
- Vietnamese speakers (and other non-Chinese speakers) who want to learn Traditional Chinese with a focus on Taiwanese Mandarin.
- Self-learners who prefer interactive, self-paced web-based learning over traditional classes.

**Current situation:**
- Learners rely on textbooks, generic apps (mostly Simplified Chinese), or scattered online resources.
- No single platform offers a beautiful, cohesive, topic-based learning experience for Traditional Chinese with full backend content management.

## Goals & Objectives
**What do we want to achieve?**

### Primary Goals
- Build a **visually stunning, modern web application** for learning Traditional Chinese (繁體中文, Taiwan-focused).
- Deliver **topic-based lessons** that are easy to understand and follow a clear progression.
- Create **interactive and engaging learning experiences** (quizzes, flashcards, character writing, audio, etc.).
- Ensure **all content is fully managed by the backend** — the frontend is a pure consumer of API data.

### Secondary Goals
- Support responsive design (mobile-first, works beautifully on phone, tablet, and desktop).
- Implement gamification elements (progress tracking, streaks, achievements).
- Support audio pronunciations via browser TTS (Text-to-Speech) for vocabulary and sentences.
- Dark mode / light mode toggle.
- User authentication UI (login / register).

### Non-Goals (explicitly out of scope)
- Building the backend API (the user controls this separately).
- Simplified Chinese support (focus is 100% on Traditional Chinese / Taiwan).
- Character stroke-order animation (deferred to v2).
- Native mobile app development (web-only for now).

## User Stories & Use Cases
**How will users interact with the solution?**

1. **As a learner**, I want to browse lessons organized by topic (e.g., Greetings, Numbers, Food, Travel) so that I can choose what to study.
2. **As a learner**, I want each lesson to show new vocabulary with pinyin (注音/拼音), stroke animations, example sentences, and audio so that I can understand pronunciation and usage.
3. **As a learner**, I want interactive exercises (multiple choice, fill-in-the-blank, matching, character writing) so that I can practice what I've learned.
4. **As a learner**, I want to track my progress across topics and see which lessons I've completed or mastered.
5. **As a learner**, I want the interface to be beautiful and feel premium, with smooth animations and transitions, so that learning feels enjoyable and not like a chore.
8. **As a learner**, I want to see both 注音 (Zhuyin/Bopomofo) and 拼音 (Pinyin) for every character/word so I can learn pronunciation both ways.
9. **As a learner**, I want to hear pronunciation via TTS when I click an audio button.
10. **As a learner**, I want to log in to save my progress and have a personalized experience.
6. **As a learner**, I want the app to work flawlessly on my phone so I can study anywhere.
7. **As a content admin**, I want all lesson content (topics, vocabulary, sentences, exercises) to be served from my backend API so I can update content without redeploying the frontend.

### Key Workflows
- **Browse & Select Topic** → View topic list → Select a topic → See lessons within that topic.
- **Study a Lesson** → Read vocabulary cards → Listen to audio → Practice writing → Complete exercises → See results.
- **Review & Practice** → Review previously studied vocab via flashcards → Spaced repetition support.
- **Track Progress** → View dashboard with completion stats, streaks, and achievements.

### Edge Cases
- Lesson with no audio files available → gracefully hide audio controls.
- Empty topics (no lessons yet) → show "Coming soon" placeholder.
- Slow/offline network → show cached content or friendly error states.
- Very long vocabulary lists → pagination or virtual scrolling.

## Success Criteria
**How will we know when we're done?**

- [ ] Homepage with topic grid / lesson catalog is live and visually polished.
- [ ] At least the "topic browsing → lesson detail → exercises" flow works end-to-end with mock or real API data.
- [ ] Exercises (multiple choice, matching, fill-in-blank) are interactive and give immediate feedback.
- [ ] Responsive design works across phone, tablet, and desktop viewports.
- [ ] All content is fetched from backend API endpoints — zero hardcoded lesson data.
- [ ] Lighthouse performance score ≥ 85 on mobile.
- [ ] User feedback: "this looks premium and is fun to use."

## Constraints & Assumptions
**What limitations do we need to work within?**

### Technical Constraints
- Frontend only — backend API is managed separately by the user.
- **SPA built with Vite + React** (confirmed).
- All lesson content comes from REST API (JSON format). **No API available yet — use mock data for development.**
- **Audio via browser TTS** (Web Speech API) — no pre-recorded audio files.
- **Self-hosted** deployment.

### Business Constraints
- Solo developer project — keep scope manageable for one person.
- Open-source friendly — avoid paid-only dependencies.

### Assumptions
- The backend API will follow a standard RESTful pattern and return JSON.
- Audio is handled entirely client-side via TTS until backend audio endpoints are available.
- Mock data will be used throughout development; API integration happens when backend is ready.

## Confirmed Decisions

| Decision | Choice |
|----------|--------|
| Framework | **Vite + React** |
| API status | **Not available yet — use mock data** |
| Pronunciation display | **Both Zhuyin (注音) and Pinyin (拼音)** |
| Character stroke animation | **Deferred to v2** |
| Audio | **Browser TTS (Web Speech API)** |
| Authentication | **Needed — build Login/Register UI** |
| Hosting | **Self-hosted** |

## Questions & Open Items
**What do we still need to clarify?**

1. **API contract** — What are the backend API endpoints and data shapes? (We can design mock data first and swap in real APIs later.)
