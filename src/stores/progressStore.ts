import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { CategoryId } from '@/lib/categories';
import { dayKey } from '@/lib/questions';
import { zustandStorage } from '@/lib/storage';

/** Coins a new player starts with, enough to try every helper once or twice. */
export const STARTING_COINS = 60;
/** Remember this many question ids per category, so rounds favour unseen ones. */
const SEEN_LIMIT = 400;

export type DailyResult = { score: number; correct: number; total: number };

type ProgressState = {
  coins: number;
  /** Consecutive days with a finished daily challenge. */
  streak: number;
  bestStreak: number;
  /** dayKey of the last finished daily challenge. */
  lastDaily: string | null;
  /** Finished daily challenges, by dayKey (only recent days are kept). */
  daily: Record<string, DailyResult>;
  /** Best round score per category. */
  bestByCategory: Partial<Record<CategoryId, number>>;
  totalCorrect: number;
  gamesPlayed: number;
  seen: Partial<Record<CategoryId, string[]>>;

  addCoins: (n: number) => void;
  /** Spends coins if the player has enough. Returns whether it worked. */
  spendCoins: (n: number) => boolean;
  markSeen: (category: CategoryId, ids: string[]) => void;
  finishDaily: (result: DailyResult) => { streak: number };
  finishCategory: (category: CategoryId, score: number, correct: number) => { best: boolean };
};

const yesterday = (key: string) => {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      coins: STARTING_COINS,
      streak: 0,
      bestStreak: 0,
      lastDaily: null,
      daily: {},
      bestByCategory: {},
      totalCorrect: 0,
      gamesPlayed: 0,
      seen: {},

      addCoins: (n) => set((s) => ({ coins: s.coins + n })),
      spendCoins: (n) => {
        if (get().coins < n) return false;
        set((s) => ({ coins: s.coins - n }));
        return true;
      },
      markSeen: (category, ids) =>
        set((s) => {
          const merged = [...(s.seen[category] ?? []).filter((id) => !ids.includes(id)), ...ids];
          return { seen: { ...s.seen, [category]: merged.slice(-SEEN_LIMIT) } };
        }),
      finishDaily: (result) => {
        const today = dayKey();
        const s = get();
        if (s.daily[today]) return { streak: s.streak }; // one attempt per day
        const streak = s.lastDaily === yesterday(today) ? s.streak + 1 : 1;
        // Keep a month of history; enough for the result screen and stats.
        const recent = Object.fromEntries(Object.entries(s.daily).sort(([a], [b]) => b.localeCompare(a)).slice(0, 30));
        set({
          daily: { ...recent, [today]: result },
          lastDaily: today,
          streak,
          bestStreak: Math.max(s.bestStreak, streak),
          totalCorrect: s.totalCorrect + result.correct,
          gamesPlayed: s.gamesPlayed + 1,
        });
        return { streak };
      },
      finishCategory: (category, score, correct) => {
        const s = get();
        const best = score > (s.bestByCategory[category] ?? 0);
        set({
          bestByCategory: best ? { ...s.bestByCategory, [category]: score } : s.bestByCategory,
          totalCorrect: s.totalCorrect + correct,
          gamesPlayed: s.gamesPlayed + 1,
        });
        return { best };
      },
    }),
    {
      name: 'progress',
      version: 1,
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);

/** The streak shown on Home: it's lost once a whole day passes without playing. */
export function liveStreak(state: Pick<ProgressState, 'streak' | 'lastDaily'>, today = dayKey()) {
  if (!state.lastDaily) return 0;
  return state.lastDaily === today || state.lastDaily === yesterday(today) ? state.streak : 0;
}
