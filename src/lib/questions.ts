import type { CategoryId } from './categories';
import { CATEGORIES } from './categories';

import arts from '@/data/questions/arts.json';
import general from '@/data/questions/general.json';
import geography from '@/data/questions/geography.json';
import history from '@/data/questions/history.json';
import language from '@/data/questions/language.json';
import nature from '@/data/questions/nature.json';
import religion from '@/data/questions/religion.json';
import science from '@/data/questions/science.json';
import sports from '@/data/questions/sports.json';
import technology from '@/data/questions/technology.json';

/** 1 easy · 2 medium · 3 hard. */
export type Difficulty = 1 | 2 | 3;

/** As stored in the bundled JSON: `a` is the index of the correct option in `o`. */
type RawQuestion = { id: string; q: string; o: string[]; a: number; d: Difficulty };

/** Ready to play: options already shuffled, `answer` points at the correct one. */
export type Question = {
  id: string;
  category: CategoryId;
  text: string;
  options: string[];
  answer: number;
  difficulty: Difficulty;
};

const BANK: Record<CategoryId, RawQuestion[]> = {
  history,
  geography,
  science,
  sports,
  language,
  religion,
  arts,
  technology,
  nature,
  general,
} as Record<CategoryId, RawQuestion[]>;

export const questionCount = (category?: CategoryId) =>
  category ? BANK[category].length : CATEGORIES.reduce((n, c) => n + BANK[c.id].length, 0);

/** Small, fast, seedable PRNG so the daily set is identical on every phone. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j] as T, a[i] as T];
  }
  return a;
}

function prepare(raw: RawQuestion, category: CategoryId, random: () => number): Question {
  const order = shuffle(raw.o.map((_, i) => i), random);
  return {
    id: raw.id,
    category,
    text: raw.q,
    options: order.map((i) => raw.o[i] ?? ''),
    answer: order.indexOf(raw.a),
    difficulty: raw.d,
  };
}

/**
 * The day's challenge in Mecca time (UTC+3), the common reference across the Arab
 * world: everyone gets the same 10 questions, and the day rolls over at midnight there.
 */
export function dayKey(date = new Date()): string {
  return new Date(date.getTime() + 3 * 3_600_000).toISOString().slice(0, 10);
}

/** Same 10 questions, same option order, on every phone: 4 easy, 4 medium, 2 hard, one per category where possible. */
export function dailyQuestions(key = dayKey()): Question[] {
  const random = mulberry32(hashString(`su2al:${key}`));
  const plan: Difficulty[] = [1, 1, 1, 1, 2, 2, 2, 2, 3, 3];
  const categories = shuffle(CATEGORIES.map((c) => c.id), random);
  const picked: Question[] = [];
  const used = new Set<string>();
  plan.forEach((difficulty, i) => {
    const category = categories[i % categories.length] as CategoryId;
    const pool = BANK[category].filter((q) => q.d === difficulty && !used.has(q.id));
    const fallback = BANK[category].filter((q) => !used.has(q.id));
    const choices = pool.length ? pool : fallback;
    const raw = choices[Math.floor(random() * choices.length)];
    if (!raw) return;
    used.add(raw.id);
    picked.push(prepare(raw, category, random));
  });
  return picked;
}

/**
 * A category round: unseen questions first (so players rarely see repeats), easy
 * to hard, freshly shuffled each time.
 */
export function categoryQuestions(category: CategoryId, seen: readonly string[], count = 10): Question[] {
  const random = Math.random;
  const seenSet = new Set(seen);
  const all = BANK[category];
  const fresh = shuffle(all.filter((q) => !seenSet.has(q.id)), random);
  const repeats = shuffle(all.filter((q) => seenSet.has(q.id)), random);
  return [...fresh, ...repeats]
    .slice(0, count)
    .sort((a, b) => a.d - b.d)
    .map((raw) => prepare(raw, category, random));
}
