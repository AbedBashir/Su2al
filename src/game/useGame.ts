import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useReducer, useState } from 'react';

import { RULES as QUIZ, pointsFor, type Question } from '@/shared/quiz';
import { useSettingsStore } from '@/stores/settingsStore';

export type Mode = 'daily' | 'category';

export const RULES = {
  secondsPerQuestion: QUIZ.secondsPerQuestion,
  lives: 3,
  /** Hearts given back by the once-per-round "second chance" ad. */
  reviveLives: 2,
  revealMs: 1300,
  coinsPerCorrect: 2,
} as const;

/** Helpers cost coins and are only allowed in category rounds (the daily leaderboard stays fair). */
export const HELPERS = {
  fifty: { cost: 20, icon: 'scissors-cutting' },
  time: { cost: 10, icon: 'timer-plus-outline' },
  skip: { cost: 15, icon: 'skip-next' },
} as const;
export type Helper = keyof typeof HELPERS;

/** `choice` is the picked option's text (null on timeout or skip): the leaderboard server re-checks it. */
export type Answer = { id: string; choice: string | null; correct: boolean; points: number; ms: number; skipped?: boolean };

type State = {
  index: number;
  /** `offer`: out of hearts in a category round, deciding on the second-chance ad. */
  phase: 'question' | 'reveal' | 'offer' | 'done';
  /** Option the player picked; null on timeout or skip. */
  picked: number | null;
  /** Options removed by 50/50 or the hint for the current question. */
  hidden: number[];
  /** Hint (by ad) already used on this question. */
  hinted: boolean;
  /** Second chance already used this round. */
  revived: boolean;
  /** Set while an ad covers the screen: the countdown stops and resumes after it. */
  pausedAt: number | null;
  deadline: number;
  startedAt: number;
  score: number;
  lives: number;
  answers: Answer[];
  usedHelpers: Helper[];
};

type Action =
  | { type: 'pick'; option: number | null; now: number; question: Question }
  | { type: 'skip'; now: number; question: Question }
  | { type: 'next'; total: number; now: number }
  | { type: 'fifty'; hidden: number[] }
  | { type: 'hint'; hide: number }
  | { type: 'time' }
  | { type: 'pause'; now: number }
  | { type: 'resume'; now: number }
  | { type: 'revive'; total: number; now: number }
  | { type: 'decline' };

const initial = (now: number): State => ({
  index: 0,
  phase: 'question',
  picked: null,
  hidden: [],
  hinted: false,
  revived: false,
  pausedAt: null,
  deadline: now + RULES.secondsPerQuestion * 1000,
  startedAt: now,
  score: 0,
  lives: RULES.lives,
  answers: [],
  usedHelpers: [],
});


const advance = (s: State, now: number): State => ({
  ...s,
  index: s.index + 1,
  phase: 'question',
  picked: null,
  hidden: [],
  hinted: false,
  deadline: now + RULES.secondsPerQuestion * 1000,
  startedAt: now,
});

/** Wrong options still on screen. */
export const wrongLeft = (q: Question, hidden: number[]) =>
  q.options.map((_, i) => i).filter((i) => i !== q.answer && !hidden.includes(i));

function reducer(mode: Mode) {
  return (s: State, a: Action): State => {
    switch (a.type) {
      case 'pick': {
        if (s.phase !== 'question') return s;
        const correct = a.option === a.question.answer;
        // Same formula the leaderboard server uses to re-check daily scores.
        const points = pointsFor(correct, a.now - s.startedAt);
        return {
          ...s,
          phase: 'reveal',
          picked: a.option,
          score: s.score + points,
          lives: mode === 'category' && !correct ? s.lives - 1 : s.lives,
          answers: [
            ...s.answers,
            { id: a.question.id, choice: a.option === null ? null : (a.question.options[a.option] ?? null), correct, points, ms: a.now - s.startedAt },
          ],
        };
      }
      case 'skip':
        if (s.phase !== 'question') return s;
        return {
          ...s,
          phase: 'reveal',
          picked: null,
          usedHelpers: [...s.usedHelpers, 'skip'],
          answers: [...s.answers, { id: a.question.id, choice: null, correct: false, points: 0, ms: a.now - s.startedAt, skipped: true }],
        };
      case 'next': {
        if (s.phase !== 'reveal') return s;
        if (s.index + 1 >= a.total) return { ...s, phase: 'done' };
        // Out of hearts with questions left: offer the second chance once per round.
        if (s.lives <= 0) return mode === 'category' && !s.revived ? { ...s, phase: 'offer' } : { ...s, phase: 'done' };
        return advance(s, a.now);
      }
      case 'revive':
        if (s.phase !== 'offer') return s;
        return advance({ ...s, lives: RULES.reviveLives, revived: true }, a.now);
      case 'decline':
        return s.phase === 'offer' ? { ...s, phase: 'done' } : s;
      case 'fifty': {
        if (s.phase !== 'question') return s;
        return { ...s, hidden: [...s.hidden, ...a.hidden], usedHelpers: [...s.usedHelpers, 'fifty'] };
      }
      case 'hint':
        if (s.phase !== 'question' || s.hinted) return s;
        return { ...s, hidden: [...s.hidden, a.hide], hinted: true };
      case 'pause':
        return s.phase === 'question' && s.pausedAt === null ? { ...s, pausedAt: a.now } : s;
      case 'resume': {
        if (s.pausedAt === null) return s;
        // The ad's time doesn't count against the player, for the clock or the speed bonus.
        const away = a.now - s.pausedAt;
        return { ...s, pausedAt: null, deadline: s.deadline + away, startedAt: s.startedAt + away };
      }
      case 'time':
        if (s.phase !== 'question') return s;
        return { ...s, deadline: s.deadline + 10_000, usedHelpers: [...s.usedHelpers, 'time'] };
    }
  };
}

