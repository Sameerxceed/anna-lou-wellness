import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

/**
 * Preview endpoint hit by Strapi's preview iframe.
 *
 * Strapi calls this with ?secret=...&uid=api::article.article&documentId=...&status=draft&slug=...
 * We verify the secret, enable Next.js draft mode (which makes data fetchers
 * include unpublished content), and redirect to the actual page URL.
 *
 * For Anna's flow: she opens an article in Strapi → clicks Preview tab → Strapi
 * loads this URL in an iframe → we redirect to /reset-stories/[slug] (or whichever
 * the matching page is) → page renders with her draft text.
 *
 * Env:
 *   PREVIEW_SECRET — shared secret with Strapi (set in Coolify on both services)
 */

export const dynamic = 'force-dynamic';

const SECRET = process.env.PREVIEW_SECRET || 'change-me-preview-secret';

function targetUrl(uid: string, slug: string): string {
  // Map Strapi UIDs to front-end URL patterns. Add more as new content types come online.
  switch (uid) {
    case 'api::homepage.homepage':
      return '/';
    case 'api::article.article':
      // Articles can live under any of the 4 editorial sections — fall back to reset-stories.
      // If you need exact section routing, store article.section in Strapi and pass it here.
      return slug ? `/reset-stories/${slug}` : '/reset-stories';
    case 'api::product.product':
      return slug ? `/shop/${slug}` : '/shop';
    case 'api::programme.programme':
      return slug ? `/the-work/${slug}` : '/the-work';
    case 'api::reset-letters-page.reset-letters-page':
      return '/reset-letters';
    case 'api::welcome-page.welcome-page':
      return '/welcome';
    case 'api::about-page.about-page':
      return '/about';
    case 'api::community-page.community-page':
      return '/community';
    case 'api::contact-page.contact-page':
      return '/contact';
    case 'api::experience-page.experience-page':
      return '/experiences';
    case 'api::decoder-page.decoder-page':
      return '/free/nervous-system-decoder';
    case 'api::reset-room-page.reset-room-page':
      return '/community/reset-room';
    case 'api::generic-page.generic-page':
      return slug ? `/${slug.replace(/^the-work-/, 'the-work/')}` : '/';
    case 'api::navigation.navigation':
    case 'api::site-settings.site-settings':
      return '/';
    default:
      return '/';
  }
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const secret = params.get('secret');
  if (secret !== SECRET) {
    return new Response('Invalid preview secret', { status: 401 });
  }

  const uid = params.get('uid') || '';
  const slug = params.get('slug') || '';
  const url = targetUrl(uid, slug);

  const draft = await draftMode();
  draft.enable();

  redirect(url);
}
