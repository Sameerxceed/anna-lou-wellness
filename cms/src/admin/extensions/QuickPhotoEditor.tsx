/**
 * QuickPhotoEditor — admin sidebar page that lists every hero/image
 * field across the site's singletons + key collections as thumbnails
 * with a one-tap Replace button.
 *
 * Built for Anna's mobile workflow: instead of navigating CMS sidebar
 * → singleton → scroll to image field → tap → Add asset → upload
 * (~6 taps), this is: open Quick Photos → tap Replace next to the
 * thumbnail (~2 taps).
 *
 * For collections (programmes, practitioners, experiences) we fetch
 * every entry and list one row per entry. Filtered to active + listed
 * via the same admin token pattern as the other extensions.
 */

import { useEffect, useState, useCallback } from 'react';

// ─── Auth helpers (same shape as the other panels) ────────────────────────

function getAdminToken(): { token: string | null; foundAt: string } {
  const read = (s: Storage | undefined, k: string): string | null => {
    if (!s) return null;
    const raw = s.getItem(k);
    if (!raw) return null;
    try { const p = JSON.parse(raw); if (typeof p === 'string') return p; } catch { /* raw */ }
    return raw;
  };
  // Strapi versions disagree on the JWT storage key. Try every common one.
  // 'jwtToken' is the v5 default; the others are v3/v4 holdovers.
  for (const k of ['jwtToken', 'strapi-jwt-token', 'jwt', 'strapi_admin_jwt']) {
    const fromSession = read(typeof sessionStorage !== 'undefined' ? sessionStorage : undefined, k);
    if (fromSession) return { token: fromSession, foundAt: `sessionStorage["${k}"]` };
    const fromLocal = read(typeof localStorage !== 'undefined' ? localStorage : undefined, k);
    if (fromLocal) return { token: fromLocal, foundAt: `localStorage["${k}"]` };
  }
  // Last resort: surface every key so we can see what Strapi actually stores
  const sessionKeys = typeof sessionStorage !== 'undefined' ? Object.keys(sessionStorage) : [];
  const localKeys = typeof localStorage !== 'undefined' ? Object.keys(localStorage) : [];
  return { token: null, foundAt: `(no token found — session keys: [${sessionKeys.join(', ')}], local keys: [${localKeys.join(', ')}])` };
}

