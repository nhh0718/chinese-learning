---
phase: requirements
title: Backend Data System Requirements
description: Define requirements for the Chinese-Vietnamese language data backend
---

# Requirements & Problem Understanding

## Problem Statement
**What problem are we solving?**
- The current Chinese Learning web app relies on hardcoded mock data for topics, lessons, and vocabulary.
- We need a robust backend to serve authentic, accurate Chinese language data (Traditional characters, Pinyin, Zhuyin, and Vietnamese meanings) to the frontend.
- Finding high-quality, open-source Chinese-Vietnamese dictionary data and HSK/TOCFL word lists is challenging but essential for a localized learning experience.

**Who is affected by this problem?**
- Vietnamese learners of Traditional Chinese (Taiwan focus) who need accurate, contextual, and structured learning paths.

## Goals & Objectives
**What do we want to achieve?**
- **Primary goals:**
  - Build a backend API serving vocabulary, lessons, and topics.
  - Integrate a comprehensive Chinese-Vietnamese dictionary database (focusing on Traditional Chinese, Pinyin, Zhuyin, and Vietnamese definitions).
  - Support structured learning paths based on official TOCFL (Taiwan) vocabulary lists.
- **Non-goals:**
  - We are not building a fully comprehensive general-purpose dictionary app (focus is on structured lessons).
  - We are not handling user-generated content for dictionary definitions in this phase.

## User Stories & Use Cases
**How will users interact with the solution?**
- As a learner, I want to see accurate Vietnamese translations and Hán Việt readings for each vocabulary word.
- As a learner, I want to see both Pinyin and Zhuyin (Bopomofo) phonetics for words to practice pronunciation.
- As an admin (future), I want to easily import new TOCFL word lists into the database to create new lessons.

## Success Criteria
**How will we know when we're done?**
- A backend service is running and exposes RESTful endpoints for Topics, Lessons, and Vocabulary.
- The database is seeded with data derived from CVDICT (Chinese-Vietnamese dictionary) and TOCFL word lists.
- The frontend successfully fetches and displays data from the backend API instead of mock data.
- API response times for typical queries (e.g., loading a lesson) are under 200ms.

## Constraints & Assumptions
**What limitations do we need to work within?**
- **Data Constraints:** We rely on open-source datasets (CVDICT, CC-CEDICT, GitHub TOCFL repos). Data may need cleaning and transformation.
- **Technical Constraints:** The backend should be self-hostable, lightweight, and easy to deploy alongside the React frontend.
- **Assumptions:** Users primarily want to learn Traditional Chinese (Taiwanese Mandarin) with Vietnamese as the instruction language.

## Questions & Open Items
**What do we still need to clarify?**
- Which backend framework / language should we use (Node.js/Express, Python/FastAPI, Go)? *Recommendation: Node.js with Express or NestJS, or Python FastAPI for easy data processing.*
- Which database to use (PostgreSQL, MongoDB, SQLite)? *Recommendation: PostgreSQL for structured relational data, or MongoDB for flexible document storage of dictionary entries.*
- Do we need a dedicated search endpoint for dictionary lookups outside of lessons?
