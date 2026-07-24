import { youtubeThumbnail, extractYouTubeId } from '@/lib/youtube';

/**
 * Renders a YouTube thumbnail wrapped in a link to the video. Falls back
 * to a plain text link if the URL isn't a YouTube URL. Play-button overlay
 * hint added so it reads as a video (not a static image).
 *
 * Used wherever a Strapi field holds a YouTube URL and Anna expects the
 * reader to see the video preview alongside the link (Reset Room dashboard,
 * Vault cards, Returning Circle watch page, etc.).
 */

interface Props {
  url: string | null | undefined;
  /** Optional title shown under the thumbnail. */
  label?: string;
  /** Max width in px. Defaults to 480. */
  maxWidth?: number;
  /** Force a specific thumbnail size. Default 'hq' (safe universal). */
  size?: 'max' | 'hq' | 'sd' | 'mq' | 'default';
  /** Open in new tab. Defaults to true. */
  openInNewTab?: boolean;
  className?: string;
}

export default function YouTubeThumbLink({
  url,
  label,
  maxWidth = 480,
  size = 'hq',
  openInNewTab = true,
  className,
}: Props) {
  const id = extractYouTubeId(url);
  const thumb = youtubeThumbnail(url, size);

  if (!id || !thumb || !url) {
    // Not a YouTube link — fall back to plain hyperlink so the caller's
    // existing behaviour is preserved when a non-YouTube URL is pasted.
    if (!url) return null;
    return (
      <a
        href={url}
        target={openInNewTab ? '_blank' : undefined}
        rel={openInNewTab ? 'noopener noreferrer' : undefined}
        className={className}
      >
        {label || url}
      </a>
    );
  }

  return (
    <a
      href={url}
      target={openInNewTab ? '_blank' : undefined}
      rel={openInNewTab ? 'noopener noreferrer' : undefined}
      className={className}
      style={{ display: 'inline-block', maxWidth: `${maxWidth}px`, textDecoration: 'none' }}
      aria-label={label ? `Watch on YouTube: ${label}` : 'Watch on YouTube'}
    >
      <span style={{
        position: 'relative',
        display: 'block',
        width: '100%',
        aspectRatio: '16 / 9',
        background: '#000',
        overflow: 'hidden',
        borderRadius: 6,
        boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumb}
          alt={label || 'YouTube video thumbnail'}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <span
          aria-hidden="true"
          style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(0,0,0,0.72)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.2s',
          }}
        >
          <span
            style={{
              width: 0, height: 0,
              borderLeft: '18px solid #fff',
              borderTop: '11px solid transparent',
              borderBottom: '11px solid transparent',
              marginLeft: 4,
            }}
          />
        </span>
      </span>
      {label && (
        <span style={{
          display: 'block',
          marginTop: '0.5rem',
          fontFamily: "'EB Garamond', Georgia, serif",
          fontSize: '0.9rem',
          color: 'inherit',
        }}>{label}</span>
      )}
    </a>
  );
}
