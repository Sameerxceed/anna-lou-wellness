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
  const [autoCountdown, setAutoCountdown] = useState<number | null>(null);

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
        onClick={reloadNow}
        disabled={refreshing}
        style={{ ...styles.button, ...(refreshing ? styles.buttonDisabled : {}) }}
        onMouseEnter={(e) => {
          if (!refreshing) (e.currentTarget as HTMLButtonElement).style.background = '#c4704a';
        }}
        onMouseLeave={(e) => {
          if (!refreshing) (e.currentTarget as HTMLButtonElement).style.background = '#6E3A5A';
        }}
      >
        {refreshing ? 'Refreshing…' : 'Refresh to see SEO'}
      </button>
      {autoCountdown !== null && autoCountdown > 0 && (
        <p style={styles.countdown}>
          Auto-refresh in {autoCountdown}s
        </p>
      )}
      <p style={styles.smallNote}>
        If you don't like what Claude wrote, clear both SEO fields and save again — it will rewrite.
        Your manual edits are never overwritten.
      </p>
    </div>
  );
}
