import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface QuizAnswer {
  questionId: string;
  selected: string | string[];
  correct: boolean;
  at: number;
}

interface ProgressState {
  completed: Record<string, number>; // lessonId -> timestamp
  quiz: Record<string, QuizAnswer>; // questionId -> answer
  lastVisited: { id: string; href: string; title: string } | null;
  markComplete: (lessonId: string) => void;
  markIncomplete: (lessonId: string) => void;
  isComplete: (lessonId: string) => boolean;
  recordQuiz: (a: QuizAnswer) => void;
  setLastVisited: (l: { id: string; href: string; title: string }) => void;
  pathProgress: (lessonIds: string[]) => { done: number; total: number; pct: number };
  reset: () => void;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      completed: {},
      quiz: {},
      lastVisited: null,
      markComplete: (id) =>
        set((s) => ({ completed: { ...s.completed, [id]: Date.now() } })),
      markIncomplete: (id) =>
        set((s) => {
          const next = { ...s.completed };
          delete next[id];
          return { completed: next };
        }),
      isComplete: (id) => Boolean(get().completed[id]),
      recordQuiz: (a) => set((s) => ({ quiz: { ...s.quiz, [a.questionId]: a } })),
      setLastVisited: (l) => set({ lastVisited: l }),
      pathProgress: (ids) => {
        const c = get().completed;
        const done = ids.filter((i) => c[i]).length;
        const total = ids.length;
        return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
      },
      reset: () => set({ completed: {}, quiz: {}, lastVisited: null }),
    }),
    {
      name: 'atlas:progress:v1',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
