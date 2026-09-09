/**
 * AutoSeoStatusPanel — replaces the old GenerateSeoPanel button.
 *
 * The old button POSTed to /api/seo-generator/generate which is admin-only.
 * Strapi v5 moved the admin JWT into an httpOnly cookie so the button
 * couldn't authenticate (401). Same bug class as QuickPhotoEditor.
 *
 * The auto-SEO lifecycle hook (cms/src/utils/auto-seo.js) makes the button
 * unnecessary anyway — SEO fields fill automatically on Save. This panel
 * just tells Anna that's happening and gives her a one-click way to refresh
 * the page once the background fill completes (~5–10 sec after Save).
 *
 * Injected via app.getPlugin('content-manager').injectComponent('editView',
 * 'right-links', ...) in src/admin/app.tsx.
 */

import { useState, useEffect } from 'react';

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: 4,
    padding: '14px 16px',
    margin: '8px 0',
    fontFamily: 'system-ui, sans-serif',
  },
  label: {
    fontFamily: "'Josefin Sans', sans-serif",
    fontSize: 11,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: '#c4704a',
    margin: '0 0 8px',
    fontWeight: 600,
  },
  blurb: {
    fontSize: 13,
    color: '#3D3D3A',
    lineHeight: 1.55,
    margin: '0 0 12px',
  },
  smallNote: {
    fontSize: 11,
    color: '#8C8880',
    lineHeight: 1.5,
    margin: '8px 0 0',
    fontStyle: 'italic',
  },
  button: {
    width: '100%',
    padding: '10px 14px',
    background: '#6E3A5A',
    color: '#fff',
    border: 'none',
    borderRadius: 3,
    fontFamily: "'Josefin Sans', sans-serif",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  buttonDisabled: {
    background: '#c8c4bc',
    cursor: 'wait',
  },
  countdown: {
    fontSize: 11,
    color: '#6E3A5A',
    margin: '8px 0 0',
    textAlign: 'center' as const,
    fontFamily: "'Josefin Sans', sans-serif",
    letterSpacing: '0.1em',
  },
};

