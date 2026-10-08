import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from '@/lib/storage';

export type ThemeMode = 'system' | 'light' | 'dark';

type SettingsState = {
  themeMode: ThemeMode;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: 'system',
      soundEnabled: true,
      hapticsEnabled: true,
      setThemeMode: (themeMode) => set({ themeMode }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
    }),
    {
      name: 'settings',
      version: 1,
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
