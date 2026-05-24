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

  // Accept either real paths starting with "/" OR the special sentinel "*"
  // which means "revalidate the entire site at the layout level" (used for
  // navigation / footer / site-settings changes that affect every page).
  const rawPaths = Array.isArray(body.paths) ? body.paths : [];
  const paths: string[] = [];
  let revalidateLayout = false;
  for (const p of rawPaths) {
    if (p === '*') {
      revalidateLayout = true;
    } else if (typeof p === 'string' && p.startsWith('/')) {
      paths.push(p);
    }
  }

  if (paths.length === 0 && !revalidateLayout) {
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

  if (revalidateLayout) {
    try {
      // Revalidate every page in the App Router at the layout level —
      // used for nav / footer / site-settings changes.
      revalidatePath('/', 'layout');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[revalidate] layout-level failed:', err);
    }
  }

  return NextResponse.json({
    revalidated: true,
    paths,
    layout: revalidateLayout,
    now: Date.now(),
  });
}
