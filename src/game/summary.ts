import type { CategoryId } from '@/lib/categories';
import type { Mode } from './useGame';

/** What the result screen shows about the round that just ended. */
export type RoundSummary = {
  mode: Mode;
  /** dayKey of a daily round. */
  day?: string;
  category?: CategoryId;
  score: number;
  correct: number;
  total: number;
  coins: number;
  streak?: number;
  best?: boolean;
  outOfLives?: boolean;
};

// Handed from the game screen to the result screen in memory, which keeps the
// route free of a long query string and can't be edited from a deep link.
let last: RoundSummary | null = null;
export const setLastRound = (summary: RoundSummary) => {
  last = summary;
};
export const lastRound = () => last;
