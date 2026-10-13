import Constants from 'expo-constants';

/** Leaderboard server. EXPO_PUBLIC_API_URL overrides app.json for local testing. */
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ?? 'https://su2al.abedbashir.com';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function call<T>(path: string, init: RequestInit & { token?: string } = {}): Promise<T> {
  const { token, ...rest } = init;
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body?.message ?? 'تعذّر الاتصال بالخادم');
  return body as T;
}

export type PlayerProfile = { id: string; name: string; country: string };
export type BoardEntry = { rank: number; id: string; name: string; country: string; score: number; correct?: number; games?: number };
export type MyRank = { rank: number; score: number } | null;
export type DailyAnswer = { id: string; choice: string | null; ms: number };

export const api = {
  createPlayer: (name: string, country: string) =>
    call<PlayerProfile & { token: string }>('/api/players', { method: 'POST', body: JSON.stringify({ name, country }) }),
  updatePlayer: (token: string, changes: { name?: string; country?: string }) =>
    call<PlayerProfile>('/api/players/me', { method: 'PATCH', token, body: JSON.stringify(changes) }),
  deletePlayer: (token: string) => call<{ deleted: boolean }>('/api/players/me', { method: 'DELETE', token }),
  submitDaily: (token: string, day: string, answers: DailyAnswer[]) =>
    call<{ rank: number; score: number; correct: number; alreadySubmitted: boolean }>('/api/daily/submit', {
      method: 'POST',
      token,
      body: JSON.stringify({ day, answers }),
    }),
  dailyTop: (day: string, token?: string) =>
    call<{ entries: BoardEntry[]; players: number; me: MyRank }>(`/api/daily/${day}/top?limit=50`, { token }),
  allTimeTop: (token?: string) => call<{ entries: BoardEntry[]; me: MyRank }>('/api/alltime/top?limit=50', { token }),
};
