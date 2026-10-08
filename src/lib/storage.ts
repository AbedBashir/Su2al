import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

/** One shared MMKV instance for the whole app (synchronous, fast on low-end devices). */
export const storage = createMMKV({ id: 'su2al' });

/** Adapter so Zustand's `persist` middleware can write to MMKV. */
export const zustandStorage: StateStorage = {
  getItem: (name) => storage.getString(name) ?? null,
  setItem: (name, value) => storage.set(name, value),
  removeItem: (name) => {
    storage.remove(name);
  },
};
