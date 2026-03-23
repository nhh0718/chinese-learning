import { fsrs, createEmptyCard, generatorParameters, type Card, type Grade, Rating } from 'ts-fsrs';

// Initialize FSRS with default parameters
const params = generatorParameters();
const scheduler = fsrs(params);

// Grade mapping: Again=1, Hard=2, Good=3, Easy=4
export const GRADE_MAP: Record<number, Grade> = {
  1: Rating.Again,
  2: Rating.Hard,
  3: Rating.Good,
  4: Rating.Easy
};

/**
 * Create a new empty FSRS card for a word being learned for the first time
 */
export function createNewCard(): Card {
  return createEmptyCard();
}

/**
 * Schedule the next review based on the current card state and grade.
 * Returns the updated card with new due date and FSRS parameters.
 */
export function getNextReview(card: Card, grade: Grade) {
  const now = new Date();
  const scheduling = scheduler.repeat(card, now);
  return scheduling[grade].card;
}

/**
 * Convert a VocabularyProgress document to a ts-fsrs Card object
 */
export function progressToCard(progress: {
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: string;
  last_review: Date | null;
  due: Date;
}): Card {
  // Map state string to ts-fsrs State enum
  const stateMap: Record<string, number> = {
    'New': 0,
    'Learning': 1,
    'Review': 2,
    'Relearning': 3
  };

  return {
    due: new Date(progress.due),
    stability: progress.stability,
    difficulty: progress.difficulty,
    elapsed_days: progress.elapsed_days,
    scheduled_days: progress.scheduled_days,
    reps: progress.reps,
    lapses: progress.lapses,
    state: stateMap[progress.state] ?? 0,
    last_review: progress.last_review ? new Date(progress.last_review) : undefined
  } as Card;
}

/**
 * Convert a ts-fsrs Card back to fields for VocabularyProgress update
 */
export function cardToProgressFields(card: Card) {
  const stateNames = ['New', 'Learning', 'Review', 'Relearning'];
  return {
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
    state: stateNames[card.state] || 'New',
    last_review: card.last_review || new Date(),
    due: card.due
  };
}

export { Rating };
