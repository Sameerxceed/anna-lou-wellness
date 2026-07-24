/**
 * YouTube URL helpers — extract video ID + build thumbnail/embed URLs
 * from any variant Anna might paste in the CMS.
 *
 * Supports:
 *   - https://www.youtube.com/watch?v=VIDEO_ID
 *   - https://youtube.com/watch?v=VIDEO_ID&t=42s
 *   - https://youtu.be/VIDEO_ID
 *   - https://youtu.be/VIDEO_ID?si=xyz  (Share button default)
 *   - https://www.youtube.com/embed/VIDEO_ID
 *   - https://www.youtube.com/shorts/VIDEO_ID
 *   - https://m.youtube.com/watch?v=VIDEO_ID
 *
 * Zero-dependency. Thumbnails come from img.youtube.com — no API key,
 * no cost, no auth. Returns null for anything that isn't a YouTube URL
 * so callers can fall through to their existing render.
 */

const ID_RE = /^[A-Za-z0-9_-]{11}$/;

export function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = String(url).trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\.|^m\./, '');

    // youtu.be/{id}
    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1).split('/')[0];
      return ID_RE.test(id) ? id : null;
    }

    if (host.endsWith('youtube.com')) {
      // /watch?v={id}
      const v = parsed.searchParams.get('v');
      if (v && ID_RE.test(v)) return v;
      // /embed/{id} or /shorts/{id}
      const parts = parsed.pathname.split('/').filter(Boolean);
      if ((parts[0] === 'embed' || parts[0] === 'shorts') && parts[1] && ID_RE.test(parts[1])) {
        return parts[1];
      }
    }
  } catch {
    // Not a valid URL — treat as raw id if it looks like one
    if (ID_RE.test(trimmed)) return trimmed;
  }
  return null;
}

/**
 * Thumbnail URL for a YouTube video. Sizes:
 *   - 'max'     — highest available (may 404 for old videos; caller can fall back)
 *   - 'hq'      — 480x360, always exists
 *   - 'sd'      — 640x480 (only on newer uploads)
 *   - 'mq'      — 320x180
 *   - 'default' — 120x90
 * Default 'hq' is the safe universal choice.
 */
export function youtubeThumbnail(
  url: string | null | undefined,
  size: 'max' | 'hq' | 'sd' | 'mq' | 'default' = 'hq',
): string | null {
  const id = extractYouTubeId(url);
  if (!id) return null;
  const nameMap = {
    max: 'maxresdefault',
    hq: 'hqdefault',
    sd: 'sddefault',
    mq: 'mqdefault',
    default: 'default',
  };
  return `https://img.youtube.com/vi/${id}/${nameMap[size]}.jpg`;
}

/**
 * Embed URL suitable for <iframe src>. Preserves ?t= start time when present.
 * Returns null if the input isn't a YouTube URL.
 */
export function youtubeEmbedUrl(url: string | null | undefined): string | null {
  const id = extractYouTubeId(url);
  if (!id) return null;
  let start = 0;
  try {
    const parsed = new URL(String(url));
    const t = parsed.searchParams.get('t') || parsed.searchParams.get('start');
    if (t) {
      const m = /^(\d+)(?:s)?$/.exec(t);
      if (m) start = Number(m[1]);
    }
  } catch { /* ignore */ }
  return start > 0
    ? `https://www.youtube.com/embed/${id}?start=${start}`
    : `https://www.youtube.com/embed/${id}`;
}
