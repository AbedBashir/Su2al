import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { api, ApiError, type DailyAnswer, type PlayerProfile } from '@/lib/api';
import { zustandStorage } from '@/lib/storage';

type Pending = { day: string; answers: DailyAnswer[] };

type PlayerState = {
  profile: (PlayerProfile & { token: string }) | null;
  /** A finished daily round not yet on the server (no profile yet, or offline). */
  pending: Pending | null;
  /** Rank from the last successful daily submission, by day. */
  lastRank: { day: string; rank: number } | null;

  join: (name: string, country: string) => Promise<void>;
  update: (changes: { name?: string; country?: string }) => Promise<void>;
  queueDaily: (pending: Pending) => void;
  /** Sends the pending round if there is one. Safe to call anytime. */
  flush: () => Promise<number | null>;
};

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      profile: null,
      pending: null,
      lastRank: null,

      join: async (name, country) => {
        const created = await api.createPlayer(name, country);
        set({ profile: created });
        await get().flush();
      },
      update: async (changes) => {
        const { profile } = get();
        if (!profile) return;
        const updated = await api.updatePlayer(profile.token, changes);
        set({ profile: { ...profile, ...updated } });
      },
      queueDaily: (pending) => set({ pending }),
      flush: async () => {
        const { profile, pending } = get();
        if (!profile || !pending) return null;
        try {
          const r = await api.submitDaily(profile.token, pending.day, pending.answers);
          set({ pending: null, lastRank: { day: pending.day, rank: r.rank } });
          return r.rank;
        } catch (e) {
          // The server refused it for good (too late, bad data): drop it. Network errors keep it for later.
          if (e instanceof ApiError && e.status >= 400 && e.status < 500 && e.status !== 401) set({ pending: null });
          return null;
        }
      },
    }),
    {
      name: 'player',
      version: 1,
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
