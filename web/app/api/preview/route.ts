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
  // ── Singletons (fixed paths regardless of slug) ──
  const SINGLETON_URLS: Record<string, string> = {
    'api::homepage.homepage': '/',
    'api::about-page.about-page': '/about',
    'api::contact-page.contact-page': '/contact',
    'api::community-page.community-page': '/community',
    'api::membership-page.membership-page': '/community/reset-room',
    'api::reset-room-page.reset-room-page': '/community/reset-room',
    'api::testimonials-page.testimonials-page': '/testimonials',
    'api::practitioners-page.practitioners-page': '/practitioners',
    'api::reset-letters-page.reset-letters-page': '/reset-letters',
    'api::decoder-page.decoder-page': '/free/nervous-system-decoder',
    'api::decoder-quiz-page.decoder-quiz-page': '/free/nervous-system-decoder',
    'api::experiences-landing-page.experiences-landing-page': '/experiences',
    'api::sessions-hub-page.sessions-hub-page': '/the-work/sessions',
    'api::quiz-page.quiz-page': '/the-work/quiz',
    'api::reset-stories-page.reset-stories-page': '/reset-stories',
    'api::life-page.life-page': '/life',
    'api::love-and-relationships-page.love-and-relationships-page': '/love-and-relationships',
    'api::work-and-money-page.work-and-money-page': '/work-and-money',
    'api::work-with-anna-page.work-with-anna-page': '/the-work',
    'api::shop-page.shop-page': '/shop',
    'api::shop-new-in-page.shop-new-in-page': '/shop/new-in',
    'api::shop-personalised-page.shop-personalised-page': '/shop/personalised',
    'api::shop-esj-page.shop-esj-page': '/shop/esj',
    'api::welcome-page.welcome-page': '/welcome',
    'api::navigation.navigation': '/',
    'api::footer.footer': '/',
    'api::site-settings.site-settings': '/',
  };
  if (SINGLETON_URLS[uid]) return SINGLETON_URLS[uid];

  // ── Collections (use slug) ──
  switch (uid) {
    case 'api::article.article':
      return slug ? `/reset-stories/${slug}` : '/reset-stories';
    case 'api::article-category.article-category':
      return slug ? `/${slug}` : '/';
    case 'api::product.product':
      return slug ? `/shop/${slug}` : '/shop';
    case 'api::programme.programme':
      return slug ? `/the-work/${slug}` : '/the-work';
    case 'api::experience-page.experience-page':
      return slug ? `/experiences/${slug}` : '/experiences';
    case 'api::experience.experience':
      return slug ? `/experiences/${slug}` : '/experiences';
    case 'api::page.page':
      return slug ? `/p/${slug}` : '/';
    case 'api::community-event-page.community-event-page':
      return slug ? `/community/${slug}` : '/community';
    case 'api::generic-page.generic-page':
      return slug ? `/${slug.replace(/^the-work-/, 'the-work/')}` : '/';
    case 'api::practitioner.practitioner':
      return '/practitioners';
    case 'api::testimonial.testimonial':
      return '/testimonials';
    case 'api::regulated-module.regulated-module':
      return '/the-work/regulated/access';
    case 'api::vault-journey.vault-journey':
      return '/community/reset-room/vault';
    case 'api::workshop-replay.workshop-replay':
      return '/community/reset-room/replays';
    case 'api::coaching-session.coaching-session':
      return slug ? `/the-work/sessions/${slug}` : '/the-work/sessions';
    case 'api::press-mention.press-mention':
      return '/about/press';
    case 'api::certification.certification':
    case 'api::team-member.team-member':
      return '/about';
    case 'api::mantra.mantra':
      return '/';
    case 'api::cosmic-forecast.cosmic-forecast':
      return '/cosmic-forecast';
    case 'api::faq.faq':
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
