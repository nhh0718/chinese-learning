import { create } from 'zustand';
import type { Topic, Lesson } from '../types';
import { API_URLS } from '../config/api';

interface TopicState {
    topics: Topic[];
    selectedTopic: Topic | null;
    topicLessons: Lesson[];
    isLoading: boolean;
    error: string | null;
    fetchTopics: (standard?: 'THEME' | 'HSK' | 'TOCFL') => Promise<void>;
    selectTopic: (topicId: string) => void;
    fetchLessons: (topicId: string) => Promise<void>;
}

export const useTopicStore = create<TopicState>((set) => ({
    topics: [],
    selectedTopic: null,
    topicLessons: [],
    isLoading: false,
    error: null,

    fetchTopics: async (standard?: 'THEME' | 'HSK' | 'TOCFL') => {
        set({ isLoading: true, error: null });
        try {
            const url = standard
                ? `${API_URLS.topics}?standard=${standard}`
                : API_URLS.topics;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Network response was not ok');
            const data = await res.json();
            const topics = data.map((t: any) => ({
                id: t._id,
                title: t.title,
                subtitle: t.title_vi,
                description: t.description_vi,
                color: t.color,
                lessonCount: t.lessonCount,
                icon: '', // Use SVG map in UI
                order: 0
            }));
            set({ topics, isLoading: false });
        } catch {
            set({ error: 'Failed to load topics', isLoading: false });
        }
    },

    selectTopic: (topicId: string) => {
        set((state) => ({
            selectedTopic: state.topics.find((t) => t.id === topicId) || null
        }));
    },

    fetchLessons: async (topicId: string) => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`${API_URLS.topics}/${topicId}/lessons`);
            if (!res.ok) throw new Error('Network response was not ok');
            const data = await res.json();
            const lessons = data.map((l: any) => ({
                id: l._id,
                topicId: l.topic_id,
                title: l.title,
                description: l.description_vi,
                order: l.order,
                vocabulary: [],
                sentences: [],
                exercises: []
            }));
            set({ topicLessons: lessons, isLoading: false });
        } catch {
            set({ error: 'Failed to load lessons', isLoading: false });
        }
    },
}));
