import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * POST /api/account/profile
 *
 * Updates the signed-in user's basic profile (firstName, lastName, phone).
 * Used by the edit form on /account/details. Writes via the admin API
 * token because self-update on users-permissions is finicky and we do
 * not want to broaden write permissions on arbitrary fields.
 *
 * Body: { firstName?: string, lastName?: string, phone?: string }
 * Returns: { ok: true, user: { firstName, lastName, phone } }
 */

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const COOKIE_NAME = 'rr_session';

type Body = {
  firstName?: string;
  lastName?: string;
  phone?: string;
};

export async function POST(req: NextRequest) {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : '';
  const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  if (!firstName && !lastName && !phone) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
  }

  const meRes = await fetch(`${STRAPI_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!meRes.ok) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  }
  const me = (await meRes.json()) as { id: number } | null;
  if (!me?.id) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  }

  const adminToken = process.env.STRAPI_ADMIN_API_TOKEN;
  if (!adminToken) {
    return NextResponse.json(
      { error: 'Server misconfigured (missing admin token).' },
      { status: 500 },
    );
  }

  // Only PUT the fields the client actually sent (allow blanking phone
  // but don't wipe name if the client omitted it).
  const updateBody: Record<string, unknown> = {};
  if (typeof body.firstName === 'string') updateBody.firstName = firstName || null;
  if (typeof body.lastName === 'string') updateBody.lastName = lastName || null;
  if (typeof body.phone === 'string') updateBody.phone = phone || null;

  const putRes = await fetch(`${STRAPI_URL}/api/users/${me.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify(updateBody),
    cache: 'no-store',
  });
  if (!putRes.ok) {
    const txt = await putRes.text();
    return NextResponse.json(
      { error: `Failed to save profile (${putRes.status}). ${txt.slice(0, 200)}` },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    user: {
      firstName: firstName || null,
      lastName: lastName || null,
      phone: phone || null,
    },
  });
}
