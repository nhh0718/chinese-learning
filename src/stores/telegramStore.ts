import { create } from 'zustand';
import type { DailyQuiz, TelegramProgress, TelegramSubscription } from '../types';

interface TelegramState {
  // Daily Quiz
  dailyQuiz: DailyQuiz | null;
  isQuizLoading: boolean;
  quizError: string | null;

  // User Progress
  progress: TelegramProgress | null;
  isProgressLoading: boolean;

  // Subscription
  subscription: TelegramSubscription | null;
  isSubscriptionLoading: boolean;

  // Actions
  fetchDailyQuiz: () => Promise<void>;
  submitQuizResult: (userId: string, answers: { questionIndex: number; answerIndex: number }[]) => Promise<void>;
  fetchProgress: (userId: string) => Promise<void>;
  fetchSubscription: (userId: string) => Promise<void>;
  updateSubscription: (userId: string, reminderTime?: string, timezone?: string) => Promise<void>;
  clearError: () => void;
}

const API_URL = 'http://localhost:5000/api/v1/telegram';

export const useTelegramStore = create<TelegramState>()((set, get) => ({
  // Initial state
  dailyQuiz: null,
  isQuizLoading: false,
  quizError: null,
  progress: null,
  isProgressLoading: false,
  subscription: null,
  isSubscriptionLoading: false,

  fetchDailyQuiz: async () => {
    set({ isQuizLoading: true, quizError: null });
    try {
      const res = await fetch(`${API_URL}/daily-quiz`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch daily quiz');
      set({ dailyQuiz: data, isQuizLoading: false });
    } catch (err: any) {
      set({ quizError: err.message, isQuizLoading: false });
    }
  },

  submitQuizResult: async (userId, answers) => {
    set({ isQuizLoading: true, quizError: null });
    try {
      const { dailyQuiz } = get();
      if (!dailyQuiz) throw new Error('No quiz available');

      const res = await fetch(`${API_URL}/quiz-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          quizId: dailyQuiz._id,
          answers
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit quiz');

      // Refresh progress after submission
      get().fetchProgress(userId);
      set({ isQuizLoading: false });
    } catch (err: any) {
      set({ quizError: err.message, isQuizLoading: false });
    }
  },

  fetchProgress: async (userId) => {
    set({ isProgressLoading: true });
    try {
      const res = await fetch(`${API_URL}/progress/${userId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch progress');
      set({ progress: data, isProgressLoading: false });
    } catch (err: any) {
      set({ isProgressLoading: false });
    }
  },

  fetchSubscription: async (userId) => {
    set({ isSubscriptionLoading: true });
    try {
      const res = await fetch(`${API_URL}/subscription/${userId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch subscription');
      set({ subscription: data, isSubscriptionLoading: false });
    } catch (err: any) {
      set({ isSubscriptionLoading: false });
    }
  },

  updateSubscription: async (userId, reminderTime, timezone) => {
    set({ isSubscriptionLoading: true });
    try {
      const res = await fetch(`${API_URL}/subscription/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminderTime, timezone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update subscription');
      set({ subscription: data, isSubscriptionLoading: false });
    } catch (err: any) {
      set({ isSubscriptionLoading: false });
    }
  },

  clearError: () => {
    set({ quizError: null });
  }
}));
