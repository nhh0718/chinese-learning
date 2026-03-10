---
phase: testing
title: Testing Strategy — Chinese Learning Web
description: Testing approach, test cases, and quality assurance for the Chinese learning web app
---

# Testing Strategy — Chinese Learning Web

## Test Coverage Goals
**What level of testing do we aim for?**

- Unit test coverage: 80%+ for utility functions, API client, and exercise validation logic.
- Component tests: All interactive components (exercises, flashcards, audio button).
- Integration tests: Page-level tests ensuring data flow from API → store → UI.
- E2E tests: Key user journeys (browse topics → study lesson → complete exercise).

## Unit Tests
**What individual components need testing?**

### API Client Module
- [ ] `getTopics()` returns correctly shaped data
- [ ] `getLessonById()` handles 404 gracefully
- [ ] `updateProgress()` sends correct payload
- [ ] Error interceptor handles network failures

### Exercise Validation Logic
- [ ] Multiple choice: correct/incorrect answer detection
- [ ] Fill-in-blank: case-insensitive matching, trim whitespace
- [ ] Matching: all pairs must match for success
- [ ] Score calculation: correct answers / total × 100

### Utility Functions
- [ ] Pinyin tone formatting
- [ ] Progress percentage calculation
- [ ] Date formatting for "last studied"

## Integration Tests
**How do we test component interactions?**

- [ ] TopicCatalogPage fetches and renders topics from store
- [ ] LessonDetailPage loads vocabulary cards from API response
- [ ] ExercisePage flows through multiple exercises and shows final score
- [ ] ProgressPage aggregates completion data correctly
- [ ] Theme toggle persists preference and updates all CSS variables

## End-to-End Tests
**What user flows need validation?**

- [ ] **Topic Browsing Flow**: Navigate to catalog → see topics → click topic → see lessons list
- [ ] **Lesson Study Flow**: Select lesson → view vocab cards → flip cards → listen to audio → proceed to exercises
- [ ] **Exercise Flow**: Answer multiple choice → see feedback → complete all exercises → see score
- [ ] **Review Flow**: Open review page → flip flashcards → mark as known/unknown → progress updates
- [ ] **Responsive Flow**: Resize viewport → ensure layout adapts → no horizontal scroll

## Test Data
**What data do we use for testing?**

- Mock JSON files in `src/mock/` mirroring real API responses.
- Test fixtures for each exercise type with known correct answers.
- Edge case data: empty topics, lessons with no audio, very long vocabulary lists.

## Manual Testing
**What requires human validation?**

- [ ] Visual design review — does it look "premium" and "stunning"?
- [ ] Animation smoothness — no janky transitions
- [ ] Audio playback — pronunciation plays correctly with no lag
- [ ] Mobile usability — touch interactions work well (card flipping, button tapping)
- [ ] Dark/light mode — all elements visible and aesthetically pleasing in both modes
- [ ] Chinese character rendering — Traditional Chinese (繁體) renders correctly, no tofu (□) characters

## Performance Testing
**How do we validate performance?**

- Lighthouse audit on mobile emulation (target ≥ 85)
- Page load time measurement with throttled connection
- Memory profiling for long vocab lists and flashcard sessions

## Bug Tracking
**How do we manage issues?**

- GitHub Issues for tracking bugs
- Severity levels: Critical (broken flow), Major (degraded experience), Minor (cosmetic)
- Regression tests added for each fixed bug
