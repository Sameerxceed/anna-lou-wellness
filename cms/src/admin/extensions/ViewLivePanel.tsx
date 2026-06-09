/**
 * ViewLivePanel — sidebar panel on every Strapi edit page that shows a
 * "View live page →" button. Tap on phone → opens the live URL the
 * entry powers in a new tab. After Anna saves + publishes, she pulls
 * to refresh that tab to see her change.
 *
 * Mapping content type UIDs to live URLs is explicit (a switch table
 * below) — that's intentional because some pages take a slug while
 * others are singletons at a fixed path. Keeping it explicit avoids
 * silently linking to the wrong URL when a new content type ships.
 *
 * Injected via `app.getPlugin('content-manager').injectComponent('editView',
 * 'right-links', ...)` in src/admin/app.tsx.
 */

import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

const PUBLIC_SITE_URL = (() => {
  if (typeof window === 'undefined') return '';
  // Heuristic: production CMS lives at cms.<domain>, the public site at <domain>.
  // Strapi staging at staging.cms.<domain> -> staging.<domain>. Fall back to
  // www if neither matches.
  const host = window.location.hostname;
  if (host.startsWith('cms.')) return `https://${host.slice(4)}`;
  if (host.startsWith('staging.cms.')) return `https://staging.${host.slice(12)}`;
  return 'https://annalouwellness.com';
})();

type EditContext = { uid: string; documentId: string; kind: 'collection-type' | 'single-type' } | null;

function parseEditContext(pathname: string): EditContext {
  // /content-manager/collection-types/api::programme.programme/abc123
  // /content-manager/single-types/api::homepage.homepage
  const m = pathname.match(/\/content-manager\/(collection-types|single-types)\/([^/]+)(?:\/([^/?#]+))?/);
  if (!m) return null;
  const kind = m[1] === 'collection-types' ? 'collection-type' : 'single-type';
  const uid = m[2];
  const documentId = m[3] || '';
  if (kind === 'collection-type' && !documentId) return null;
  return { kind, uid, documentId };
}

// Read the admin JWT from storage (same lookup the other panels use).
function getAdminToken(): string | null {
  const read = (s: Storage | undefined, k: string): string | null => {
    if (!s) return null;
    const raw = s.getItem(k);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'string') return parsed;
    } catch { /* raw */ }
    return raw;
  };
  const keys = ['jwtToken', 'strapi-jwt-token', 'jwt'];
  const session = typeof sessionStorage !== 'undefined' ? sessionStorage : undefined;
  const local = typeof localStorage !== 'undefined' ? localStorage : undefined;
  for (const k of keys) {
    return read(session, k) || read(local, k) || null;
  }
  return null;
}

async function adminFetch(path: string): Promise<unknown> {
  const token = getAdminToken();
  const res = await fetch(path, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

// Map a content type UID + optional slug → live URL on the public site.
// Returning null means we don't know how to preview this content type
// (admin-only, transactional, etc.) and the panel renders nothing.
function liveUrlFor(uid: string, slug: string): string | null {
  // ── Singletons ──
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
    'api::navigation.navigation': '/',
    'api::footer.footer': '/',
    'api::site-settings.site-settings': '/',
  };
  if (SINGLETON_URLS[uid]) return SINGLETON_URLS[uid];

  // ── Collections by slug ──
  if (!slug) return null;
  const SLUG_PATTERNS: Record<string, (s: string) => string> = {
    'api::programme.programme': (s) => `/the-work/${s}`,
    'api::experience-page.experience-page': (s) => `/experiences/${s}`,
    'api::experience.experience': (s) => `/experiences/${s}`,
    'api::page.page': (s) => `/p/${s}`,
    'api::community-event-page.community-event-page': (s) => `/community/${s}`,
    'api::generic-page.generic-page': (s) => `/${s}`,
    'api::practitioner.practitioner': () => '/practitioners',
    'api::testimonial.testimonial': () => '/testimonials',
    'api::regulated-module.regulated-module': () => '/the-work/regulated/access',
    'api::vault-journey.vault-journey': () => '/community/reset-room/vault',
    'api::workshop-replay.workshop-replay': () => '/community/reset-room/replays',
    'api::faq.faq': () => '/',
    'api::article.article': (s) => `/${s}`,
    'api::article-category.article-category': (s) => `/${s}`,
    'api::mantra.mantra': () => '/',
    'api::cosmic-forecast.cosmic-forecast': () => '/cosmic-forecast',
    'api::coaching-session.coaching-session': (s) => `/the-work/sessions/${s}`,
    'api::press-mention.press-mention': () => '/about/press',
    'api::certification.certification': () => '/about',
    'api::team-member.team-member': () => '/about',
  };
  const fn = SLUG_PATTERNS[uid];
  return fn ? fn(slug) : null;
}

const styles = {
  card: {
    background: '#fff', border: '1px solid #DCDCE4', borderRadius: 4,
    padding: '12px 14px', marginBottom: 12, fontSize: 13,
  } as React.CSSProperties,
  title: {
    fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
    textTransform: 'uppercase' as const, color: '#666687', marginBottom: 8,
  } as React.CSSProperties,
  button: {
    display: 'block', width: '100%', padding: '10px 12px', background: '#0A7A3B',
    color: '#fff', border: 0, borderRadius: 4, fontWeight: 600,
    fontSize: 12, letterSpacing: '0.04em', textAlign: 'center' as const,
    textDecoration: 'none', boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  hint: { fontSize: 11, color: '#666687', marginTop: 8, lineHeight: 1.5 } as React.CSSProperties,
  warning: { fontSize: 11, color: '#B72B1A', marginTop: 8 } as React.CSSProperties,
};

export default function ViewLivePanel() {
  const { pathname } = useLocation();
  const ctx = useMemo(() => parseEditContext(pathname), [pathname]);
  const [slug, setSlug] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    async function loadSlug() {
      if (!ctx || ctx.kind === 'single-type') return;
      try {
        const data = await adminFetch(
          `/content-manager/collection-types/${ctx.uid}/${ctx.documentId}`,
        );
        const entry = (data && (data as { data?: unknown }).data) ? (data as { data: Record<string, unknown> }).data : (data as Record<string, unknown>);
        const found = (entry?.slug as string) || '';
        if (!cancelled) setSlug(found);
      } catch {
        if (!cancelled) setSlug('');
      }
    }
    loadSlug();
    return () => { cancelled = true; };
  }, [ctx]);

  if (!ctx) return null;
  const path = liveUrlFor(ctx.uid, slug);
  if (!path) return null;
  const fullUrl = `${PUBLIC_SITE_URL}${path}`;

  return (
    <div style={styles.card}>
      <div style={styles.title}>Preview</div>
      <a href={fullUrl} target="_blank" rel="noopener" style={styles.button}>
        View live page →
      </a>
      <p style={styles.hint}>
        Opens the page in a new tab. Edit + Save here, then refresh the live tab to see the change.
      </p>
      {ctx.kind === 'collection-type' && !slug && (
        <p style={styles.warning}>
          (Loading slug… if you just created this entry, save first.)
        </p>
      )}
    </div>
  );
}
