import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { getWorkshopReplays, type WorkshopReplay } from '@/lib/cms';
import { youtubeThumbnail } from '@/lib/youtube';

export const metadata: Metadata = {
  title: 'Workshop replays — Reset Room',
  robots: { index: false, follow: false },
};

export default async function ReplaysPage() {
  const session = await getSession();
  if (!session) redirect('/login?next=/community/reset-room/replays');
  if (!session.isMember) redirect('/community/reset-room');

  const replays = await getWorkshopReplays();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />
      <section className="rp-page">
        <div className="rp-inner">
          <p className="rp-eyebrow">Reset Room · Workshop replays</p>
          <h1 className="rp-title">Every workshop, free for you inside.</h1>
          <p className="rp-sub"><em>Each one a small reset. Watch what calls.</em></p>

          {replays.length === 0 ? (
            <div className="rp-empty">
              <p>Workshop replays will appear here as Anna releases them.</p>
              <p className="rp-empty-sub">First batch coming with the public launch.</p>
              <Link href="/community/reset-room/dashboard" className="rp-back">&larr; Back to dashboard</Link>
            </div>
          ) : (
            <div className="rp-grid">
              {replays.map((r) => <ReplayCard key={r.slug} replay={r} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function ReplayCard({ replay }: { replay: WorkshopReplay }) {
  const date = replay.recordedDate
    ? new Date(replay.recordedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  return (
    <article className="rp-card">
      {(() => {
        // Prefer Anna's uploaded thumbnail; if she only pasted a YouTube URL
        // fall back to the auto-generated YouTube thumbnail so the card
        // always has a visual.
        const thumb = replay.videoThumbnail || youtubeThumbnail(replay.videoUrl, 'hq');
        return thumb ? (
          <div className="rp-thumb" style={{ backgroundImage: `url('${thumb}')` }} />
        ) : null;
      })()}
      <div className="rp-card-body">
        <p className="rp-card-kind">{replay.kind}{date && ` · ${date}`}</p>
        <h3 className="rp-card-title">{replay.title}</h3>
        {replay.description && <p className="rp-card-desc">{replay.description}</p>}
        <div className="rp-card-meta">
          {replay.duration && <span>{replay.duration}</span>}
          {(replay.videoUrl || replay.audioUrl) && (
            <span>{[replay.videoUrl && 'Video', replay.audioUrl && 'Audio'].filter(Boolean).join(' + ')}</span>
          )}
        </div>
        {replay.videoUrl && (
          <details className="rp-player">
            <summary>Watch the replay &darr;</summary>
            <div className="rp-video-wrap">
              <iframe src={replay.videoUrl} className="rp-video" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen title={replay.title} />
            </div>
          </details>
        )}
        {replay.audioUrl && !replay.videoUrl && (
          <audio controls preload="metadata" src={replay.audioUrl} className="rp-audio" />
        )}
      </div>
    </article>
  );
}

const pageStyles = `
.rp-page { background: #F1EAE0; padding: 3rem 2rem 4rem; min-height: 70vh; }
.rp-inner { max-width: 1100px; margin: 0 auto; }
.rp-eyebrow { font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.6rem; letter-spacing: 0.28em; text-transform: uppercase; color: #6E3A5A; margin-bottom: 0.6rem; }
.rp-title { font-family: 'EB Garamond', Georgia, serif; font-weight: 400; font-size: clamp(1.8rem, 4vw, 2.6rem); color: #231F20; margin-bottom: 0.3rem; }
.rp-sub { font-family: 'EB Garamond', Georgia, serif; font-size: 1rem; color: #8C8880; margin-bottom: 2.4rem; }
.rp-empty { background: #fff; padding: 3rem 2rem; border-radius: 6px; text-align: center; }
.rp-empty p { font-family: 'EB Garamond', Georgia, serif; font-size: 1rem; color: #3D3D3A; margin-bottom: 0.5rem; }
.rp-empty-sub { color: #8C8880 !important; font-size: 0.9rem !important; margin-bottom: 1.5rem !important; }
.rp-back { display: inline-block; margin-top: 1rem; font-family: Mulish, sans-serif; font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; color: #6E3A5A; text-decoration: none; padding: 0.6rem 1.2rem; border: 1px solid #6E3A5A; border-radius: 3px; }
.rp-back:hover { background: #6E3A5A; color: #fff; }

.rp-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.2rem; }
.rp-card { background: #fff; border-radius: 8px; overflow: hidden; }
.rp-thumb { aspect-ratio: 16/9; background-size: cover; background-position: center; }
.rp-card-body { padding: 1.2rem 1.4rem; }
.rp-card-kind { font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.55rem; letter-spacing: 0.18em; text-transform: uppercase; color: #6E3A5A; margin: 0 0 0.4rem; }
.rp-card-title { font-family: 'Work Sans', sans-serif; font-weight: 400; font-size: 1.15rem; color: #231F20; margin: 0 0 0.5rem; line-height: 1.3; }
.rp-card-desc { font-family: 'EB Garamond', Georgia, serif; font-size: 0.95rem; line-height: 1.6; color: #3D3D3A; margin: 0 0 0.8rem; }
.rp-card-meta { display: flex; gap: 1rem; font-family: Mulish, sans-serif; font-size: 0.65rem; color: #8C8880; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 1rem; }
.rp-player summary { font-family: Mulish, sans-serif; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #6E3A5A; cursor: pointer; padding: 0.6rem 0; }
.rp-video-wrap { aspect-ratio: 16/9; background: #231F20; border-radius: 6px; overflow: hidden; margin-top: 0.6rem; }
.rp-video { width: 100%; height: 100%; border: none; display: block; }
.rp-audio { width: 100%; margin-top: 0.5rem; }

@media (max-width: 800px) { .rp-grid { grid-template-columns: 1fr; } }
`;
