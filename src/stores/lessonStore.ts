import { create } from 'zustand';
import type { Lesson } from '../types';

interface LessonState {
    currentLesson: Lesson | null;
    isLoading: boolean;
    error: string | null;
    fetchLesson: (topicId: string, lessonId: string) => Promise<void>;
    clearLesson: () => void;
}

export const useLessonStore = create<LessonState>((set) => ({
    currentLesson: null,
    isLoading: false,
    error: null,

    fetchLesson: async (_topicId: string, lessonId: string) => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`http://localhost:5000/api/v1/lessons/${lessonId}`);
            if (!res.ok) throw new Error('Network response was not ok');
            const l = await res.json();

            const vocabulary = (l.vocabulary_refs || []).map((v: any) => ({
                id: v._id,
                character: v.traditional,
                pinyin: v.pinyin,
                zhuyin: v.zhuyin,
                meaning: v.han_viet ? `${v.meaning_vi} [${v.han_viet}]` : v.meaning_vi,
                meaningVi: v.meaning_vi,
                exampleSentences: [] // Mapped later
            }));

            const lesson: Lesson = {
                id: l._id,
                topicId: l.topic_id,
                title: l.title,
                description: l.description_vi,
                order: l.order,
                vocabulary: vocabulary,
                sentences: [],
                exercises: []
            };

            set({ currentLesson: lesson, isLoading: false });
        } catch {
            set({ error: 'Failed to load lesson', isLoading: false });
        }
    },

    clearLesson: () => {
        set({ currentLesson: null });
    },
}));
