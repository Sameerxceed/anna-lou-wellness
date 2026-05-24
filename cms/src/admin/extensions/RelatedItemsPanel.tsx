/**
 * RelatedItemsPanel — sidebar panel shown on Strapi edit pages that lists
 * every related item editable on the same public page.
 *
 * Why this exists: the Quick Edit dashboard cards have an expandable "Show
 * contents" tree, but for pages with lots of items (Experiences with 15+
 * items, Shop with every product) the tree is too long to fit on a card.
 * Anna asked us to surface the same tree INSIDE the edit page, where the
 * right sidebar has room.
 *
 * Injected via `app.getPlugin('content-manager').injectComponent('editView',
 * 'right-links', ...)` in src/admin/app.tsx. The component reads the current
 * URL, derives the UID, and renders the matching group of related items —
 * invisible on edit pages that have no related-items config.
 */

import { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

type ChildItem = {
  id: string | number;
  label: string;
  to: string;
  groupHeader?: boolean;
};

type LoadChildren = () => Promise<ChildItem[]>;

// ─── Auth + fetch ─────────────────────────────────────────────────────────
// Read the admin JWT from storage. Strapi versions disagree on:
//   1. Which key it lives under (jwtToken, strapi-jwt-token, jwt, ...)
//   2. Whether it's JSON-encoded ("eyJ...") or stored raw (eyJ...)
// We try every common key in both storages, and handle both encodings.
// One log line on first lookup so DevTools tells us what we found.
let loggedAuthDiscovery = false;
const getAdminToken = (): string | null => {
  const candidateKeys = ['jwtToken', 'strapi-jwt-token', 'jwt'];
  const readKey = (storage: Storage | undefined, key: string): string | null => {
    if (!storage) return null;
    const raw = storage.getItem(key);
    if (!raw) return null;
    // Some versions store JSON-wrapped ('"eyJ..."'), others raw ('eyJ...').
    // Try JSON.parse; if it gives a string, use that. Otherwise use raw.
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'string') return parsed;
    } catch { /* not JSON-encoded, fall through to raw */ }
    return raw;
  };
  const session = typeof sessionStorage !== 'undefined' ? sessionStorage : undefined;
  const local = typeof localStorage !== 'undefined' ? localStorage : undefined;
  for (const key of candidateKeys) {
    const fromSession = readKey(session, key);
    if (fromSession) {
      if (!loggedAuthDiscovery) {
        loggedAuthDiscovery = true;
        // eslint-disable-next-line no-console
        console.info(`[RelatedItems] admin token found in sessionStorage["${key}"]`);
      }
      return fromSession;
    }
    const fromLocal = readKey(local, key);
    if (fromLocal) {
      if (!loggedAuthDiscovery) {
        loggedAuthDiscovery = true;
        // eslint-disable-next-line no-console
        console.info(`[RelatedItems] admin token found in localStorage["${key}"]`);
      }
      return fromLocal;
    }
  }
  if (!loggedAuthDiscovery) {
    loggedAuthDiscovery = true;
    // eslint-disable-next-line no-console
    console.warn('[RelatedItems] no admin token found in storage — relying on credentials cookie', {
      sessionKeys: session ? Object.keys(session) : [],
      localKeys: local ? Object.keys(local) : [],
    });
  }
  return null;
};

const adminFetch = async (path: string) => {
  const token = getAdminToken();
  const res = await fetch(path, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: 'include',
  });
  if (!res.ok) {
    // eslint-disable-next-line no-console
    console.error(`[RelatedItems] fetch ${path} → ${res.status} ${res.statusText}`);
    throw new Error(`${res.status} ${res.statusText} (${path})`);
  }
  return res.json();
};

// Normalise the response shape across Strapi versions. The Content Manager
// admin API has been seen returning either { results, pagination } directly
// or { data: { results, pagination } } depending on version/plugin config.
// This helper tries both shapes so loaders don't silently return empty when
// the shape moves around.
const extractResults = (data: unknown): Array<Record<string, unknown>> => {
  const root = data as { results?: unknown[]; data?: { results?: unknown[] } } | null;
  if (Array.isArray(root?.results)) return root!.results as Array<Record<string, unknown>>;
  if (Array.isArray(root?.data?.results)) return root!.data!.results as Array<Record<string, unknown>>;
  if (Array.isArray(data)) return data as Array<Record<string, unknown>>;
  // eslint-disable-next-line no-console
  console.warn('[RelatedItems] unexpected response shape:', data);
  return [];
};