export default function AutoSeoStatusPanel() {
  const [refreshing, setRefreshing] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);
  const [autoCountdown, setAutoCountdown] = useState<number | null>(null);
  // Anna 21 Jul: on mobile the right-sidebar injected panels stack at the top
  // of the edit view, pushing the actual form fields below the fold. Hide
  // this whole panel below 900px so the form is what she sees first.
  // Auto-SEO still runs on Save via the lifecycle hook — she just doesn't
  // need the reminder/refresh UI on phones. Same threshold as HelpFab.
  const [isNarrow, setIsNarrow] = useState(false);
  useEffect(() => {
    const check = () => setIsNarrow(typeof window !== 'undefined' && window.innerWidth < 900);
    check();
    if (typeof window !== 'undefined') window.addEventListener('resize', check);
    return () => {
      if (typeof window !== 'undefined') window.removeEventListener('resize', check);
    };
  }, []);

  // Watch for "Saved document" / "Published document" toasts. When we detect
  // one, start a 10-second countdown then auto-reload so Anna sees the
  // freshly-generated SEO without having to click anything.
  useEffect(() => {
    const checkForSaveToast = () => {
      const matches = Array.from(document.querySelectorAll('*'))
        .filter((el) => {
          const t = el.textContent || '';
          return (
            (t.includes('Saved document') || t.includes('Published document')) &&
            el.children.length === 0 // leaf nodes only
          );
        });
      if (matches.length > 0) {
        setAutoCountdown(10);
      }
    };
    // Poll for the save toast every second.
    const id = setInterval(checkForSaveToast, 1000);
    return () => clearInterval(id);
  }, []);

  // Countdown tick. When it hits 0, reload.
  useEffect(() => {
    if (autoCountdown === null) return;
    if (autoCountdown <= 0) {
      setRefreshing(true);
      window.location.reload();
      return;
    }
    const id = setTimeout(() => setAutoCountdown((n) => (n === null ? null : n - 1)), 1000);
    return () => clearTimeout(id);
  }, [autoCountdown]);

  const reloadNow = () => {
    setRefreshing(true);
    window.location.reload();
  };

  // Extract { uid, documentId } from the current admin URL:
  //   /admin/content-manager/collection-types/<uid>/<documentId>
  //   /admin/content-manager/single-types/<uid>
  const parseUrl = (): { uid: string; documentId: string } | null => {
    if (typeof window === 'undefined') return null;
    const parts = window.location.pathname.split('/').filter(Boolean);
    const idx = parts.findIndex((p) => p === 'collection-types' || p === 'single-types');
    if (idx < 0 || idx + 1 >= parts.length) return null;
    const uid = decodeURIComponent(parts[idx + 1]);
    const documentId = idx + 2 < parts.length ? decodeURIComponent(parts[idx + 2]) : '';
    if (!uid || !documentId) return null;
    return { uid, documentId };
  };

  const regenerateNow = async () => {
    setRegenerating(true);
    setRegenError(null);
    try {
      const parsed = parseUrl();
      if (!parsed) throw new Error('Could not detect the entry from the URL.');
      // Grab the admin JWT from wherever Strapi v5 stashed it.
      const adminJwt =
        (typeof window !== 'undefined' &&
          (window.sessionStorage.getItem('jwtToken') ||
            window.localStorage.getItem('jwtToken') ||
            (() => {
              try {
                const ui = window.sessionStorage.getItem('strapi-userInfo') ||
                  window.localStorage.getItem('strapi-userInfo');
                if (ui) return JSON.parse(ui)?.token || '';
              } catch { /* ignore */ }
              return '';
            })())) || '';
      const res = await fetch('/api/seo-generator/regenerate-entry', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(adminJwt ? { Authorization: `Bearer ${adminJwt.replace(/^"|"$/g, '')}` } : {}),
        },
        body: JSON.stringify(parsed),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        const msg = typeof data?.error === 'string' ? data.error : `HTTP ${res.status}`;
        throw new Error(msg);
      }
      // Reload so Anna sees the freshly-written SEO in the fields below.
      window.location.reload();
    } catch (err: any) {
      setRegenError(err?.message || 'Regenerate failed.');
      setRegenerating(false);
    }
  };

  // Hide on mobile — panel eats the whole viewport above the form fields.
  if (isNarrow) return null;

  return (
    <div style={styles.card}>
      <p style={styles.label}>Auto SEO</p>
      <p style={styles.blurb}>
        SEO title and description fill in automatically when you Save.
        Powered by Claude — tuned to write what people search for, not marketing copy.
      </p>
      <p style={styles.blurb}>
        After saving, refresh this page to see the new SEO copy in the fields below.
      </p>
      <button
        type="button"
        onClick={regenerateNow}
        disabled={regenerating || refreshing}
        style={{ ...styles.button, ...(regenerating || refreshing ? styles.buttonDisabled : {}) }}
        onMouseEnter={(e) => {
          if (!(regenerating || refreshing)) (e.currentTarget as HTMLButtonElement).style.background = '#c4704a';
        }}
        onMouseLeave={(e) => {
          if (!(regenerating || refreshing)) (e.currentTarget as HTMLButtonElement).style.background = '#6E3A5A';
        }}
      >
        {regenerating ? 'Regenerating…' : 'Regenerate SEO now'}
      </button>
      {regenError && (
        <p style={{ ...styles.smallNote, color: '#B33A3A', fontStyle: 'normal' }}>
          {regenError}
        </p>
      )}
      <button
        type="button"
        onClick={reloadNow}
        disabled={refreshing || regenerating}
        style={{
          ...styles.button,
          background: '#fff',
          color: '#6E3A5A',
          border: '1px solid #6E3A5A',
          marginTop: 8,
          ...(refreshing || regenerating ? styles.buttonDisabled : {}),
        }}
      >
        {refreshing ? 'Refreshing…' : 'Just refresh the view'}
      </button>
      {autoCountdown !== null && autoCountdown > 0 && (
        <p style={styles.countdown}>
          Auto-refresh in {autoCountdown}s
        </p>
      )}
      <p style={styles.smallNote}>
        <strong>Regenerate SEO now</strong> re-runs Claude on the current page content and overwrites both SEO fields — use whenever you want fresh copy.
        <br /><br />
        SEO also fills in automatically when you Save (if the fields are blank). Manual edits you type into the SEO fields are preserved on Save.
      </p>
    </div>
  );
}
