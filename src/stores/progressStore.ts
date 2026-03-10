import { create } from 'zustand';
import type { UserProgress } from '../types';
import { useAuthStore } from './authStore';

interface ProgressState {
    progress: UserProgress[];
    streak: number;
    totalWordsLearned: number;
    isLoading: boolean;
    error: string | null;
    fetchProgress: () => Promise<void>;
    getTopicProgress: (topicId: string) => number;
    getLessonProgress: (lessonId: string) => UserProgress | undefined;
    updateProgress: (lessonId: string, topicId: string, score: number) => Promise<void>;
}

const API_URL = 'http://localhost:5000/api/v1/progress';

export const useProgressStore = create<ProgressState>((set, get) => ({
    progress: [],
    streak: 0,
    totalWordsLearned: 0,
    isLoading: false,
    error: null,

    fetchProgress: async () => {
        const token = useAuthStore.getState().token;
        if (!token) {
            set({ progress: [], error: 'Not authenticated', isLoading: false });
            return;
        }

        set({ isLoading: true, error: null });
        try {
            const res = await fetch(API_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Failed to fetch progress');
            const data = await res.json();
            
            const mappedProgress: UserProgress[] = data.map((p: any) => ({
                topicId: p.topic_id || '',
                lessonId: p.lesson_id,
                completed: p.completed,
                score: p.score,
                masteryLevel: p.mastery_level,
                lastStudied: p.updatedAt
            }));

            set({ progress: mappedProgress, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    getTopicProgress: (topicId: string) => {
        const topicProgress = get().progress.filter((p) => p.topicId === topicId);
        if (topicProgress.length === 0) return 0;
        const completed = topicProgress.filter((p) => p.completed).length;
        // As a simple heuristic, assume each topic has 3-5 lessons. 
        // For accurate tracking, we should divide by total lessons in the topic (from topicStore).
        return Math.round((completed / 4) * 100);
    },

    getLessonProgress: (lessonId: string) => {
        return get().progress.find((p) => p.lessonId === lessonId);
    },

    updateProgress: async (lessonId: string, topicId: string, score: number) => {
        const token = useAuthStore.getState().token;
        if (!token) return;

        try {
            const res = await fetch(`${API_URL}/${lessonId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    topic_id: topicId,
                    completed: score >= 60,
                    score,
                    mastery_level: score >= 90 ? 5 : score >= 70 ? 3 : score >= 60 ? 2 : 1
                })
            });

            if (!res.ok) throw new Error('Failed to update progress');
            
            // Refetch to sync state
            await get().fetchProgress();
        } catch (err: any) {
            console.error(err);
        }
    },
}));
