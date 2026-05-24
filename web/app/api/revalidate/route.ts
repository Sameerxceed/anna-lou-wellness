/**
 * Revalidate API — busts Next.js ISR cache for specific paths on demand.
 *
 * Called by Strapi lifecycle hooks whenever a content type changes
 * (article saved, experience updated, product deleted, etc.) so the
 * public-facing page reflects the change within seconds instead of
 * waiting up to 1 hour for ISR to expire on its own.
 *
 * Security: requires a shared secret matching REVALIDATE_SECRET env var.
 * Without the secret, the endpoint returns 401 — no auth bypass.
 *
 * Usage:
 *   POST /api/revalidate
 *   Headers: Content-Type: application/json
 *   Body: { "paths": ["/reset-stories/my-slug", "/reset-stories"], "secret": "..." }
 *   Returns: { revalidated: true, paths: [...], now: timestamp }
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const expectedSecret = process.env.REVALIDATE_SECRET;
  if (!expectedSecret) {
    return NextResponse.json(
      { error: 'REVALIDATE_SECRET not configured on the server' },
      { status: 500 },
    );
  }

  let body: { paths?: unknown; secret?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (body.secret !== expectedSecret) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  const paths = Array.isArray(body.paths)
    ? body.paths.filter((p): p is string => typeof p === 'string' && p.startsWith('/'))
    : [];

  if (paths.length === 0) {
    return NextResponse.json({ error: 'No valid paths provided' }, { status: 400 });
  }

  for (const path of paths) {
    try {
      revalidatePath(path);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`[revalidate] failed for ${path}:`, err);
    }
  }

  return NextResponse.json({
    revalidated: true,
    paths,
    now: Date.now(),
  });
}
