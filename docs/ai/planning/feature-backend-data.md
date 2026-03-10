---
phase: planning
title: Backend Data System Implementation Plan
description: Task breakdown and execution strategy for the backend
---

# Implementation Plan

## Task Breakdown
**Step-by-step execution tasks**

**Phase 1: Project Setup & Database (Estimated: 1 day)**
- [x] Initialize backend project (`backend` folder with Node.js + Express + TypeScript).
- [x] Set up MongoDB connection and Mongoose schemas (Topic, Lesson, Vocabulary).

**Phase 2: Data Ingestion Pipeline (Estimated: 2-3 days)**
- [x] Create data ingestion scripts folder.
- [x] **Task 2.1:** Download and parse CVDICT (`.u8` file). Write script to extract Traditional, Simplified, Pinyin, and Vietnamese meanings.
- [x] **Task 2.2:** Integrate Zhuyin conversion logic (map Pinyin to Zhuyin programmatically).
- [x] **Task 2.3:** Download and parse Hán Việt mapping datasets. Map to the base dictionary.
- [x] **Task 2.4:** Develop script to seed initial Topics and Lessons based on early TOCFL levels (Level 1/2) and link them to the imported vocabulary.
- [x] Run complete seed process and verify data integrity in the database.

**Phase 3: API Development (Estimated: 2 days)**
- [x] Implement `GET /topics` and `GET /topics/:id` endpoints.
- [x] Implement `GET /topics/:id/lessons` endpoint.
- [x] Implement `GET /lessons/:id` endpoint (must include related vocabulary and generate exercise data payload similarly to mock data).
- [x] Implement search endpoint `GET /search/vocabulary`.
- [x] Add basic error handling and validation middleware.

**Phase 4: Frontend Integration & Testing (Estimated: 1-2 days)**
- [x] Update frontend API service layer to fetch from the new backend instead of `mock/data.ts`.
- [x] Ensure Zustand stores map backend data to frontend interfaces correctly.
- [x] Test all core flows: topic browsing, lesson loading, review mode, and exercises.
- [x] Verify Zhuyin, Pinyin, and Hán Việt data display correctly in UI cards.

## Dependencies & Blockers
- **Dependencies:** Requires local MongoDB instance or MongoDB Atlas cluster for development.
- **Blockers:** Quality of CVDICT parsability. If standard CC-CEDICT parsers fail due to Vietnamese formatting anomalies, a custom regex parser will need robust testing.

## Implementation Order
1. Phase 1 (Setup) -> Phase 2 (Data Ingestion) -> Phase 3 (API) -> Phase 4 (Frontend Connect).
Data ingestion (Phase 2) is the highest risk and should be completed and validated before building API endpoints.

## Risks & Mitigations
- **Risk:** CC-CEDICT pinyin format uses numbers (e.g., `ni3 hao3`). Frontend needs tone marks (e.g., `nǐ hǎo`).
  - **Mitigation:** Write or utilize a utility function in the ingestion script to convert numbered pinyin to tone marks before saving to DB, and to convert to Zhuyin.
- **Risk:** Missing Hán Việt readings for complex or modern words.
  - **Mitigation:** Fallback gracefully in the UI if `han_viet` field is null. Focus Hán Việt matching strictly on single characters or common compounds first.

