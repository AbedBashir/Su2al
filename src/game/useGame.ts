import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useReducer, useState } from 'react';

import { RULES as QUIZ, pointsFor, type Question } from '@/shared/quiz';
import { useSettingsStore } from '@/stores/settingsStore';

export type Mode = 'daily' | 'category';

export const RULES = {
  secondsPerQuestion: QUIZ.secondsPerQuestion,
  lives: 3,
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

export type Answer = { id: string; correct: boolean; points: number; ms: number; skipped?: boolean };

type State = {
  index: number;
  phase: 'question' | 'reveal' | 'done';
  /** Option the player picked; null on timeout or skip. */
  picked: number | null;
  /** Options removed by 50/50 for the current question. */
  hidden: number[];
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
  | { type: 'time' };

const initial = (now: number): State => ({
  index: 0,
  phase: 'question',
  picked: null,
  hidden: [],
  deadline: now + RULES.secondsPerQuestion * 1000,
  startedAt: now,
  score: 0,
  lives: RULES.lives,
  answers: [],
  usedHelpers: [],
});


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
          answers: [...s.answers, { id: a.question.id, correct, points, ms: a.now - s.startedAt }],
        };
      }
      case 'skip':
        if (s.phase !== 'question') return s;
        return {
          ...s,
          phase: 'reveal',
          picked: null,
          usedHelpers: [...s.usedHelpers, 'skip'],
          answers: [...s.answers, { id: a.question.id, correct: false, points: 0, ms: a.now - s.startedAt, skipped: true }],
        };
      case 'next': {
        if (s.phase !== 'reveal') return s;
        const over = s.index + 1 >= a.total || s.lives <= 0;
        if (over) return { ...s, phase: 'done' };
        return {
          ...s,
          index: s.index + 1,
          phase: 'question',
          picked: null,
          hidden: [],
          deadline: a.now + RULES.secondsPerQuestion * 1000,
          startedAt: a.now,
        };
      }
      case 'fifty': {
        if (s.phase !== 'question' || s.hidden.length) return s;
        return { ...s, hidden: a.hidden, usedHelpers: [...s.usedHelpers, 'fifty'] };
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
    if (state.phase !== 'question' || !current) return;
    const timer = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= state.deadline) dispatch({ type: 'pick', option: null, now: t, question: current });
    }, 100);
    return () => clearInterval(timer);
  }, [state.phase, state.deadline, state.index, questions]);

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
        const wrong = question.options.map((_, i) => i).filter((i) => i !== question.answer);
        dispatch({ type: 'fifty', hidden: wrong.sort(() => Math.random() - 0.5).slice(0, 2) });
      }
      if (helper === 'time') dispatch({ type: 'time' });
      if (helper === 'skip') dispatch({ type: 'skip', now: Date.now(), question });
    },
    [question],
  );

  const msLeft = state.phase === 'question' ? Math.max(0, state.deadline - now) : 0;
  return { state, question, msLeft, pick, applyHelper };
}