/**
 * Drives one round: the countdown (wall-clock based, so leaving the app doesn't
 * pause it), answers, scoring, lives and helpers.
 */
export function useGame(mode: Mode, questions: Question[]) {
  const [state, dispatch] = useReducer(reducer(mode), null, () => initial(Date.now()));
  const [now, setNow] = useState(() => Date.now());
  const haptics = useSettingsStore((s) => s.hapticsEnabled);
  const question = questions[state.index];

  // Countdown: tick while a question is open; time running out counts as a wrong answer.
  useEffect(() => {
    const current = questions[state.index];
    if (state.phase !== 'question' || !current || state.pausedAt !== null) return;
    const timer = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= state.deadline) dispatch({ type: 'pick', option: null, now: t, question: current });
    }, 100);
    return () => clearInterval(timer);
  }, [state.phase, state.deadline, state.index, state.pausedAt, questions]);

  // After the answer is shown, move on.
  useEffect(() => {
    if (state.phase !== 'reveal') return;
    const id = setTimeout(() => dispatch({ type: 'next', total: questions.length, now: Date.now() }), RULES.revealMs);
    return () => clearTimeout(id);
  }, [state.phase, questions.length]);

  // Feel the result.
  const lastAnswer = state.answers[state.answers.length - 1];
  useEffect(() => {
    if (!haptics || state.phase !== 'reveal' || !lastAnswer || lastAnswer.skipped) return;
    Haptics.notificationAsync(lastAnswer.correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
  }, [haptics, state.phase, lastAnswer]);

  const pick = useCallback(
    (option: number) => {
      if (question) dispatch({ type: 'pick', option, now: Date.now(), question });
    },
    [question],
  );

  /** Applies a helper the caller has already paid for. */
  const applyHelper = useCallback(
    (helper: Helper) => {
      if (!question) return;
      if (helper === 'fifty') {
        // Leaves the right answer and one wrong one, even after a hint.
        const wrong = wrongLeft(question, state.hidden).sort(() => Math.random() - 0.5);
        dispatch({ type: 'fifty', hidden: wrong.slice(0, wrong.length - 1) });
      }
      if (helper === 'time') dispatch({ type: 'time' });
      if (helper === 'skip') dispatch({ type: 'skip', now: Date.now(), question });
    },
    [question, state.hidden],
  );

  /**
   * Runs an ad over the game: the clock stops while it plays. Resolves with whether
   * the ad was watched to the end.
   */
  const withAdPause = useCallback(async (show: () => Promise<boolean>) => {
    dispatch({ type: 'pause', now: Date.now() });
    try {
      return await show();
    } finally {
      dispatch({ type: 'resume', now: Date.now() });
    }
  }, []);

  /** Removes one wrong option (after a watched ad). */
  const hint = useCallback(() => {
    if (!question) return;
    const wrong = wrongLeft(question, state.hidden);
    const hide = wrong[Math.floor(Math.random() * wrong.length)];
    if (hide !== undefined) dispatch({ type: 'hint', hide });
  }, [question, state.hidden]);

  const revive = useCallback(() => dispatch({ type: 'revive', total: questions.length, now: Date.now() }), [questions.length]);
  const decline = useCallback(() => dispatch({ type: 'decline' }), []);

  const msLeft = state.phase !== 'question' ? 0 : Math.max(0, state.deadline - (state.pausedAt ?? now));
  return { state, question, msLeft, pick, applyHelper, withAdPause, hint, revive, decline };
}