async function adminFetch(path: string, init?: RequestInit) {
  const { token } = getAdminToken();
  const headers: Record<string, string> = { ...(init?.headers as Record<string, string> | undefined) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(path, { ...init, headers, credentials: 'include' });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  // Some endpoints return no body
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ─── Catalogue of image fields to surface ─────────────────────────────────
// One row per (entry, field) pair. Singletons get a fixed row each.
// Collections expand to N rows at fetch time, one per entry.

type SingletonRow = {
  kind: 'single';
  uid: string;            // 'api::homepage.homepage'
  label: string;          // 'Homepage'
  fields: { name: string; label: string }[]; // {heroImage, 'Hero image'}, ...
};

type CollectionRow = {
  kind: 'collection';
  uid: string;
  label: string;
  fields: { name: string; label: string }[];
  // Optional: limit to active entries
  filterActive?: boolean;
};

type CatalogueEntry = SingletonRow | CollectionRow;

const CATALOGUE: CatalogueEntry[] = [
  { kind: 'single', uid: 'api::homepage.homepage', label: 'Homepage', fields: [
    { name: 'heroImage', label: 'Hero image (top right)' },
    { name: 'workImage', label: 'Work section image' },
    { name: 'communityImage', label: 'Community section image' },
    { name: 'portraitImage', label: 'Portrait section image' },
  ]},
  { kind: 'single', uid: 'api::about-page.about-page', label: 'About page', fields: [
    { name: 'heroImage', label: 'Hero image' },
    { name: 'portraitImage', label: 'Portrait image' },
  ]},
  { kind: 'single', uid: 'api::community-page.community-page', label: 'Community page', fields: [
    { name: 'heroImage', label: 'Hero image' },
  ]},
  { kind: 'single', uid: 'api::reset-room-page.reset-room-page', label: 'Reset Room page', fields: [
    { name: 'heroImage', label: 'Hero image' },
  ]},
  { kind: 'single', uid: 'api::testimonials-page.testimonials-page', label: 'Testimonials page', fields: [
    { name: 'heroImage', label: 'Hero image' },
  ]},
  { kind: 'single', uid: 'api::reset-letters-page.reset-letters-page', label: 'Reset Letters page', fields: [
    { name: 'heroImage', label: 'Hero image' },
  ]},
  { kind: 'single', uid: 'api::decoder-page.decoder-page', label: 'Decoder landing page', fields: [
    { name: 'coverImage', label: 'Cover image' },
  ]},
  { kind: 'single', uid: 'api::experiences-landing-page.experiences-landing-page', label: 'Experiences landing', fields: [
    { name: 'heroImage', label: 'Hero image' },
  ]},
  { kind: 'collection', uid: 'api::programme.programme', label: 'Programmes', filterActive: false, fields: [
    { name: 'heroImage', label: 'Hero image' },
  ]},
  { kind: 'collection', uid: 'api::experience.experience', label: 'Experiences (events)', filterActive: true, fields: [
    { name: 'hero_image', label: 'Hero image' },
  ]},
  { kind: 'collection', uid: 'api::experience-page.experience-page', label: 'Experience sub-pages', fields: [
    { name: 'heroImage', label: 'Hero image' },
  ]},
  { kind: 'collection', uid: 'api::practitioner.practitioner', label: 'Practitioners', filterActive: true, fields: [
    { name: 'portrait', label: 'Portrait' },
  ]},
  { kind: 'collection', uid: 'api::testimonial.testimonial', label: 'Testimonials', filterActive: true, fields: [
    { name: 'photo', label: 'Photo' },
  ]},
  { kind: 'collection', uid: 'api::page.page', label: 'Page Builder pages', fields: [
    { name: 'hero_image', label: 'Hero image (social share)' },
  ]},
];

// ─── Types for resolved rows ──────────────────────────────────────────────

type Row = {
  uid: string;
  documentId: string;
  collectionLabel: string;
  entryLabel: string;        // 'Homepage' or 'The Reset' etc.
  fieldName: string;
  fieldLabel: string;
  imageUrl: string | null;   // current thumbnail
};

// ─── Component ────────────────────────────────────────────────────────────

const styles = {
  page: { padding: 24, maxWidth: 1100, margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' } as React.CSSProperties,
  h1: { fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, fontSize: 32, margin: '8px 0 4px' } as React.CSSProperties,
  intro: { color: '#666687', fontSize: 13, marginBottom: 24, lineHeight: 1.5 } as React.CSSProperties,
  section: { marginBottom: 28 } as React.CSSProperties,
  sectionTitle: { fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#6E3A5A', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #EAEAEF' } as React.CSSProperties,
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 } as React.CSSProperties,
  card: { background: '#fff', border: '1px solid #DCDCE4', borderRadius: 6, overflow: 'hidden', display: 'flex', flexDirection: 'column' as const } as React.CSSProperties,
  thumb: { aspectRatio: '4 / 3', background: '#F6F6F9', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' as const } as React.CSSProperties,
  thumbEmpty: { display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A5A5BA', fontSize: 12, fontStyle: 'italic' } as React.CSSProperties,
  cardBody: { padding: '10px 12px 12px', flex: 1, display: 'flex', flexDirection: 'column' as const } as React.CSSProperties,
  entryName: { fontSize: 13, fontWeight: 600, color: '#32324D', marginBottom: 2 } as React.CSSProperties,
  fieldName: { fontSize: 11, color: '#666687', marginBottom: 10 } as React.CSSProperties,
  button: { width: '100%', padding: '8px 12px', background: '#6E3A5A', color: '#fff', border: 0, borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 600, marginTop: 'auto' } as React.CSSProperties,
  buttonBusy: { opacity: 0.6, cursor: 'wait' } as React.CSSProperties,
  hiddenInput: { display: 'none' } as React.CSSProperties,
  empty: { padding: 40, textAlign: 'center' as const, color: '#8C8880', fontStyle: 'italic' } as React.CSSProperties,
  spinner: { padding: 40, textAlign: 'center' as const, color: '#666687', fontSize: 13 } as React.CSSProperties,
  status: { marginTop: 6, fontSize: 11, color: '#0A7A3B' } as React.CSSProperties,
  error: { marginTop: 6, fontSize: 11, color: '#B72B1A' } as React.CSSProperties,
};

function STRAPI_MEDIA_URL(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return (typeof window !== 'undefined' ? window.location.origin : '') + url;
}

export default function QuickPhotoEditor() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<Record<string, { kind: 'ok' | 'err'; msg: string }>>({});
  const [debugErrors, setDebugErrors] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const out: Row[] = [];
    const errors: string[] = [];

    for (const entry of CATALOGUE) {
      // Build populate params for each known image field explicitly.
      // Strapi v5's content-manager admin API doesn't reliably resolve
      // 'populate=*' into nested media — has to be field-by-field.
      const populate = new URLSearchParams();
      entry.fields.forEach((f) => populate.append('populate', f.name));

      if (entry.kind === 'single') {
        try {
          const data = await adminFetch(`/content-manager/single-types/${entry.uid}?${populate.toString()}`);
          // Strapi v5 single-type admin response can be { data: {...} }, { ...entry } directly,
          // or { documentId, ...attrs } at root. Try every shape.
          const e = (((data as { data?: unknown })?.data) || data) as Record<string, unknown>;
          if (!e || typeof e !== 'object') {
            errors.push(`${entry.uid}: empty response`);
            continue;
          }
          for (const f of entry.fields) {
            // Media field may be the object directly, or wrapped in { data: {...} } in some versions.
            const raw = e[f.name] as { url?: string; data?: { url?: string } } | null | undefined;
            const mediaUrl = raw?.url || (raw?.data as { url?: string } | undefined)?.url || null;
            out.push({
              uid: entry.uid,
              documentId: (e.documentId as string) || String(e.id || ''),
              collectionLabel: entry.label,
              entryLabel: entry.label,
              fieldName: f.name,
              fieldLabel: f.label,
              imageUrl: mediaUrl ? STRAPI_MEDIA_URL(mediaUrl) : null,
            });
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          errors.push(`${entry.uid}: ${msg}`);
          // eslint-disable-next-line no-console
          console.warn(`[QuickPhotos] failed loading singleton ${entry.uid}:`, err);
        }
      } else {
        try {
          populate.set('pageSize', '60');
          if (entry.filterActive) populate.set('filters[is_active][$eq]', 'true');
          const data = await adminFetch(`/content-manager/collection-types/${entry.uid}?${populate.toString()}`);
          // Strapi v5 collection-type admin: { results: [], pagination } typically.
          // Some versions wrap as { data: { results }, meta }.
          const root = data as { results?: unknown[]; data?: { results?: unknown[] } } | null;
          const results = (root?.results || root?.data?.results || []) as Array<Record<string, unknown>>;
          if (results.length === 0) {
            errors.push(`${entry.uid}: no entries`);
          }
          for (const ent of results) {
            const entryName = (ent.title as string) || (ent.name as string) || (ent.reviewer_name as string) || (ent.documentId as string) || '(untitled)';
            for (const f of entry.fields) {
              const raw = ent[f.name] as { url?: string; data?: { url?: string } } | null | undefined;
              const mediaUrl = raw?.url || (raw?.data as { url?: string } | undefined)?.url || null;
              out.push({
                uid: entry.uid,
                documentId: (ent.documentId as string) || String(ent.id || ''),
                collectionLabel: entry.label,
                entryLabel: entryName,
                fieldName: f.name,
                fieldLabel: f.label,
                imageUrl: mediaUrl ? STRAPI_MEDIA_URL(mediaUrl) : null,
              });
            }
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          errors.push(`${entry.uid}: ${msg}`);
          // eslint-disable-next-line no-console
          console.warn(`[QuickPhotos] failed loading collection ${entry.uid}:`, err);
        }
      }
    }

    if (errors.length) {
      // eslint-disable-next-line no-console
      console.warn('[QuickPhotos] errors during load:', errors);
    }
    setDebugErrors(errors);
    setRows(out);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const rowKey = (r: Row) => `${r.uid}::${r.documentId}::${r.fieldName}`;

  const onReplace = useCallback(async (row: Row, file: File) => {
    const key = rowKey(row);
    setBusy((s) => new Set(s).add(key));
    setStatus((s) => ({ ...s, [key]: { kind: 'ok', msg: 'Uploading…' } }));
    try {
      // 1. Upload the file to Strapi's media library
      const form = new FormData();
      form.append('files', file, file.name);
      // ref + refId + field tells Strapi to attach the new upload directly
      // to the target entry's field in one round-trip (no separate update).
      form.append('ref', row.uid);
      form.append('refId', row.documentId);
      form.append('field', row.fieldName);
      const { token } = getAdminToken();
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
        body: form,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`${res.status}: ${text.slice(0, 200)}`);
      }
      const uploaded = await res.json();
      const newUrl = Array.isArray(uploaded) && uploaded[0]?.url ? STRAPI_MEDIA_URL(uploaded[0].url) : row.imageUrl;
      setRows((rs) => rs.map((r) => rowKey(r) === key ? { ...r, imageUrl: newUrl } : r));
      setStatus((s) => ({ ...s, [key]: { kind: 'ok', msg: 'Updated. Publish the entry to push live.' } }));
    } catch (err) {
      setStatus((s) => ({ ...s, [key]: { kind: 'err', msg: err instanceof Error ? err.message : String(err) } }));
    } finally {
      setBusy((s) => { const n = new Set(s); n.delete(key); return n; });
    }
  }, []);

  // Group rows by collection label for display
  const byGroup = rows.reduce((acc, r) => {
    if (!acc[r.collectionLabel]) acc[r.collectionLabel] = [];
    acc[r.collectionLabel].push(r);
    return acc;
  }, {} as Record<string, Row[]>);

  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>Quick Photo Editor</h1>
      <p style={styles.intro}>
        Every hero / portrait image across your site, in one place. Tap <strong>Replace</strong> to swap a photo without navigating to the entry. After uploading, open the entry in the normal CMS and tap <strong>Publish</strong> to push the change live.
      </p>

      {loading && <div style={styles.spinner}>Loading photos…</div>}
      {!loading && rows.length === 0 && (
        <div style={styles.empty}>
          <p style={{ marginBottom: 16, fontStyle: 'normal', color: '#32324D' }}>
            <strong>Coming soon.</strong>
          </p>
          <p style={{ fontSize: 13, color: '#666687', fontStyle: 'normal', maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
            This page is being rebuilt to work with Strapi 5&rsquo;s authentication system. For now, replace photos the normal way:
          </p>
          <ol style={{ textAlign: 'left', maxWidth: 480, margin: '16px auto', fontSize: 13, color: '#666687', fontStyle: 'normal', lineHeight: 1.7 }}>
            <li>Open the page you want (Homepage, a programme, a practitioner, etc.) from the sidebar</li>
            <li>Tap directly on the existing image thumbnail (not the field label)</li>
            <li>Tap <strong>Replace media</strong> in the modal that opens</li>
            <li>Pick the new photo, then tap <strong>Publish</strong></li>
          </ol>
        </div>
      )}

      {Object.entries(byGroup).map(([group, items]) => (
        <section key={group} style={styles.section}>
          <div style={styles.sectionTitle}>{group}</div>
          <div style={styles.grid}>
            {items.map((row) => {
              const key = rowKey(row);
              const isBusy = busy.has(key);
              const inputId = `qp-${key.replace(/[^a-z0-9]/gi, '_')}`;
              return (
                <div key={key} style={styles.card}>
                  <div
                    style={{
                      ...styles.thumb,
                      backgroundImage: row.imageUrl ? `url('${row.imageUrl}')` : undefined,
                      ...(row.imageUrl ? {} : styles.thumbEmpty),
                    }}
                  >
                    {!row.imageUrl && 'No image set'}
                  </div>
                  <div style={styles.cardBody}>
                    <div style={styles.entryName}>{row.entryLabel}</div>
                    <div style={styles.fieldName}>{row.fieldLabel}</div>
                    <input
                      id={inputId}
                      type="file"
                      accept="image/*"
                      style={styles.hiddenInput}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onReplace(row, f);
                        e.target.value = '';
                      }}
                    />
                    <label htmlFor={inputId} style={{ ...styles.button, ...(isBusy ? styles.buttonBusy : {}) } as React.CSSProperties}>
                      {isBusy ? 'Uploading…' : row.imageUrl ? 'Replace' : 'Upload'}
                    </label>
                    {status[key] && (
                      <div style={status[key].kind === 'ok' ? styles.status : styles.error}>
                        {status[key].msg}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
