import { create } from 'zustand';
import type { ReviewCard, ReviewStats, FSRSGrade } from '../types';
import { useAuthStore } from './authStore';
import { API_URLS } from '../config/api';

interface ReviewState {
  dueCards: ReviewCard[];
  currentIndex: number;
  stats: ReviewStats | null;
  isLoading: boolean;
  isGrading: boolean;
  error: string | null;
  // Actions
  fetchDueCards: () => Promise<void>;
  initCards: () => Promise<void>;
  gradeCard: (vocabularyId: string, grade: FSRSGrade) => Promise<void>;
  fetchStats: () => Promise<void>;
  nextCard: () => void;
  reset: () => void;
}

const REVIEW_URL = API_URLS.review;

function getAuthHeaders() {
  const token = useAuthStore.getState().token;
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  dueCards: [],
  currentIndex: 0,
  stats: null,
  isLoading: false,
  isGrading: false,
  error: null,

  fetchDueCards: async () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ error: 'Not authenticated', isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${REVIEW_URL}/due`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch due cards');
      const cards: ReviewCard[] = await res.json();
      set({ dueCards: cards, currentIndex: 0, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  initCards: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    try {
      await fetch(`${REVIEW_URL}/init`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
    } catch (err: any) {
      console.error('Failed to init cards:', err.message);
    }
  },

  gradeCard: async (vocabularyId: string, grade: FSRSGrade) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    set({ isGrading: true });
    try {
      const res = await fetch(`${REVIEW_URL}/grade`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ vocabularyId, grade })
      });
      if (!res.ok) throw new Error('Failed to grade card');

      // Move to next card
      get().nextCard();
      set({ isGrading: false });
    } catch (err: any) {
      // Queue grade for later sync on any failure (network or server error)
      queueOfflineGrade(vocabularyId, grade);
      get().nextCard();
      set({ isGrading: false });
    }
  },

  fetchStats: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    try {
      const res = await fetch(`${REVIEW_URL}/stats`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch stats');
      const stats: ReviewStats = await res.json();
      set({ stats });
    } catch (err: any) {
      console.error('Failed to fetch review stats:', err.message);
    }
  },

  nextCard: () => {
    set((state) => ({ currentIndex: state.currentIndex + 1 }));
  },

  reset: () => {
    set({ dueCards: [], currentIndex: 0, error: null });
  }
}));

// --- Offline grade queue helpers ---

const OFFLINE_QUEUE_KEY = 'review_offline_queue';

interface OfflineGrade {
  vocabularyId: string;
  grade: FSRSGrade;
  timestamp: number;
}

function queueOfflineGrade(vocabularyId: string, grade: FSRSGrade) {
  try {
    const queue: OfflineGrade[] = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
    queue.push({ vocabularyId, grade, timestamp: Date.now() });
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // localStorage full or unavailable
  }
}

/**
 * Sync any pending offline grades to the server.
 * Call on app load or when coming back online.
 */
export async function syncOfflineGrades() {
  const token = useAuthStore.getState().token;
  if (!token || !navigator.onLine) return;

  try {
    const queue: OfflineGrade[] = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
    if (queue.length === 0) return;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // Process grades sequentially to maintain order
    const remaining: OfflineGrade[] = [];
    for (const item of queue) {
      try {
        const res = await fetch(`${REVIEW_URL}/grade`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ vocabularyId: item.vocabularyId, grade: item.grade })
        });
        if (!res.ok) remaining.push(item);
      } catch {
        remaining.push(item);
      }
    }

    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
  } catch {
    // Ignore errors during sync
  }
}
