import { create } from 'zustand';
import { useAuthStore } from './authStore';
import { API_URLS } from '../config/api';

interface GamificationProfile {
  xp: number;
  level: number;
  levelTitle: string;
  xpForNext: number;
  xpProgress: number;
  streak: number;
  weeklyXp: number;
  achievementsEarned: number;
  newAchievements: string[];
}

interface AchievementItem {
  _id: string;
  key: string;
  title: string;
  title_vi: string;
  description: string;
  icon: string;
  category: string;
  earned: boolean;
  earnedAt: string | null;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  level: number;
  weeklyXp: number;
  totalXp: number;
  levelTitle: string;
}

interface GamificationState {
  profile: GamificationProfile | null;
  achievements: AchievementItem[];
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  fetchProfile: () => Promise<void>;
  fetchAchievements: () => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  seedAchievements: () => Promise<void>;
}

const API_URL = API_URLS.gamification;

function getAuthHeaders() {
  const token = useAuthStore.getState().token;
  return { 'Authorization': `Bearer ${token}` };
}

export const useGamificationStore = create<GamificationState>((set, _get) => ({
  profile: null,
  achievements: [],
  leaderboard: [],
  isLoading: false,

  fetchProfile: async () => {
    try {
      const res = await fetch(`${API_URL}/profile`, { headers: getAuthHeaders() });
      if (res.ok) set({ profile: await res.json() });
    } catch { /* ignore */ }
  },

  fetchAchievements: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/achievements`, { headers: getAuthHeaders() });
      if (res.ok) set({ achievements: await res.json() });
    } catch { /* ignore */ }
    set({ isLoading: false });
  },

  fetchLeaderboard: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/leaderboard`, { headers: getAuthHeaders() });
      if (res.ok) set({ leaderboard: await res.json() });
    } catch { /* ignore */ }
    set({ isLoading: false });
  },

  seedAchievements: async () => {
    try {
      await fetch(`${API_URL}/seed-achievements`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
    } catch { /* ignore */ }
  }
}));
