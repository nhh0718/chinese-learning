import { create } from 'zustand';
import type { ReviewCard, FSRSGrade } from '../types';
import { useAuthStore } from './authStore';
import { API_URLS } from '../config/api';

export type FlashcardMode = 'learn' | 'review' | 'quick' | 'cram';

interface SessionStats {
  correct: number;   // Good + Easy grades
  incorrect: number; // Again grades
  hard: number;      // Hard grades
  total: number;
  startedAt: number;
}

interface FlashcardState {
  mode: FlashcardMode | null;
  cards: ReviewCard[];
  currentIndex: number;
  isFlipped: boolean;
  sessionStats: SessionStats;
  isLoading: boolean;
  isSessionActive: boolean;
  error: string | null;
  // Actions
  startSession: (mode: FlashcardMode, options?: { topicId?: string; level?: number }) => Promise<void>;
  gradeCard: (grade: FSRSGrade) => Promise<void>;
  flipCard: () => void;
  endSession: () => void;
}

const REVIEW_URL = API_URLS.review;

function getAuthHeaders() {
  const token = useAuthStore.getState().token;
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

const initialStats: SessionStats = { correct: 0, incorrect: 0, hard: 0, total: 0, startedAt: 0 };

export const useFlashcardStore = create<FlashcardState>((set, get) => ({
  mode: null,
  cards: [],
  currentIndex: 0,
  isFlipped: false,
  sessionStats: { ...initialStats },
  isLoading: false,
  isSessionActive: false,
  error: null,

  startSession: async (mode, _options) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    set({ isLoading: true, error: null, mode, isSessionActive: true });

    try {
      let url = `${REVIEW_URL}/due`;

      // Different fetch strategies per mode
      if (mode === 'learn') {
        // New cards only, limited batch
        url = `${REVIEW_URL}/due?state=New&limit=20`;
      } else if (mode === 'review') {
        // All due SRS cards
        url = `${REVIEW_URL}/due`;
      } else if (mode === 'quick') {
        // Random 15 cards
        url = `${REVIEW_URL}/due?limit=15`;
      } else if (mode === 'cram') {
        // All due cards, larger batch
        url = `${REVIEW_URL}/due?limit=100`;
      }

      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch cards');
      const cards: ReviewCard[] = await res.json();

      set({
        cards,
        currentIndex: 0,
        isFlipped: false,
        sessionStats: { ...initialStats, startedAt: Date.now() },
        isLoading: false
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false, isSessionActive: false });
    }
  },

  gradeCard: async (grade) => {
    const { cards, currentIndex } = get();
    const card = cards[currentIndex];
    if (!card) return;

    // Update local stats
    set((state) => {
      const stats = { ...state.sessionStats, total: state.sessionStats.total + 1 };
      if (grade === 1) stats.incorrect++;
      else if (grade === 2) stats.hard++;
      else stats.correct++;
      return { sessionStats: stats };
    });

    // Send grade to API (fire and forget for speed)
    const token = useAuthStore.getState().token;
    if (token) {
      fetch(`${REVIEW_URL}/grade`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ vocabularyId: card.vocabularyId, grade })
      }).catch(() => {
        // Will be queued by reviewStore's offline logic if needed
      });
    }

    // Advance to next card
    set((state) => ({
      currentIndex: state.currentIndex + 1,
      isFlipped: false
    }));
  },

  flipCard: () => {
    set((state) => ({ isFlipped: !state.isFlipped }));
  },

  endSession: () => {
    set({
      mode: null,
      cards: [],
      currentIndex: 0,
      isFlipped: false,
      isSessionActive: false,
      sessionStats: { ...initialStats }
    });
  }
}));
