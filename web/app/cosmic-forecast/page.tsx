import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cosmic Forecast',
  description: 'This week\'s Cosmic Forecast from Anna Lou. Moon phase, energy theme, stone of the week, and somatic practice. Anna Lou Wellness.',
  openGraph: {
    title: 'Cosmic Forecast — Anna Lou Wellness',
    description: 'This week\'s Cosmic Forecast. Moon phase, energy theme, and stone of the week.',
  },
};

export default function CosmicForecastPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cosmicStyles }} />

      <section className="cosmic-page">
        <div className="cosmic-inner">
          <p className="cosmic-kicker reveal">Life &middot; Rituals and Energy</p>
          <h1 className="cosmic-title reveal rd1">Cosmic Forecast</h1>
          <p className="cosmic-subtitle reveal rd2">This week&rsquo;s energy, moon phase, and stone.</p>

          {/* Summary version — CMS managed */}
          <div className="cosmic-content reveal">
            <div className="cosmic-meta">Week of 5 May 2026</div>
            <div className="cosmic-summary">
              <p>CMS placeholder. Anna writes the full Cosmic Forecast once per week. The full version (600 to 900 words) goes to Substack as paid content. This page displays the 300-word summary version only.</p>
              <p>The summary includes: moon phase, energy theme, stone of the week, and one sentence on the somatic practice. The full ritual, full somatic practice, and personal note from Anna are available to Reset Letters Plus subscribers.</p>
            </div>
          </div>

          {/* CTA to Substack */}
          <div className="cosmic-cta reveal">
            <p className="cosmic-cta-text">Want the full ritual, the full somatic practice, and the personal note from Anna?</p>
            <a href="#" className="cosmic-cta-btn">Reset Letters Plus <span>&rarr;</span></a>
          </div>
        </div>
      </section>
    </>
  );
}

const cosmicStyles = `
.cosmic-page { background:#fff; padding:2.5rem 3rem; min-height:60vh; }
.cosmic-inner { max-width:700px; margin:0 auto; text-align:center; }
.cosmic-kicker { font-family:Mulish,sans-serif; font-weight:400; font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; color:#FAA21B; margin-bottom:0.5rem; }
.cosmic-title { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:300; font-size:clamp(2rem,5vw,3rem); color:#231F20; letter-spacing:0.05em; margin-bottom:0.5rem; }
.cosmic-subtitle { font-family:'EB Garamond',Georgia,serif; font-style:italic; font-size:1.1rem; color:#8C8880; margin-bottom:2rem; }
.cosmic-content { text-align:left; margin-bottom:2rem; }
.cosmic-meta { font-family:Mulish,sans-serif; font-weight:500; font-size:0.7rem; letter-spacing:0.12em; text-transform:uppercase; color:#FAA21B; margin-bottom:1rem; padding-bottom:0.5rem; border-bottom:1px solid rgba(0,0,0,0.06); }
.cosmic-summary { font-family:'EB Garamond',Georgia,serif; font-size:1.05rem; color:#3D3D3A; line-height:1.85; }
.cosmic-summary p { margin-bottom:1rem; }
.cosmic-cta { background:#FFF0D2; border-radius:8px; padding:2rem; text-align:center; }
.cosmic-cta-text { font-family:'EB Garamond',Georgia,serif; font-size:1rem; color:#3D3D3A; line-height:1.6; margin-bottom:1rem; }
.cosmic-cta-btn { background:#6E3A5A; color:#fff; border:1px solid #6E3A5A; font-family:Mulish,sans-serif; font-weight:500; font-size:0.6rem; letter-spacing:0.12em; text-transform:uppercase; padding:0.7rem 1.8rem; border-radius:3px; transition:all 0.3s; display:inline-block; text-decoration:none; }
.cosmic-cta-btn:hover { background:#5A2E4A; }
@media (max-width:900px) { .cosmic-page { padding:2rem 1.2rem; } }
`;