// ─── Loader factories ──────────────────────────────────────────────────────
// Build URLs by raw template concat, NOT URLSearchParams. URLSearchParams
// encodes `:` → `%3A` and `[` → `%5B`, which Strapi v5's admin parser does
// NOT decode for sort/filter operators — returns 0 items silently.

const NAVIGATION_EDIT_URL = '/content-manager/single-types/api::navigation.navigation';

let navCache: Promise<Array<{ href?: string; children?: Array<{ label?: string; href?: string }> }>> | null = null;
const getNavItems = () => {
  if (!navCache) {
    navCache = (async () => {
      try {
        const data = await adminFetch(NAVIGATION_EDIT_URL);
        // Try both Strapi shapes: { items } directly on the document, or
        // { data: { items } } when wrapped.
        const root = data as { items?: unknown[]; data?: { items?: unknown[] } } | null;
        const items = (root?.items as unknown[]) || (root?.data?.items as unknown[]) || [];
        return items as Array<{ href?: string; children?: Array<{ label?: string; href?: string }> }>;
      } catch (err) {
        navCache = null;
        throw err;
      }
    })();
  }
  return navCache;
};

const navChildrenByHref = (href: string): LoadChildren => async () => {
  const items = await getNavItems();
  const item = items.find((i) => i.href === href);
  const children = Array.isArray(item?.children) ? item!.children! : [];
  return children.map((c, idx): ChildItem => ({
    id: `${href}-${idx}-${c.label || idx}`,
    label: c.label || '(unlabelled link)',
    to: NAVIGATION_EDIT_URL,
  }));
};

