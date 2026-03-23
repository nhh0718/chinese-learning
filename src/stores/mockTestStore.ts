import { create } from 'zustand';
import type { MockTest, MockTestListItem, MockTestAnswer, MockTestResult } from '../types';
import { useAuthStore } from './authStore';
import { API_URLS } from '../config/api';

interface MockTestState {
  tests: MockTestListItem[];
  currentTest: MockTest | null;
  currentResult: MockTestResult | null;
  history: MockTestResult[];
  answers: MockTestAnswer[];
  currentSectionIndex: number;
  currentQuestionIndex: number;
  timeRemaining: number;
  startedAt: string | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  timerInterval: ReturnType<typeof setInterval> | null;
  // Actions
  fetchTests: (level?: number) => Promise<void>;
  fetchHistory: () => Promise<void>;
  loadTest: (testId: string) => Promise<void>;
  startTest: () => void;
  answerQuestion: (sectionIndex: number, questionIndex: number, answer: string) => void;
  navigateTo: (sectionIndex: number, questionIndex: number) => void;
  submitTest: () => Promise<void>;
  seedTests: () => Promise<void>;
  reset: () => void;
}

const API_URL = API_URLS.mockTests;

function getAuthHeaders() {
  const token = useAuthStore.getState().token;
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
}

export const useMockTestStore = create<MockTestState>((set, get) => ({
  tests: [],
  currentTest: null,
  currentResult: null,
  history: [],
  answers: [],
  currentSectionIndex: 0,
  currentQuestionIndex: 0,
  timeRemaining: 0,
  startedAt: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  timerInterval: null,

  fetchTests: async (level) => {
    set({ isLoading: true, error: null });
    try {
      const url = level ? `${API_URL}?level=${level}` : API_URL;
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch tests');
      set({ tests: await res.json(), isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchHistory: async () => {
    try {
      const res = await fetch(`${API_URL}/history`, { headers: getAuthHeaders() });
      if (res.ok) set({ history: await res.json() });
    } catch { /* ignore */ }
  },

  loadTest: async (testId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/${testId}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to load test');
      const test: MockTest = await res.json();
      set({ currentTest: test, isLoading: false, answers: [], currentResult: null });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  startTest: () => {
    const test = get().currentTest;
    if (!test) return;

    const startedAt = new Date().toISOString();
    const timeRemaining = test.duration_minutes * 60;

    // Start countdown timer
    const interval = setInterval(() => {
      const remaining = get().timeRemaining - 1;
      if (remaining <= 0) {
        clearInterval(get().timerInterval!);
        get().submitTest(); // Auto-submit
      }
      set({ timeRemaining: remaining });
    }, 1000);

    set({
      startedAt,
      timeRemaining,
      timerInterval: interval,
      currentSectionIndex: 0,
      currentQuestionIndex: 0,
      answers: []
    });
  },

  answerQuestion: (sectionIndex, questionIndex, answer) => {
    set((state) => {
      const newAnswers = state.answers.filter(
        a => !(a.sectionIndex === sectionIndex && a.questionIndex === questionIndex)
      );
      newAnswers.push({ sectionIndex, questionIndex, answer });
      return { answers: newAnswers };
    });
  },

  navigateTo: (sectionIndex, questionIndex) => {
    set({ currentSectionIndex: sectionIndex, currentQuestionIndex: questionIndex });
  },

  submitTest: async () => {
    const { currentTest, startedAt, answers, timerInterval } = get();
    if (!currentTest || !startedAt) return;

    if (timerInterval) clearInterval(timerInterval);
    set({ isSubmitting: true, timerInterval: null });

    try {
      const res = await fetch(`${API_URL}/${currentTest._id}/submit`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ startedAt, answers })
      });
      if (!res.ok) throw new Error('Failed to submit test');
      const result: MockTestResult = await res.json();
      set({ currentResult: result, isSubmitting: false });
    } catch (err: any) {
      set({ error: err.message, isSubmitting: false });
    }
  },

  seedTests: async () => {
    try {
      await fetch(`${API_URL}/seed`, { method: 'POST', headers: getAuthHeaders() });
      await get().fetchTests();
    } catch { /* ignore */ }
  },

  reset: () => {
    const { timerInterval } = get();
    if (timerInterval) clearInterval(timerInterval);
    set({
      currentTest: null, currentResult: null, answers: [],
      currentSectionIndex: 0, currentQuestionIndex: 0,
      timeRemaining: 0, startedAt: null, timerInterval: null,
      isSubmitting: false, error: null
    });
  }
}));
