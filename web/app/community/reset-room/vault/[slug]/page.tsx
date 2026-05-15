import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

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
  const title = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: vsStyles }} />

      <section className="vs-page">
        <div className="vs-inner">
          <div className="vs-breadcrumb">
            <Link href="/community/reset-room/vault">&larr; Back to The Vault</Link>
          </div>

          <div className="vs-notice">
            <p className="vs-notice-label">Pre-launch placeholder</p>
            <p>Real video and audio play inline here once the Vault launches with the seven founding journeys. Each journey has a Bunny.net Stream embed for video and a downloadable MP3.</p>
          </div>

          <p className="vs-eyebrow">Reset Room · Vault Journey</p>
          <h1 className="vs-title">{title}</h1>

          <div className="vs-player">
            <div className="vs-player-placeholder">
              <span className="vs-player-icon">▶</span>
              <p>Video player will embed here (Bunny.net Stream)</p>
            </div>
          </div>

          <div className="vs-meta">
            <div className="vs-meta-item">
              <span>Length</span>
              <p>To be set</p>
            </div>
            <div className="vs-meta-item">
              <span>Format</span>
              <p>Audio + Video</p>
            </div>
            <div className="vs-meta-item">
              <span>Recorded</span>
              <p>To be set</p>
            </div>
          </div>

          <div className="vs-actions">
            <button className="vs-btn">Download MP3</button>
            <button className="vs-btn vs-btn-ghost">Download companion PDF</button>
            <button className="vs-btn vs-btn-ghost">Listen in your podcast player</button>
          </div>

          <div className="vs-body">
            <p className="vs-section-label">About this journey</p>
            <p>Description and full notes appear here once Anna records the journey and publishes it.</p>
          </div>
        </div>
      </section>
    </>
  );
}

const vsStyles = `
.vs-page { background: #F1EAE0; padding: 2rem 2rem 4rem; min-height: 70vh; }
.vs-inner { max-width: 880px; margin: 0 auto; }
.vs-breadcrumb { margin-bottom: 1.5rem; }
.vs-breadcrumb a {
  font-family: Mulish, sans-serif; font-weight: 400;
  font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase;
  color: #6E3A5A; text-decoration: none;
}
.vs-notice {
  background: #FFE9C4; border-left: 3px solid #FAA21B;
  padding: 1rem 1.2rem; border-radius: 0 4px 4px 0; margin-bottom: 2rem;
}
.vs-notice-label {
  font-family: Mulish, sans-serif; font-weight: 600;
  font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase;
  color: #FAA21B; margin-bottom: 0.3rem;
}
.vs-notice p { font-family: 'EB Garamond', Georgia, serif; font-size: 0.9rem; color: #3D3D3A; line-height: 1.6; }

.vs-eyebrow {
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.6rem; letter-spacing: 0.28em; text-transform: uppercase;
  color: #6E3A5A; margin-bottom: 0.6rem;
}
.vs-title {
  font-family: 'Work Sans', sans-serif; font-weight: 300;
  font-size: clamp(2rem, 5vw, 3rem); color: #231F20;
  letter-spacing: 0.04em; line-height: 1.15; margin-bottom: 1.5rem;
}

.vs-player { margin-bottom: 1.5rem; }
.vs-player-placeholder {
  aspect-ratio: 16/9; background: #231F20; border-radius: 8px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 0.5rem; color: rgba(241,234,224,0.6);
}
.vs-player-icon { font-size: 3rem; color: #FFD07A; }
.vs-player-placeholder p {
  font-family: Mulish, sans-serif; font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase;
}

.vs-meta {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;
  background: #fff; padding: 1.2rem; border-radius: 6px; margin-bottom: 1.5rem;
}
.vs-meta-item span {
  display: block;
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.55rem; letter-spacing: 0.2em; text-transform: uppercase;
  color: #8C8880; margin-bottom: 0.3rem;
}
.vs-meta-item p {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 0.95rem; color: #231F20;
}

.vs-actions { display: flex; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 2rem; }
.vs-btn {
  background: #6E3A5A; color: #fff; border: none; padding: 0.7rem 1.2rem; border-radius: 4px;
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.65rem; letter-spacing: 0.12em; text-transform: uppercase;
  cursor: pointer; transition: background 0.2s;
}
.vs-btn:hover { background: #5A2E4A; }
.vs-btn-ghost { background: transparent; color: #6E3A5A; border: 1px solid #6E3A5A; }
.vs-btn-ghost:hover { background: #6E3A5A; color: #fff; }

.vs-body { background: #fff; padding: 1.5rem; border-radius: 8px; }
.vs-section-label {
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase;
  color: #6E3A5A; margin-bottom: 0.4rem;
}
.vs-body p {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 1rem; line-height: 1.7; color: #3D3D3A;
}

@media (max-width: 640px) { .vs-meta { grid-template-columns: 1fr; } }
`;
