import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * POST /api/account/default-address
 *
 * Saves the logged-in user's default shipping address to their Strapi
 * user record (default_address JSON field). Also updates the phone
 * string if the client sends one. Called from /account/addresses.
 *
 * Body: { line1, line2?, city, county?, postcode, country, phone? }
 * The country is a 2-letter code (GB, US, IN, etc.).
 *
 * Returns { ok: true, defaultAddress } on success, { error } on failure.
 */

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const COOKIE_NAME = 'rr_session';

type SaveBody = {
  first_name?: string;
  last_name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;
  phone?: string;
};

export async function POST(req: NextRequest) {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  let body: SaveBody;
  try {
    body = (await req.json()) as SaveBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const line1 = String(body.line1 || '').trim();
  const city = String(body.city || '').trim();
  const postcode = String(body.postcode || '').trim();
  const country = String(body.country || '').trim().toUpperCase();
  if (!line1 || !city || !postcode || !country) {
    return NextResponse.json(
      { error: 'Line 1, city, postcode and country are required.' },
      { status: 400 },
    );
  }

  const firstName = String(body.first_name || '').trim();
  const lastName = String(body.last_name || '').trim();
  const defaultAddress = {
    first_name: firstName || undefined,
    last_name: lastName || undefined,
    line1,
    line2: String(body.line2 || '').trim() || undefined,
    city,
    county: String(body.county || '').trim() || undefined,
    postcode,
    country,
  };

  // Look up the current user via /users/me so we have their id for the
  // PUT below. Strapi's users-permissions plugin does not allow PUT to
  // /users/me — we need the admin path or /users/:id with the user's
  // own token (permitted for self-update if the role allows).
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

  // Use the ADMIN API token so we can write default_address on the user
  // record regardless of users-permissions role settings (the plugin's
  // self-update flow is finicky and we don't want to open up write on
  // arbitrary fields).
  const adminToken = process.env.STRAPI_ADMIN_API_TOKEN;
  if (!adminToken) {
    return NextResponse.json(
      { error: 'Server misconfigured (missing admin token).' },
      { status: 500 },
    );
  }

  // Also mirror the customer name onto the user record itself so the
  // sidebar greeting + /account/details show something friendlier than
  // the shop-signup auto-username. Only overwrite if the user has not
  // set a name yet — don't silently trample their profile.
  const updateBody: Record<string, unknown> = { default_address: defaultAddress };
  if (typeof body.phone === 'string') {
    updateBody.phone = body.phone.trim() || null;
  }
  const meFull = await fetch(`${STRAPI_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  }).then((r) => r.ok ? r.json() : null).catch(() => null) as { firstName?: string; lastName?: string } | null;
  if (firstName && !meFull?.firstName) updateBody.firstName = firstName;
  if (lastName && !meFull?.lastName) updateBody.lastName = lastName;

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
      { error: `Failed to save address (${putRes.status}). ${txt.slice(0, 200)}` },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, defaultAddress });
}
