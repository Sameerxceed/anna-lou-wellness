import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mantras',
  description: 'Short mantra videos from Anna Lou. 60 to 90 seconds each. Come back to yourself. Anna Lou Wellness.',
  openGraph: {
    title: 'Mantras — Anna Lou Wellness',
    description: 'Short mantra videos from Anna Lou. Come back to yourself.',
  },
};

export default function MantrasPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: mantraStyles }} />

      <section className="mantras-page">
        <div className="mantras-inner">
          <p className="mantras-kicker reveal">Life &middot; Rituals and Energy</p>
          <h1 className="mantras-title reveal rd1">Mantras</h1>
          <p className="mantras-subtitle reveal rd2">Short practices to bring you back to yourself. 60 to 90 seconds each.</p>

          {/* Video grid — CMS managed, YouTube embeds */}
          <div className="mantras-grid">
            <div className="mantra-card reveal">
              <div className="mantra-video-placeholder">
                <p>YouTube embed placeholder</p>
                <p className="mantra-note">Anna will supply YouTube mantra links from the &ldquo;Come Back to Yourself&rdquo; playlist.</p>
              </div>
              <h3 className="mantra-name">Mantra 1. CMS placeholder.</h3>
            </div>
            <div className="mantra-card reveal rd1">
              <div className="mantra-video-placeholder">
                <p>YouTube embed placeholder</p>
              </div>
              <h3 className="mantra-name">Mantra 2. CMS placeholder.</h3>
            </div>
            <div className="mantra-card reveal rd2">
              <div className="mantra-video-placeholder">
                <p>YouTube embed placeholder</p>
              </div>
              <h3 className="mantra-name">Mantra 3. CMS placeholder.</h3>
            </div>
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
.mantras-subtitle { font-family:'EB Garamond',Georgia,serif; font-style:italic; font-size:1.1rem; color:#8C8880; margin-bottom:2.5rem; }
.mantras-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.2rem; text-align:left; }
.mantra-card { border-radius:8px; overflow:hidden; }
.mantra-video-placeholder { aspect-ratio:16/9; background:linear-gradient(160deg,#e8ddd0,#d4c5b3); border-radius:6px; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:1rem; }
.mantra-video-placeholder p { font-family:Mulish,sans-serif; font-size:0.55rem; letter-spacing:0.1em; text-transform:uppercase; color:rgba(0,0,0,0.15); text-align:center; }
.mantra-note { margin-top:0.3rem; font-size:0.45rem !important; max-width:80%; }
.mantra-name { font-family:'EB Garamond',Georgia,serif; font-weight:500; font-size:0.95rem; color:#231F20; margin-top:0.8rem; }
@media (max-width:900px) {
  .mantras-grid { grid-template-columns:1fr; }
  .mantras-page { padding:2rem 1.2rem; }
}
`;
