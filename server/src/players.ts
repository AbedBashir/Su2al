import { createHash, randomBytes } from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import type { RowDataPacket } from 'mysql2';
import { z } from 'zod';

import { db } from './db';

export type Player = { id: string; name: string; country: string };

declare module 'express-serve-static-core' {
  interface Request {
    player?: Player;
  }
}

const hash = (token: string) => createHash('sha256').update(token).digest('hex');

// Names show on a public leaderboard: Arabic or Latin letters, digits, a few separators.
const BLOCKED = ['admin', 'su2al', 'سؤال', 'fuck', 'shit', 'sex', 'porn', 'كس', 'زب', 'شرموط', 'عرص', 'منيك', 'نيك', 'قحب'];
export const nameSchema = z
  .string()
  .transform((s) => s.replace(/\s+/g, ' ').trim())
  .pipe(
    z
      .string()
      .min(2, 'الاسم قصير جدًا')
      .max(20, 'الاسم طويل جدًا')
      .regex(/^[\p{Script=Arabic}A-Za-z0-9 _.\-]+$/u, 'استخدم حروفًا وأرقامًا فقط')
      .refine((s) => !BLOCKED.some((w) => s.toLowerCase().includes(w)), 'اختر اسمًا آخر'),
  );
export const countrySchema = z.string().regex(/^[A-Z]{2}$/);

/** A new anonymous player. The token is shown once and only its hash is stored. */
export async function createPlayer(name: string, country: string) {
  const id = randomBytes(12).toString('hex');
  const token = randomBytes(24).toString('base64url');
  await db.query('INSERT INTO players (id, token_hash, name, country) VALUES (?, ?, ?, ?)', [id, hash(token), name, country]);
  return { id, token, name, country };
}

export async function updatePlayer(id: string, changes: { name?: string; country?: string }) {
  if (changes.name) await db.query('UPDATE players SET name = ? WHERE id = ?', [changes.name, id]);
  if (changes.country) await db.query('UPDATE players SET country = ? WHERE id = ?', [changes.country, id]);
  const [rows] = await db.query<RowDataPacket[]>('SELECT id, name, country FROM players WHERE id = ?', [id]);
  return rows[0] as Player;
}

async function playerFromHeader(req: Request): Promise<Player | null> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  const [rows] = await db.query<RowDataPacket[]>('SELECT id, name, country FROM players WHERE token_hash = ?', [hash(header.slice(7))]);
  return (rows[0] as Player | undefined) ?? null;
}

/** Leaderboards are public; a valid token just adds "your rank". */
export async function optionalPlayer(req: Request, _res: Response, next: NextFunction) {
  try {
    req.player = (await playerFromHeader(req)) ?? undefined;
    next();
  } catch (e) {
    next(e);
  }
}

export async function requirePlayer(req: Request, res: Response, next: NextFunction) {
  try {
    const player = await playerFromHeader(req);
    if (!player) return res.status(401).json({ message: 'Unknown player' });
    req.player = player;
    next();
  } catch (e) {
    next(e);
  }
}
