import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { fetchRegulatedModules } from '@/lib/strapi-admin';
import { mediaUrl } from '@/lib/strapi';

export const metadata: Metadata = {
  title: 'REGULATED · Course Access',
  description: 'Your REGULATED course modules. Member-only.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function RegulatedAccessPage() {
  const session = await getSession();
  if (!session) redirect('/login?next=/the-work/regulated/access');

  // Two gates: must be logged in AND must have purchased REGULATED.
  // (A Reset Room member who hasn't bought REGULATED is logged in but
  // hasRegulatedAccess=false — bounced to the sales page.)
  if (!session.hasRegulatedAccess) redirect('/the-work/regulated');

  const modules = await fetchRegulatedModules();
  // Sort modules: intro first (if any), then by sort_order
  const introModule = modules.find((m) => m.is_intro);
  const restModules = modules
    .filter((m) => !m.is_intro)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const { user } = session;
  const firstName = user.firstName || (user.email ? user.email.split('@')[0] : 'there');

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />
      <section className="reg-page">
        <div className="reg-inner">
          <p className="reg-eyebrow">REGULATED · Your course</p>
          <h1 className="reg-greeting">Welcome, {firstName}.</h1>
          <p className="reg-sub">
            <em>The practice is yours. Move through it at your own pace — there is no right speed.</em>
          </p>

          {modules.length === 0 && (
            <div className="reg-empty">
              <p>Your course is being prepared. Anna will email you the moment it is live.</p>
            </div>
          )}

          {introModule && (
            <article className="reg-module reg-intro">
              <p className="reg-tag">Start here</p>
              <ModuleCard m={introModule} accent="#6E3A5A" />
            </article>
          )}

          {restModules.length > 0 && (
            <div className="reg-modules">
              {restModules.map((m, i) => (
                <article key={m.id} className="reg-module">
                  <p className="reg-tag">Module {String(i + 1).padStart(2, '0')}</p>
                  <ModuleCard m={m} accent="#5DCAA5" />
                </article>
              ))}
            </div>
          )}

          <div className="reg-footer-row">
            <Link href="/community/reset-room" className="reg-link">
              The Reset Room — where this work keeps going →
            </Link>
            <Link href="/contact" className="reg-link reg-link-muted">
              Need help? Email Anna
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

// ─── Single-module renderer ───
function ModuleCard({ m, accent }: { m: any; accent: string }) {
  const downloadHref = m.downloadable_file?.url
    ? (m.downloadable_file.url.startsWith('http') ? m.downloadable_file.url : `${process.env.NEXT_PUBLIC_STRAPI_URL || ''}${m.downloadable_file.url}`)
    : null;
  const thumb = mediaUrl(m.thumbnail);

  return (
    <div className="reg-card" style={{ borderTopColor: accent }}>
      {thumb && (
        <div className="reg-card-thumb" style={{ backgroundImage: `url('${thumb}')` }} />
      )}
      <div className="reg-card-body">
        <h2 className="reg-card-title">{m.title}</h2>
        {m.duration_label && <p className="reg-card-duration">{m.duration_label}</p>}
        {m.intro && <p className="reg-card-intro">{m.intro}</p>}

        {m.video_url && (
          <div className="reg-media">
            {m.video_url.includes('youtube') || m.video_url.includes('youtu.be') ? (
              <iframe
                src={toEmbedUrl(m.video_url)}
                title={m.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            ) : m.video_url.includes('vimeo') ? (
              <iframe
                src={m.video_url}
                title={m.title}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            ) : (
              <video controls preload="metadata" src={m.video_url} />
            )}
          </div>
        )}

        {m.audio_url && (
          <div className="reg-audio">
            <audio controls src={m.audio_url} preload="metadata" />
          </div>
        )}

        {m.body && (
          <div
            className="reg-card-body-content"
            dangerouslySetInnerHTML={{ __html: renderRichText(m.body) }}
          />
        )}

        {downloadHref && (
          <a href={downloadHref} target="_blank" rel="noopener" className="reg-download">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 16, height: 16, marginRight: 8 }}>
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Download {m.downloadable_file?.name || 'file'}
          </a>
        )}
      </div>
    </div>
  );
}

