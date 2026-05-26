import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getVaultJourneyBySlug } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Vault Journey',
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function VaultSinglePage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getSession();
  if (!session) redirect(`/login?next=/community/reset-room/vault/${slug}`);
  if (!session.isMember) redirect('/community/reset-room');

  const journey = await getVaultJourneyBySlug(slug);
  if (!journey) notFound();

  const hasVideo = Boolean(journey.videoUrl);
  const hasAudio = Boolean(journey.audioUrl);
  const formattedDate = journey.recordedDate
    ? new Date(journey.recordedDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: vsStyles }} />

      <section className="vs-page">
        <div className="vs-inner">
          <div className="vs-breadcrumb">
            <Link href="/community/reset-room/vault">&larr; Back to The Vault</Link>
          </div>

          <p className="vs-eyebrow" style={{ color: journey.toneColour }}>Reset Room · {journey.kind}</p>
          <h1 className="vs-title">{journey.name}</h1>
          {journey.description && <p className="vs-sub">{journey.description}</p>}

          {/* Video player (Bunny.net Stream URL — iframe-embeddable) */}
          {hasVideo && (
            <div className="vs-player">
              <iframe
                src={journey.videoUrl}
                className="vs-video"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                title={journey.name}
              />
            </div>
          )}

          {/* Audio player */}
          {hasAudio && !hasVideo && (
            <div className="vs-audio-wrap" style={{ backgroundColor: journey.toneColour + '20' }}>
              <p className="vs-audio-label">Listen</p>
              <audio controls preload="metadata" src={journey.audioUrl} className="vs-audio" />
            </div>
          )}

          {/* If both: audio is secondary, below video */}
          {hasAudio && hasVideo && (
            <div className="vs-audio-secondary">
              <p className="vs-audio-label">Audio only</p>
              <audio controls preload="metadata" src={journey.audioUrl} className="vs-audio" />
            </div>
          )}

          {/* When neither audio nor video is uploaded yet */}
          {!hasVideo && !hasAudio && (
            <div className="vs-empty-player">
              <p>Recording coming soon.</p>
            </div>
          )}

          <div className="vs-meta">
            {journey.duration && (
              <div className="vs-meta-item">
                <span>Length</span>
                <p>{journey.duration}</p>
              </div>
            )}
            <div className="vs-meta-item">
              <span>Format</span>
              <p>{[hasAudio && 'Audio', hasVideo && 'Video'].filter(Boolean).join(' + ') || 'Coming soon'}</p>
            </div>
            {formattedDate && (
              <div className="vs-meta-item">
                <span>Recorded</span>
                <p>{formattedDate}</p>
              </div>
            )}
          </div>

          {(journey.audioUrl || journey.companionPdfUrl) && (
            <div className="vs-actions">
              {journey.audioUrl && (
                <a href={journey.audioUrl} download className="vs-btn" style={{ backgroundColor: journey.toneColour, borderColor: journey.toneColour }}>
                  Download audio
                </a>
              )}
              {journey.companionPdfUrl && (
                <a href={journey.companionPdfUrl} download className="vs-btn vs-btn-ghost" style={{ color: journey.toneColour, borderColor: journey.toneColour }}>
                  Download companion PDF
                </a>
              )}
            </div>
          )}

          {journey.body && (
            <div className="vs-body">
              <p className="vs-section-label" style={{ color: journey.toneColour }}>About this journey</p>
              <div className="vs-body-content" dangerouslySetInnerHTML={{ __html: renderBody(journey.body) }} />
            </div>
          )}
        </div>
      </section>
    </>
  );
}

/**
 * Minimal markdown-ish rendering for the journey body — Strapi richtext
 * field returns markdown. We split on blank lines into paragraphs.
 * (Avoiding a full markdown library; Anna writes simple prose here.)
 */
function renderBody(raw: string): string {
  return raw
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br />')}</p>`)
    .join('');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const vsStyles = `
.vs-page { background: #F1EAE0; padding: 2rem 2rem 4rem; min-height: 70vh; }
.vs-inner { max-width: 880px; margin: 0 auto; }
.vs-breadcrumb { margin-bottom: 1.5rem; }
.vs-breadcrumb a { font-family: Mulish, sans-serif; font-weight: 400; font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase; color: #6E3A5A; text-decoration: none; }

.vs-eyebrow { font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.6rem; letter-spacing: 0.28em; text-transform: uppercase; margin-bottom: 0.6rem; }
.vs-title { font-family: 'Work Sans', sans-serif; font-weight: 300; font-size: clamp(2rem, 5vw, 3rem); color: #231F20; letter-spacing: 0.04em; line-height: 1.15; margin-bottom: 0.5rem; }
.vs-sub { font-family: 'EB Garamond', Georgia, serif; font-style: italic; font-size: 1.05rem; color: #3D3D3A; line-height: 1.6; margin-bottom: 1.5rem; }

.vs-player { margin-bottom: 1.5rem; aspect-ratio: 16/9; border-radius: 8px; overflow: hidden; background: #231F20; }
.vs-video { width: 100%; height: 100%; border: none; display: block; }

.vs-audio-wrap { padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; }
.vs-audio-secondary { padding: 1rem 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; background: #fff; }
.vs-audio-label { font-family: Mulish, sans-serif; font-weight: 600; font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase; color: #6E3A5A; margin-bottom: 0.6rem; }
.vs-audio { width: 100%; }

.vs-empty-player { aspect-ratio: 16/9; background: #fff; border: 1px dashed #D5D0C8; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; }
.vs-empty-player p { font-family: 'EB Garamond', Georgia, serif; font-style: italic; color: #8C8880; }

.vs-meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; background: #fff; padding: 1.2rem; border-radius: 6px; margin-bottom: 1.5rem; }
.vs-meta-item span { display: block; font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.55rem; letter-spacing: 0.2em; text-transform: uppercase; color: #8C8880; margin-bottom: 0.3rem; }
.vs-meta-item p { font-family: 'EB Garamond', Georgia, serif; font-size: 0.95rem; color: #231F20; }

.vs-actions { display: flex; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 2rem; }
.vs-btn { color: #fff; border: 1px solid; padding: 0.7rem 1.2rem; border-radius: 4px; font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.65rem; letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer; transition: opacity 0.2s; text-decoration: none; display: inline-block; }
.vs-btn:hover { opacity: 0.85; }
.vs-btn-ghost { background: transparent; }

.vs-body { background: #fff; padding: 1.5rem 1.8rem; border-radius: 8px; }
.vs-section-label { font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 0.6rem; }
.vs-body-content p { font-family: 'EB Garamond', Georgia, serif; font-size: 1rem; line-height: 1.8; color: #3D3D3A; margin-bottom: 1rem; }
.vs-body-content p:last-child { margin-bottom: 0; }

@media (max-width: 640px) { .vs-meta { grid-template-columns: 1fr; } }
`;
