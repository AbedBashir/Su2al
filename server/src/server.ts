import express, { type NextFunction, type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

import { dayKey } from '../../src/shared/quiz';
import { ensureSchema } from './db';
import { countrySchema, createPlayer, nameSchema, optionalPlayer, requirePlayer, updatePlayer } from './players';
import { acceptableDay, allTimeRank, allTimeTop, dailyRank, dailyTop, saveDaily, scoreSubmission, submitSchema } from './scores';

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '32kb' }));

const limit = (max: number, minutes: number) => rateLimit({ windowMs: minutes * 60_000, max, standardHeaders: true, legacyHeaders: false });

const zodMessage = (e: z.ZodError) => e.issues[0]?.message ?? 'Invalid request';
const asyncRoute =
  (fn: (req: Request, res: Response) => Promise<unknown>) => (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);

app.get('/health', (_req, res) => res.json({ status: 'ok', day: dayKey() }));

// Anonymous player: a nickname and a country flag, no account.
app.post(
  '/api/players',
  limit(10, 60),
  asyncRoute(async (req, res) => {
    const body = z.object({ name: nameSchema, country: countrySchema }).safeParse(req.body);
    if (!body.success) return res.status(400).json({ message: zodMessage(body.error) });
    res.status(201).json(await createPlayer(body.data.name, body.data.country));
  }),
);

app.patch(
  '/api/players/me',
  limit(30, 60),
  requirePlayer,
  asyncRoute(async (req, res) => {
    const body = z.object({ name: nameSchema.optional(), country: countrySchema.optional() }).safeParse(req.body);
    if (!body.success) return res.status(400).json({ message: zodMessage(body.error) });
    res.json(await updatePlayer(req.player!.id, body.data));
  }),
);

app.post(
  '/api/daily/submit',
  limit(20, 60),
  requirePlayer,
  asyncRoute(async (req, res) => {
    const body = submitSchema.safeParse(req.body);
    if (!body.success) return res.status(400).json({ message: zodMessage(body.error) });
    if (!acceptableDay(body.data.day)) return res.status(400).json({ message: 'This daily challenge has ended' });
    let result;
    try {
      result = scoreSubmission(body.data);
    } catch (e) {
      return res.status(400).json({ message: (e as Error).message });
    }
    const saved = await saveDaily(req.player!.id, body.data.day, result);
    const rank = await dailyRank(req.player!.id, body.data.day);
    // A second submission for the same day keeps the first score.
    res.status(saved ? 201 : 200).json({ ...rank, alreadySubmitted: !saved, total: result.total });
  }),
);

const limitParam = (v: unknown) => Math.min(100, Math.max(1, Number(v) || 50));

app.get(
  '/api/daily/:day/top',
  limit(120, 1),
  optionalPlayer,
  asyncRoute(async (req, res) => {
    const day = String(req.params.day);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return res.status(400).json({ message: 'Bad day' });
    const top = await dailyTop(day, limitParam(req.query.limit));
    res.json({ day, ...top, me: req.player ? await dailyRank(req.player.id, day) : null });
  }),
);

app.get(
  '/api/alltime/top',
  limit(120, 1),
  optionalPlayer,
  asyncRoute(async (req, res) => {
    res.json({ entries: await allTimeTop(limitParam(req.query.limit)), me: req.player ? await allTimeRank(req.player.id) : null });
  }),
);

app.use((_req, res) => res.status(404).json({ message: 'Not found' }));
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

const port = Number(process.env.PORT) || 4100;
ensureSchema()
  .then(() => app.listen(port, () => console.log(`Su2al API on ${port}`)))
  .catch((e) => {
    console.error('Database setup failed', e);
    process.exit(1);
  });
