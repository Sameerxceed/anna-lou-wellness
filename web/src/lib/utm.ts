/**
 * UTM origin tracking — client-side.
 *
 * When a visitor lands from a Substack share link (or any external
 * source) the URL carries ?utm_source=substack. We capture it into
 * sessionStorage on first page load so that when they later submit a
 * signup form, the form body can include utm_source and the server can
 * tag them in Mailchimp with "Origin: substack" (or similar).
 *
 * Why sessionStorage (not localStorage): origin is per-visit. A visitor
 * who came from Substack last week and returns directly today is not
 * "from Substack this visit".
 *
 * Why first-touch (don't overwrite): if a visitor lands via Substack,
 * then clicks an internal link to another page that has its own utm
 * (unlikely but possible), we keep the first source. That's the
 * convention most analytics platforms use.
 */

const KEY = 'alw-utm';

type Stored = {
  source?: string;
  medium?: string;
  campaign?: string;
  at?: string; // ISO timestamp of first capture
};

export function captureUtmOnLoad(): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = sessionStorage.getItem(KEY);
    if (existing) return; // first-touch wins
    const params = new URLSearchParams(window.location.search);
    const source = params.get('utm_source');
    if (!source) return;
    const data: Stored = {
      source,
      medium: params.get('utm_medium') || undefined,
      campaign: params.get('utm_campaign') || undefined,
      at: new Date().toISOString(),
    };
    sessionStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // sessionStorage unavailable (private mode strict, etc.) — silent.
  }
}

export function getStoredUtm(): Stored | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Stored;
  } catch {
    return null;
  }
}

export function getStoredUtmSource(): string {
  return getStoredUtm()?.source || '';
}
