import { Metadata } from 'next';
import { getLatestForecast } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Cosmic Forecast',
  description: 'This week\'s Cosmic Forecast from Anna Lou. Moon phase, energy theme, stone of the week, and somatic practice. Anna Lou Wellness.',
  openGraph: {
    title: 'Cosmic Forecast — Anna Lou Wellness',
    description: 'This week\'s Cosmic Forecast. Moon phase, energy theme, and stone of the week.',
  },
};

export default async function CosmicForecastPage() {
  const forecast = await getLatestForecast();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cosmicStyles }} />

      <section className="cosmic-page">
        <div className="cosmic-inner">
          <p className="cosmic-kicker reveal">Life &middot; Rituals and Energy</p>
          <h1 className="cosmic-title reveal rd1">Cosmic Forecast</h1>
          <p className="cosmic-subtitle reveal rd2">This week&rsquo;s energy, moon phase, and stone.</p>

          <div className="cosmic-content reveal">
            {forecast ? (
              <>
                <div className="cosmic-meta">Week of {new Date(forecast.weekOf).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                <h2 className="cosmic-forecast-title">{forecast.title}</h2>
                {forecast.moonPhase && <p className="cosmic-detail"><strong>Moon Phase:</strong> {forecast.moonPhase}</p>}
                {forecast.energyTheme && <p className="cosmic-detail"><strong>Energy Theme:</strong> {forecast.energyTheme}</p>}
                {forecast.stoneOfWeek && <p className="cosmic-detail"><strong>Stone of the Week:</strong> {forecast.stoneOfWeek}</p>}
                <div className="cosmic-summary">
                  {forecast.summary.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
                </div>
              </>
            ) : (
              <>
                <div className="cosmic-meta">Coming this week</div>
                <div className="cosmic-summary">
                  <p>The Cosmic Forecast is a weekly practice shared every Sunday. It combines the moon phase, an energy theme, a stone of the week, and a somatic practice.</p>
                  <p>The full version — with the complete ritual, somatic practice, and personal note from Anna — goes to Reset Letters Plus subscribers. This page displays the summary version.</p>
                  <p>I started writing it for myself. A way to structure the week around something other than a to-do list. The moon doesn&rsquo;t care about your deadlines. It operates on its own rhythm. And there&rsquo;s something profoundly settling about aligning your inner work with a cycle that&rsquo;s been running for four and a half billion years.</p>
                </div>
              </>
            )}
          </div>

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
.cosmic-inner { max-width:900px; margin:0 auto; text-align:center; }
.cosmic-kicker { font-family:Mulish,sans-serif; font-weight:400; font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; color:#FAA21B; margin-bottom:0.5rem; }
.cosmic-title { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:300; font-size:clamp(2rem,5vw,3rem); color:#231F20; letter-spacing:0.05em; margin-bottom:0.5rem; }
.cosmic-subtitle { font-family:'EB Garamond',Georgia,serif; font-style:italic; font-size:1.1rem; color:#8C8880; margin-bottom:2rem; }
.cosmic-content { text-align:left; margin-bottom:2rem; }
.cosmic-meta { font-family:Mulish,sans-serif; font-weight:500; font-size:0.7rem; letter-spacing:0.12em; text-transform:uppercase; color:#FAA21B; margin-bottom:1rem; padding-bottom:0.5rem; border-bottom:1px solid rgba(0,0,0,0.06); }
.cosmic-forecast-title { font-family:'EB Garamond',Georgia,serif; font-weight:400; font-size:1.5rem; color:#231F20; margin-bottom:1rem; }
.cosmic-detail { font-family:Mulish,sans-serif; font-size:0.85rem; color:#3D3D3A; margin-bottom:0.4rem; }
.cosmic-detail strong { color:#231F20; }
.cosmic-summary { font-family:'EB Garamond',Georgia,serif; font-size:1.05rem; color:#3D3D3A; line-height:1.85; margin-top:1rem; }
.cosmic-summary p { margin-bottom:1rem; }
.cosmic-cta { background:#FFF0D2; border-radius:8px; padding:2rem; text-align:center; }
.cosmic-cta-text { font-family:'EB Garamond',Georgia,serif; font-size:1rem; color:#3D3D3A; line-height:1.6; margin-bottom:1rem; }
.cosmic-cta-btn { background:#6E3A5A; color:#fff; border:1px solid #6E3A5A; font-family:Mulish,sans-serif; font-weight:500; font-size:0.6rem; letter-spacing:0.12em; text-transform:uppercase; padding:0.7rem 1.8rem; border-radius:3px; transition:all 0.3s; display:inline-block; text-decoration:none; }
.cosmic-cta-btn:hover { background:#5A2E4A; }
@media (max-width:900px) { .cosmic-page { padding:2rem 1.2rem; } }
`;
