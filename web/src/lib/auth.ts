/**
 * Reset Room authentication.
 *
 * Pattern:
 * - Login posts email/password to Strapi /api/auth/local
 * - On success: server sets httpOnly cookie `rr_session` containing the Strapi JWT
 * - getSession() reads the cookie server-side and fetches /api/users/me?populate=role
 * - Returns null if not logged in, or { user, isMember } if logged in
 *
 * Middleware (web/middleware.ts) is the gate. This file is the logic.
 */

import { cookies } from 'next/headers';

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const COOKIE_NAME = 'rr_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type SessionUser = {
  id: number;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  subscriptionStatus: string | null;
  memberSince: string | null;
  accessUntil: string | null;
  podcastRssUrl: string | null;
  hasRegulatedAccess: boolean;
  regulatedAccessSince: string | null;
  role: { id: number; name: string; type: string };
};

export type Session = {
  user: SessionUser;
  isMember: boolean;             // role.type === 'reset-room-member'
  hasRegulatedAccess: boolean;   // user.hasRegulatedAccess flag (one-off REGULATED purchase)
};

/**
 * Read the session from the request cookie.
 * Returns null if no cookie, cookie invalid, or user fetch fails.
 */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${STRAPI_URL}/api/users/me?populate=role`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const user = (await res.json()) as SessionUser;
    if (!user?.id) return null;
    const isMember = user.role?.type === 'reset-room-member';
    const hasRegulatedAccess = Boolean(user.hasRegulatedAccess);
    return { user, isMember, hasRegulatedAccess };
  } catch {
    return null;
  }
}

/**
 * Log in via Strapi local auth. Throws on failure.
 * Returns the JWT — caller stores it in the session cookie.
 */
export async function loginWithStrapi(identifier: string, password: string): Promise<string> {
  const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
    cache: 'no-store',
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Login failed: ${res.status} ${txt.slice(0, 200)}`);
  }
  const data = await res.json();
  if (!data.jwt) throw new Error('No JWT in login response');
  return data.jwt as string;
}

/**
 * Send a password-reset email via Strapi.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const res = await fetch(`${STRAPI_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
    cache: 'no-store',
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Forgot password failed: ${res.status} ${txt.slice(0, 200)}`);
  }
}

export const SESSION_COOKIE = COOKIE_NAME;
export const SESSION_COOKIE_MAX_AGE = COOKIE_MAX_AGE;
