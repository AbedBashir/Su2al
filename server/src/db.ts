import mysql from 'mysql2/promise';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set');

export const db = mysql.createPool({ uri: url, connectionLimit: 5, timezone: 'Z' });

/**
 * Creates the two tables if they don't exist, so a fresh database needs no setup.
 * Only additive changes belong here.
 */
export async function ensureSchema() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS players (
      id CHAR(24) PRIMARY KEY,
      token_hash CHAR(64) NOT NULL UNIQUE,
      name VARCHAR(40) NOT NULL,
      country CHAR(2) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await db.query(`
    CREATE TABLE IF NOT EXISTS daily_scores (
      player_id CHAR(24) NOT NULL,
      day CHAR(10) NOT NULL,
      score INT NOT NULL,
      correct TINYINT NOT NULL,
      time_ms INT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (player_id, day),
      INDEX daily_rank (day, score, time_ms),
      CONSTRAINT fk_daily_player FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
}