const collectionItems = (
  uid: string,
  options: { sort?: string; nameField?: string; prefixDate?: boolean; pageSize?: number } = {},
): LoadChildren => async () => {
  const { sort, nameField = 'name', prefixDate, pageSize = 50 } = options;
  let url = `/content-manager/collection-types/${uid}?page=1&pageSize=${pageSize}`;
  if (sort) url += `&sort=${sort}`;
  const data = await adminFetch(url);
  const results = extractResults(data);
  return results.map((r): ChildItem => {
    const documentId = (r.documentId as string) || (r.id as string | number);
    const baseLabel = (r[nameField] as string) || (r.title as string) || (r.name as string) || (r.slug as string) || '(untitled)';
    let label = baseLabel;
    if (prefixDate && typeof r.date === 'string' && r.date) {
      try {
        const [y, m, d] = r.date.split('-').map(Number);
        const fmt = new Date(Date.UTC(y, (m || 1) - 1, d || 1)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        label = `${fmt} · ${baseLabel}`;
      } catch { /* keep raw label */ }
    }
    return {
      id: `${uid}-${documentId}`,
      label,
      to: `/content-manager/collection-types/${uid}/${documentId}`,
    };
  });
};

const categoriesInSection = (sectionSlug: string): LoadChildren => async () => {
  const url = `/content-manager/collection-types/api::article-category.article-category?page=1&pageSize=50&sort=sort_order:ASC,name:ASC&filters[section][$eq]=${encodeURIComponent(sectionSlug)}`;
  const data = await adminFetch(url);
  const results = extractResults(data);
  return results.map((c): ChildItem => ({
    id: (c.documentId as string) || String(c.id),
    label: (c.name as string) || '(untitled)',
    to: `/content-manager/collection-types/api::article-category.article-category/${(c.documentId as string) || String(c.id)}`,
  }));
};

const articlesInSection = (sectionSlug: string, limit = 10): LoadChildren => async () => {
  const url = `/content-manager/collection-types/api::article.article?page=1&pageSize=${limit}&sort=publishedAt:DESC&filters[category][section][$eq]=${encodeURIComponent(sectionSlug)}`;
  const data = await adminFetch(url);
  const results = extractResults(data);
  return results.map((a): ChildItem => ({
    id: (a.documentId as string) || String(a.id),
    label: (a.title as string) || '(untitled article)',
    to: `/content-manager/collection-types/api::article.article/${(a.documentId as string) || String(a.id)}`,
  }));
};

const productsWithTag = (tag: string): LoadChildren => async () => {
  const url = `/content-manager/collection-types/api::product.product?page=1&pageSize=50&sort=sort_order:ASC,name:ASC&filters[tags][$contains]=${encodeURIComponent(tag)}`;
  const data = await adminFetch(url);
  const results = extractResults(data);
  return results.map((p): ChildItem => ({
    id: (p.documentId as string) || String(p.id),
    label: (p.name as string) || '(untitled)',
    to: `/content-manager/collection-types/api::product.product/${(p.documentId as string) || String(p.id)}`,
  }));
};

const genericPagesWithPrefix = (prefix: string): LoadChildren => async () => {
  const url = `/content-manager/collection-types/api::generic-page.generic-page?page=1&pageSize=50&sort=slug:ASC&filters[slug][$startsWith]=${encodeURIComponent(prefix)}`;
  const data = await adminFetch(url);
  const results = extractResults(data);
  return results.map((p): ChildItem => ({
    id: (p.documentId as string) || String(p.id),
    label: (p.title as string) || (p.slug as string) || '(untitled)',
    to: `/content-manager/collection-types/api::generic-page.generic-page/${(p.documentId as string) || String(p.id)}`,
  }));
};

// ─── Per-UID groups map ────────────────────────────────────────────────────
// Keyed by the UID that appears in the edit-page URL. The panel only renders
// for UIDs in this map — every other edit page is unaffected.
type Group = { header: string; load: LoadChildren };
const PAGE_GROUPS: Record<string, { accent: string; groups: Group[] }> = {
  'api::experiences-landing-page.experiences-landing-page': {
    accent: '#7BAFDD',
    groups: [
      { header: 'Sub-menu items (live nav dropdown)', load: navChildrenByHref('/experiences') },
      { header: 'Sub-pages (own copy)', load: collectionItems('api::experience-page.experience-page', { sort: 'title:ASC', nameField: 'title' }) },
      { header: 'Upcoming events', load: collectionItems('api::experience.experience', { sort: 'date:ASC', nameField: 'name', prefixDate: true }) },
    ],
  },
  'api::work-with-anna-page.work-with-anna-page': {
    accent: '#F280AA',
    groups: [
      { header: 'Sub-menu items (live nav dropdown)', load: navChildrenByHref('/the-work') },
      { header: '1:1 sessions', load: collectionItems('api::coaching-session.coaching-session', { sort: 'sort_order:ASC', nameField: 'title' }) },
      { header: 'Programmes', load: collectionItems('api::programme.programme', { sort: 'sort_order:ASC', nameField: 'title' }) },
      { header: 'FAQs', load: collectionItems('api::faq.faq', { sort: 'sort_order:ASC', nameField: 'question' }) },
    ],
  },
  'api::sessions-hub-page.sessions-hub-page': {
    accent: '#F280AA',
    groups: [
      { header: 'Session cards on this page', load: collectionItems('api::coaching-session.coaching-session', { sort: 'sort_order:ASC', nameField: 'title' }) },
    ],
  },
  'api::shop-page.shop-page': {
    accent: '#5DCAA5',
    groups: [
      { header: 'Sub-menu items (live nav dropdown)', load: navChildrenByHref('/shop') },
      { header: 'Sub-pages (own copy)', load: async () => [
        { id: 'shop-new-in', label: 'New In', to: '/content-manager/single-types/api::shop-new-in-page.shop-new-in-page' },
        { id: 'shop-personalised', label: 'Personalised', to: '/content-manager/single-types/api::shop-personalised-page.shop-personalised-page' },
        { id: 'shop-esj', label: 'Emotional Support Jewellery', to: '/content-manager/single-types/api::shop-esj-page.shop-esj-page' },
      ] },
      { header: 'Product categories', load: collectionItems('api::product-category.product-category', { sort: 'sort_order:ASC', nameField: 'name' }) },
      { header: 'Products', load: collectionItems('api::product.product', { sort: 'sort_order:ASC', nameField: 'name', pageSize: 100 }) },
    ],
  },
  'api::shop-new-in-page.shop-new-in-page': {
    accent: '#5DCAA5',
    groups: [{ header: 'Products tagged new-in', load: productsWithTag('new-in') }],
  },
  'api::shop-personalised-page.shop-personalised-page': {
    accent: '#5DCAA5',
    groups: [{ header: 'Products tagged personalised', load: productsWithTag('personalised') }],
  },
  'api::shop-esj-page.shop-esj-page': {
    accent: '#5DCAA5',
    groups: [{ header: 'Products tagged esj', load: productsWithTag('esj') }],
  },
  'api::community-page.community-page': {
    accent: '#231F20',
    groups: [
      { header: 'Sub-menu items (live nav dropdown)', load: navChildrenByHref('/community') },
      { header: 'Sub-pages (own copy)', load: async () => [
        { id: 'community-returning-circle', label: 'The Returning Circle', to: '/content-manager/collection-types/api::community-event-page.community-event-page' },
        { id: 'community-reset-room', label: 'The Reset Room (membership)', to: '/content-manager/single-types/api::reset-room-page.reset-room-page' },
        { id: 'community-membership', label: 'Reset Room — pricing & details', to: '/content-manager/single-types/api::membership.membership' },
      ] },
    ],
  },
  'api::about-page.about-page': {
    accent: '#231F20',
    groups: [
      { header: 'Sub-menu items (live nav dropdown)', load: navChildrenByHref('/about') },
      { header: 'Sub-pages (own copy)', load: genericPagesWithPrefix('about-') },
      { header: 'Team members', load: collectionItems('api::team-member.team-member', { sort: 'sort_order:ASC', nameField: 'name' }) },
    ],
  },
  'api::reset-stories-page.reset-stories-page': {
    accent: '#6E3A5A',
    groups: [
      { header: 'Sub-menu items', load: categoriesInSection('reset-stories') },
      { header: 'Recent articles', load: articlesInSection('reset-stories') },
    ],
  },
  'api::life-page.life-page': {
    accent: '#FAA21B',
    groups: [
      { header: 'Sub-menu items', load: categoriesInSection('life') },
      { header: 'Recent articles', load: articlesInSection('life') },
    ],
  },
  'api::love-and-relationships-page.love-and-relationships-page': {
    accent: '#F280AA',
    groups: [
      { header: 'Sub-menu items', load: categoriesInSection('love-and-relationships') },
      { header: 'Recent articles', load: articlesInSection('love-and-relationships') },
    ],
  },
  'api::work-and-money-page.work-and-money-page': {
    accent: '#FFD07A',
    groups: [
      { header: 'Sub-menu items', load: categoriesInSection('work-and-money') },
      { header: 'Recent articles', load: articlesInSection('work-and-money') },
    ],
  },
};

// ─── UID extraction from URL ──────────────────────────────────────────────
// URLs look like:
//   /content-manager/single-types/api::experiences-landing-page.experiences-landing-page
//   /content-manager/collection-types/api::experience.experience/abc123def
const extractUid = (pathname: string): string | null => {
  const m = pathname.match(/\/content-manager\/(?:single-types|collection-types)\/([^/?#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
};

// ─── The component ─────────────────────────────────────────────────────────
const RelatedItemsPanel = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const uid = useMemo(() => extractUid(location.pathname), [location.pathname]);
  const config = uid ? PAGE_GROUPS[uid] : null;

  const [items, setItems] = useState<ChildItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!config) {
      setItems(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const out: ChildItem[] = [];
      for (let i = 0; i < config.groups.length; i++) {
        const g = config.groups[i];
        let groupItems: ChildItem[] = [];
        try {
          groupItems = await g.load();
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(`[RelatedItems] loader failed for "${g.header}":`, err);
        }
        out.push({ id: `hdr-${i}`, label: g.header, to: '', groupHeader: true });
        out.push(...groupItems);
      }
      if (!cancelled) {
        setItems(out);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [config]);

  if (!config) return null;

  const accent = config.accent;

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #eaeaef',
        borderLeft: `4px solid ${accent}`,
        borderRadius: 6,
        padding: '14px 16px',
        marginTop: 12,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, color: '#32324d', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 8 }}>
        Everything on this page
      </div>
      <div style={{ fontSize: 11, color: '#666687', marginBottom: 10, lineHeight: 1.45 }}>
        Click any item to jump straight to its edit form.
      </div>

      {loading && <div style={{ fontSize: 12, color: '#666687' }}>Loading…</div>}
      {error && <div style={{ fontSize: 12, color: '#d02b20' }}>{error}</div>}

      {items && items.map((c) => {
        if (c.groupHeader) {
          return (
            <div
              key={c.id}
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: accent,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                padding: '10px 0 4px',
              }}
            >
              {c.label}
            </div>
          );
        }
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => navigate(c.to)}
            style={{
              cursor: 'pointer',
              textAlign: 'left',
              padding: '5px 6px',
              borderRadius: 4,
              border: 'none',
              background: 'transparent',
              color: '#32324d',
              fontSize: 12,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              width: '100%',
              transition: 'background 0.1s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `${accent}11`; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ color: accent }}>•</span>
            <span style={{ flex: 1 }}>{c.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default RelatedItemsPanel;