function toEmbedUrl(url: string): string {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}`;
  return url;
}

/**
 * Very minimal markdown → HTML renderer for the body field.
 * Strapi's richtext is markdown; we render the common subset (paragraphs,
 * bold, italic, links) safely without a full library.
 */
function renderRichText(md: string): string {
  if (!md) return '';
  const escaped = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .split(/\n\s*\n/)
    .map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
    .join('');
}

const pageStyles = `
.reg-page { background:#F1EAE0; padding:3rem 2rem 4rem; min-height:70vh; }
.reg-inner { max-width:900px; margin:0 auto; }
.reg-eyebrow { font-family:Mulish,sans-serif; font-weight:500; font-size:0.6rem; letter-spacing:0.28em; text-transform:uppercase; color:#6E3A5A; margin-bottom:0.6rem; }
.reg-greeting { font-family:'Work Sans',sans-serif; font-weight:300; font-size:clamp(2.2rem,5vw,3.2rem); color:#231F20; letter-spacing:0.04em; line-height:1.15; margin-bottom:0.4rem; }
.reg-sub { font-family:'EB Garamond',Georgia,serif; font-style:italic; font-size:1.15rem; color:#3D3D3A; margin-bottom:2.5rem; }
.reg-empty { background:#fff; padding:2.5rem 2rem; border-radius:8px; text-align:center; font-family:'EB Garamond',Georgia,serif; font-size:1.05rem; color:#3D3D3A; font-style:italic; }
.reg-tag { font-family:Mulish,sans-serif; font-weight:500; font-size:0.55rem; letter-spacing:0.22em; text-transform:uppercase; color:#8C8880; margin-bottom:0.4rem; }
.reg-module { margin-bottom:1.8rem; }
.reg-intro .reg-card { border-top-width:4px; }
.reg-card { background:#fff; border-top:3px solid; border-radius:8px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.04); }
.reg-card-thumb { width:100%; aspect-ratio:16/9; background-size:cover; background-position:center; }
.reg-card-body { padding:1.6rem 1.8rem 1.8rem; }
.reg-card-title { font-family:'Work Sans',sans-serif; font-weight:400; font-size:1.4rem; color:#231F20; margin-bottom:0.4rem; }
.reg-card-duration { font-family:Mulish,sans-serif; font-size:0.7rem; letter-spacing:0.1em; color:#8C8880; margin-bottom:0.8rem; }
.reg-card-intro { font-family:'EB Garamond',Georgia,serif; font-style:italic; font-size:1rem; color:#3D3D3A; margin-bottom:1.2rem; line-height:1.7; }
.reg-media { aspect-ratio:16/9; background:#000; border-radius:6px; overflow:hidden; margin:1rem 0; }
.reg-media iframe, .reg-media video { width:100%; height:100%; border:0; display:block; }
.reg-audio { margin:1rem 0; }
.reg-audio audio { width:100%; }
.reg-card-body-content { font-family:'EB Garamond',Georgia,serif; font-size:1rem; line-height:1.8; color:#3D3D3A; }
.reg-card-body-content p { margin-bottom:0.9rem; }
.reg-card-body-content strong { color:#231F20; }
.reg-card-body-content a { color:#6E3A5A; text-decoration:underline; text-underline-offset:2px; }
.reg-download { display:inline-flex; align-items:center; margin-top:1.2rem; padding:0.7rem 1.1rem; background:#6E3A5A; color:#fff; text-decoration:none; font-family:Mulish,sans-serif; font-weight:500; font-size:0.65rem; letter-spacing:0.16em; text-transform:uppercase; border-radius:4px; transition:background 0.2s; }
.reg-download:hover { background:#5A2E4A; }
.reg-footer-row { display:flex; flex-direction:column; gap:0.6rem; align-items:center; margin-top:2.5rem; padding-top:1.5rem; border-top:1px solid rgba(0,0,0,0.08); text-align:center; }
.reg-link { font-family:Mulish,sans-serif; font-weight:500; font-size:0.7rem; letter-spacing:0.16em; text-transform:uppercase; color:#6E3A5A; text-decoration:none; }
.reg-link:hover { color:#231F20; }
.reg-link-muted { color:#8C8880; font-weight:400; }
.reg-link-muted:hover { color:#6E3A5A; }
@media (max-width:640px) { .reg-page { padding:2rem 1.2rem 3rem; } .reg-card-body { padding:1.3rem 1.2rem; } }
`;
