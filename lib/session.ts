import { D1Database } from '@cloudflare/workers-types';

export interface Session {
  id: string;
  user_id: number;
  expires_at: number;
}

export interface SessionEnv {
  DB: D1Database;
}

export async function createSession(env: SessionEnv, userId: number): Promise<Session> {
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now
  const id = crypto.randomUUID();

  await env.DB
    .prepare(`
      INSERT INTO sessions (id, user_id, expires_at)
      VALUES (?, ?, ?)
    `)
    .bind(id, userId, expiresAt)
    .run();

  return {
    id,
    user_id: userId,
    expires_at: expiresAt
  };
}

export async function getSession(env: SessionEnv, sessionId: string): Promise<Session | null> {
  const session = await env.DB
    .prepare('SELECT * FROM sessions WHERE id = ? AND expires_at > ?')
    .bind(sessionId, Date.now())
    .first<Session>();

  return session;
}

export async function deleteSession(env: SessionEnv, sessionId: string): Promise<void> {
  await env.DB
    .prepare('DELETE FROM sessions WHERE id = ?')
    .bind(sessionId)
    .run();
}

export function getSessionIdFromRequest(request: Request): string | null {
  // Try to get session from Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ') && authHeader.length > 7) {
    const token = authHeader.slice(7); // Remove 'Bearer ' prefix
    if (token && token !== 'undefined') {
      return token;
    }
  }

  // Try to get session from cookie
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
    for (const cookie of cookies) {
      const [name, value] = cookie.split('=').map(part => part.trim());
      if (name === 'session' && value && value !== 'undefined') {
        return decodeURIComponent(value);
      }
    }
  }
  return null;
}

export async function validateSession(env: SessionEnv, request: Request): Promise<number | null> {
  const sessionId = getSessionIdFromRequest(request);
  if (!sessionId) {
    return null;
  }

  const session = await getSession(env, sessionId);
  return session?.user_id ?? null;
}
