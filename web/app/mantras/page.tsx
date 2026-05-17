import { Metadata } from 'next';
import { getMantras } from '@/lib/cms';
import { getGenericPageBySlug } from '@/lib/generic-page';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Mantras',
  description: 'Short mantra videos from Anna Lou. 60 to 90 seconds each. Come back to yourself. Anna Lou Wellness.',
  openGraph: {
    title: 'Mantras — Anna Lou Wellness',
    description: 'Short mantra videos from Anna Lou. Come back to yourself.',
  },
};

const fallbackMantras = [
  { id: 1, title: 'I am safe in this moment', youtubeUrl: '', description: 'A grounding practice for when your nervous system is activated. Place both feet on the floor and repeat.', duration: '60 seconds' },
  { id: 2, title: 'I release what is not mine to carry', youtubeUrl: '', description: 'For the women who hold everything. This is your permission to put it down.', duration: '75 seconds' },
  { id: 3, title: 'I come back to myself', youtubeUrl: '', description: 'The core mantra of the Come Back to Yourself playlist. A daily reset in under ninety seconds.', duration: '90 seconds' },
  { id: 4, title: 'My body knows the way', youtubeUrl: '', description: 'When your mind is too loud to think clearly, your body already has the answer. This practice helps you listen.', duration: '60 seconds' },
  { id: 5, title: 'I trust the timing of my life', youtubeUrl: '', description: 'For the moments when nothing seems to be happening fast enough. Slow is not stuck.', duration: '75 seconds' },
  { id: 6, title: 'I am allowed to take up space', youtubeUrl: '', description: 'A practice for women who have made themselves small. You do not need to shrink.', duration: '60 seconds' },
];

function youtubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default async function MantrasPage() {
  const [cmsMantras, cms] = await Promise.all([
    getMantras(),
    getGenericPageBySlug('mantras'),
  ]);
  const mantras = cmsMantras.length > 0 ? cmsMantras : fallbackMantras;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: mantraStyles }} />

      <section className="mantras-page">
        <div className="mantras-inner">
          <p className="mantras-kicker reveal">{cms?.kicker || 'Life · Rituals and Energy'}</p>
          <h1 className="mantras-title reveal rd1">{cms?.title || 'Mantras'}</h1>
          <p className="mantras-subtitle reveal rd2">{cms?.tagline || 'Short practices to bring you back to yourself. 60 to 90 seconds each.'}</p>
          <p className="mantras-intro reveal rd2">{cms?.intro || 'These are not affirmations. They are somatic anchors — phrases paired with breath and body awareness to help regulate your nervous system in real time. Each one comes from the “Come Back to Yourself” series.'}</p>

          <div className="mantras-grid">
            {mantras.map((mantra, i) => {
              const embedUrl = youtubeEmbedUrl(mantra.youtubeUrl);
              return (
                <div key={mantra.id} className={`mantra-card reveal${i > 0 ? ` rd${i}` : ''}`}>
                  {embedUrl ? (
                    <div className="mantra-video">
                      <iframe
                        src={embedUrl}
                        title={mantra.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="mantra-video-placeholder">
                      <p>{mantra.duration || '60–90 sec'}</p>
                    </div>
                  )}
                  <h3 className="mantra-name">{mantra.title}</h3>
                  {mantra.description && <p className="mantra-desc">{mantra.description}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

const mantraStyles = `
.mantras-page { background:#fff; padding:2.5rem 3rem; min-height:60vh; }
.mantras-inner { max-width:1000px; margin:0 auto; text-align:center; }
.mantras-kicker { font-family:Mulish,sans-serif; font-weight:400; font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; color:#FAA21B; margin-bottom:0.5rem; }
.mantras-title { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:300; font-size:clamp(2rem,5vw,3rem); color:#231F20; letter-spacing:0.05em; margin-bottom:0.5rem; }
.mantras-subtitle { font-family:'EB Garamond',Georgia,serif; font-style:italic; font-size:1.1rem; color:#8C8880; margin-bottom:0.8rem; }
.mantras-intro { font-family:'EB Garamond',Georgia,serif; font-size:1rem; color:#3D3D3A; line-height:1.8; max-width:800px; margin:0 auto 2rem; }
.mantras-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.2rem; text-align:left; }
.mantra-card { border-radius:8px; overflow:hidden; }
.mantra-video { aspect-ratio:16/9; border-radius:6px; overflow:hidden; }
.mantra-video iframe { width:100%; height:100%; border:none; }
.mantra-video-placeholder { aspect-ratio:16/9; background:linear-gradient(160deg,#e8ddd0,#d4c5b3); border-radius:6px; display:flex; align-items:center; justify-content:center; }
.mantra-video-placeholder p { font-family:Mulish,sans-serif; font-size:0.65rem; letter-spacing:0.1em; text-transform:uppercase; color:rgba(0,0,0,0.2); }
.mantra-name { font-family:'EB Garamond',Georgia,serif; font-weight:500; font-size:0.95rem; color:#231F20; margin-top:0.8rem; }
.mantra-desc { font-family:'EB Garamond',Georgia,serif; font-size:0.85rem; color:#8C8880; line-height:1.6; margin-top:0.3rem; }
@media (max-width:900px) {
  .mantras-grid { grid-template-columns:1fr; }
  .mantras-page { padding:2rem 1.2rem; }
}
`;
