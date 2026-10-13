import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { z } from 'zod';

import { dailyQuestions, dayKey, pointsFor, RULES } from '../../src/shared/quiz';
import { db } from './db';

export const submitSchema = z.object({
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  answers: z
    .array(z.object({ id: z.string(), choice: z.string().nullable(), ms: z.number().int().min(0).max(600_000) }))
    .max(RULES.questionsPerRound),
});
export type Submission = z.infer<typeof submitSchema>;

/** Today, plus yesterday for 2 hours after midnight Mecca time (a round started before midnight). */
export function acceptableDay(day: string, now = new Date()) {
  return day === dayKey(now) || day === dayKey(new Date(now.getTime() - 2 * 3_600_000));
}

/**
 * Re-scores a daily round from the answers alone: the server builds the same 10
 * questions, so the client's own score is never trusted.
 */
export function scoreSubmission({ day, answers }: Submission) {
  const questions = dailyQuestions(day);
  let score = 0;
  let correct = 0;
  let timeMs = 0;
  answers.forEach((a, i) => {
    const q = questions[i];
    if (!q || q.id !== a.id) throw new Error(`Answer ${i + 1} doesn't match today's questions`);
    const ok = a.choice !== null && a.choice === q.options[q.answer];
    const ms = Math.min(a.ms, RULES.secondsPerQuestion * 1000);
    score += pointsFor(ok, ms);
    correct += ok ? 1 : 0;
    timeMs += ms;
  });
  // Unanswered questions (left mid-round) count as full time.
  timeMs += (questions.length - answers.length) * RULES.secondsPerQuestion * 1000;
  return { score, correct, timeMs, total: questions.length };
}

export async function saveDaily(playerId: string, day: string, r: { score: number; correct: number; timeMs: number }) {
  const [res] = await db.query<ResultSetHeader>(
    'INSERT IGNORE INTO daily_scores (player_id, day, score, correct, time_ms) VALUES (?, ?, ?, ?, ?)',
    [playerId, day, r.score, r.correct, r.timeMs],
  );
  return res.affectedRows === 1;
}

/** Ranking: higher score first; ties go to whoever answered faster in total. */
export async function dailyRank(playerId: string, day: string) {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT s.score, s.correct,
       (SELECT COUNT(*) FROM daily_scores o
         WHERE o.day = s.day AND (o.score > s.score OR (o.score = s.score AND o.time_ms < s.time_ms))) + 1 AS rank_pos
     FROM daily_scores s WHERE s.player_id = ? AND s.day = ?`,
    [playerId, day],
  );
  const r = rows[0];
  return r ? { rank: Number(r.rank_pos), score: Number(r.score), correct: Number(r.correct) } : null;
}

export async function dailyTop(day: string, limit: number) {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT p.id, p.name, p.country, s.score, s.correct
     FROM daily_scores s JOIN players p ON p.id = s.player_id
     WHERE s.day = ? ORDER BY s.score DESC, s.time_ms ASC, s.created_at ASC LIMIT ?`,
    [day, limit],
  );
  const [count] = await db.query<RowDataPacket[]>('SELECT COUNT(*) AS n FROM daily_scores WHERE day = ?', [day]);
  return {
    entries: rows.map((r, i) => ({ rank: i + 1, id: r.id as string, name: r.name as string, country: r.country as string, score: Number(r.score), correct: Number(r.correct) })),
    players: Number(count[0]?.n ?? 0),
  };
}

export async function allTimeTop(limit: number) {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT p.id, p.name, p.country, SUM(s.score) AS total, COUNT(*) AS games
     FROM daily_scores s JOIN players p ON p.id = s.player_id
     GROUP BY p.id, p.name, p.country ORDER BY total DESC, games ASC LIMIT ?`,
    [limit],
  );
  return rows.map((r, i) => ({ rank: i + 1, id: r.id as string, name: r.name as string, country: r.country as string, score: Number(r.total), games: Number(r.games) }));
}

export async function allTimeRank(playerId: string) {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT me.total,
       (SELECT COUNT(*) FROM (SELECT SUM(score) AS t FROM daily_scores GROUP BY player_id) x WHERE x.t > me.total) + 1 AS rank_pos
     FROM (SELECT SUM(score) AS total FROM daily_scores WHERE player_id = ?) me WHERE me.total IS NOT NULL`,
    [playerId],
  );
  const r = rows[0];
  return r ? { rank: Number(r.rank_pos), score: Number(r.total) } : null;
}
