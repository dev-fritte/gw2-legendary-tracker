import { useCallback, useState } from 'react';
import type { Step } from './prophecyTypes';
import { DEMO_ROADMAP, ROADMAP_KEY } from './prophecyTypes';

export function useRoadmap() {
  const [steps, setSteps] = useState<Step[]>(() => {
    try {
      const raw = localStorage.getItem(ROADMAP_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Step[];
        // Legacy entries stored the localized item name (string) instead of its ID —
        // those can't be resolved reliably anymore, so reset them to "unselected".
        return parsed.map((s) => (typeof s.item === 'string' ? { ...s, item: null } : s));
      }
    } catch (e) {
      void e;
    }
    return DEMO_ROADMAP;
  });

  const persist = useCallback((next: Step[]) => {
    setSteps(next);
    try {
      localStorage.setItem(ROADMAP_KEY, JSON.stringify(next));
    } catch (e) {
      void e;
    }
  }, []);

  return {
    steps,
    setItem: (id: number, item: number) =>
      persist(steps.map((s) => (s.id === id ? { ...s, item } : s))),
    toggleDone: (id: number) =>
      persist(
        steps.map((s) => {
          if (s.id !== id) return s;
          const nowDone = !s.done;
          return {
            ...s,
            done: nowDone,
            doneAt: nowDone
              ? new Date().toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })
              : undefined,
          };
        }),
      ),
    addStep: () =>
      persist([
        ...steps,
        { id: Math.max(0, ...steps.map((s) => s.id)) + 1, item: null, done: false },
      ]),
    removeStep: (id: number) => persist(steps.filter((s) => s.id !== id)),
  };
}
