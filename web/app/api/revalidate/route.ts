/**
 * Revalidate API — busts Next.js ISR cache for specific paths on demand.
 *
 * Called by Strapi lifecycle hooks whenever a content type changes
 * (article saved, experience updated, product deleted, etc.) so the
 * public-facing page reflects the change within seconds instead of
 * waiting for ISR to expire on its own.
 *
 * Security: requires a shared secret matching REVALIDATE_SECRET env var.
 * Without the secret, the endpoint returns 401 — no auth bypass.
 *
 * Usage:
 *   POST /api/revalidate
 *   Headers: Content-Type: application/json
 *   Body: {
 *     "paths": ["/reset-stories/my-slug", "/reset-stories"],
 *     "tags":  ["strapi:/articles"],   // optional, revalidateTag
 *     "secret": "..."
 *   }
 *   Returns: { revalidated: true, paths, tags, layout, now }
 *
 * Why both paths AND tags: revalidatePath invalidates the rendered page
 * cache but Next.js keeps fetch() results in a SEPARATE data cache keyed
 * by URL. Without tags, the page re-renders after invalidation but pulls
 * stale Strapi data from the 24h-TTL data cache. revalidateTag targets
 * the data cache directly so fresh CMS data lands immediately. Anna 30
 * Oct 2026 — reset-room-page edits showed in API but not HTML until next
 * deploy; this is the fix.
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const expectedSecret = process.env.REVALIDATE_SECRET;
  if (!expectedSecret) {
    return NextResponse.json(
      { error: 'REVALIDATE_SECRET not configured on the server' },
      { status: 500 },
    );
  }

  let body: { paths?: unknown; tags?: unknown; secret?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (body.secret !== expectedSecret) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  // Accept either real paths starting with "/" OR the special sentinel "*"
  // which means "revalidate the entire site at the layout level".
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

  // Tags target the Data Cache (fetch results) which revalidatePath does
  // NOT invalidate. Required to bust stale Strapi fetch data.
  const rawTags = Array.isArray(body.tags) ? body.tags : [];
  const tags: string[] = rawTags.filter((t): t is string => typeof t === 'string' && t.length > 0);

  if (paths.length === 0 && !revalidateLayout && tags.length === 0) {
    return NextResponse.json({ error: 'No valid paths or tags provided' }, { status: 400 });
  }

  for (const path of paths) {
    try {
      revalidatePath(path);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`[revalidate] path ${path} failed:`, err);
    }
  }

  for (const tag of tags) {
    try {
      revalidateTag(tag);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`[revalidate] tag ${tag} failed:`, err);
    }
  }

  if (revalidateLayout) {
    try {
      revalidatePath('/', 'layout');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[revalidate] layout-level failed:', err);
    }
  }

  return NextResponse.json({
    revalidated: true,
    paths,
    tags,
    layout: revalidateLayout,
    now: Date.now(),
  });
}
