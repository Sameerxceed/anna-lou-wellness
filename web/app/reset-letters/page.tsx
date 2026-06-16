import { fetchAPI } from '@/lib/strapi';
import ResetLettersSignupForm from './ResetLettersSignupForm';
import UpsellBlockForSingleton from '@/components/UpsellBlockForSingleton';

const f = (cms: Record<string, unknown> | null, key: string, fallback: string): string => {
  const v = cms?.[key];
  return typeof v === 'string' && v.trim() ? v : fallback;
};

const splitParas = (s: string) =>
  s.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

const splitLines = (s: string) =>
  s.split('\n').map((p) => p.trim()).filter(Boolean);

export default async function ResetLettersPage() {
  let cms: Record<string, unknown> | null = null;
  try {
    const { data: d } = await fetchAPI('/reset-letters-page', { populate: '*' });
    cms = (d as Record<string, unknown>) || null;
  } catch {
    cms = null;
  }

  const whatItIsParas = splitParas(f(cms, 'whatItIsBody', ''));
  const eachWeekParas = splitParas(f(cms, 'eachWeekBody', ''));
  const voicesParas = splitParas(f(cms, 'voicesBody', ''));
  const aboutAnnaParas = splitParas(f(cms, 'aboutAnnaBody', ''));
  const benefits = splitLines(f(cms, 'founderBenefits', ''));

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: holdingStyles }} />

      <div className="rl-page">
        {/* Page now inherits the site-wide nav (with the Anna Lou Wellness
            wordmark + main menu) from the root layout — no custom brand
            lockup needed here. Page opens straight into the Reset Letters
            wordmark below the standard nav. */}
        <p className="rl-coming-soon">{f(cms, 'comingSoonLabel', 'COMING SOON')}</p>

        {/* Reset Letters wordmark — RESET plum, LETTERS blue (per Anna 20 May) */}
        <div className="rl-wordmark" aria-label="Reset Letters">
          <div className="rl-word" style={{ color: '#5B2E55' }}>RESET</div>
          <div className="rl-word" style={{ color: '#7BAFDD' }}>LETTERS</div>
        </div>

        <p className="rl-strapline"><em>{f(cms, 'strapline', 'for women who have been holding everything')}</em></p>

        {/* Hero */}
        <section className="rl-hero">
          <div className="rl-hero-photo">
            <img src="/anna-reset.jpg" alt="Anna Lou Scaife" className="rl-hero-img" />
          </div>
          <div className="rl-hero-text">
            <h1 className="rl-hero-headline">{f(cms, 'heroHeadline', "If you've been holding everything for a long time, this is for you.")}</h1>
            <p className="rl-body">{f(cms, 'heroBody1', 'Reset Letters is a weekly magazine about what happens when you finally put it all down.')}</p>
            <p className="rl-body">{f(cms, 'heroBody2', 'It is written by me, Anna Lou, with contributions from coaches, therapists, and women I trust.')}</p>
          </div>
        </section>

        {/* What It Is */}
        <section className="rl-section">
          <h2 className="rl-section-title">{f(cms, 'whatItIsTitle', 'WHAT IT IS')}</h2>
          <div className="rl-section-body">
            {whatItIsParas.map((p, i) => <p key={i} className="rl-body">{p}</p>)}
          </div>
        </section>

        {/* Each Week */}
        <section className="rl-section">
          <h2 className="rl-section-title">{f(cms, 'eachWeekTitle', 'EACH WEEK')}</h2>
          <div className="rl-section-body">
            {eachWeekParas.map((p, i) => {
              const dashIdx = p.indexOf('—');
              if (dashIdx > 0) {
                const head = p.slice(0, dashIdx).trim();
                const tail = p.slice(dashIdx + 1).trim();
                return <p key={i} className="rl-body"><strong>{head}</strong> <em>{tail}</em></p>;
              }
              return <p key={i} className="rl-body">{p}</p>;
            })}
          </div>
        </section>

        {/* Voices */}
        <section className="rl-section">
          <h2 className="rl-section-title">{f(cms, 'voicesTitle', 'VOICES & CONTRIBUTORS')}</h2>
          <div className="rl-section-body">
            {voicesParas.map((p, i) => <p key={i} className="rl-body">{p}</p>)}
          </div>
        </section>

        {/* About Anna */}
        <section className="rl-section">
          <h2 className="rl-section-title">{f(cms, 'aboutAnnaTitle', 'A BIT ABOUT ANNA')}</h2>
          <div className="rl-section-body">
            {aboutAnnaParas.map((p, i) => <p key={i} className="rl-body">{p}</p>)}
          </div>
        </section>

        {/* Launch */}
        <div className="rl-launch">
          <p className="rl-launch-label">{f(cms, 'launchLabel', 'LAUNCHING')}</p>
          <p className="rl-launch-date">{f(cms, 'launchDate', '22 JUNE 2026')}</p>
        </div>

        {/* Founding Member */}
        <section className="rl-founder-card">
          <p className="rl-founder-eyebrow">{f(cms, 'founderEyebrow', 'FOUNDING MEMBER OFFER')}</p>
          <h3 className="rl-founder-headline">{f(cms, 'founderHeadline', 'First 500 subscribers join free, for life.')}</h3>
          <p className="rl-body" style={{ textAlign: 'center' }}>{f(cms, 'founderBody', 'After the first 500, Reset Letters will cost £7 per month. But if you sign up before launch, you get everything. For ever. No catch.')}</p>

          <ul className="rl-benefits">
            {benefits.map((b, i) => (
              <li key={i}><span className="rl-check">&#10003;</span> {b}</li>
            ))}
          </ul>

          <ResetLettersSignupForm
            buttonLabel={f(cms, 'ctaButtonLabel', 'CLAIM MY FOUNDER PLACE')}
            placeholder={f(cms, 'ctaPlaceholder', 'your@email.com')}
            microcopy={f(cms, 'ctaMicrocopy', 'No spam. Honest writing. Cancel any time.')}
          />
        </section>

        {/* Footer */}
        <footer className="rl-footer">
          <a href="https://www.instagram.com/annalouwellness" target="_blank" rel="noopener noreferrer" className="rl-insta">
            FOLLOW ON INSTAGRAM &rarr;
          </a>
          <p className="rl-copyright">&copy; {new Date().getFullYear()} Anna Lou Wellness</p>
        </footer>
      </div>
    <UpsellBlockForSingleton endpoint="/reset-letters-page" />
    </>
  );
}

const holdingStyles = `
* { margin:0; padding:0; box-sizing:border-box; }

/* Page sits inside the main site layout now — no standalone cream
   background or full-viewport height needed. Content stays centered at
   720px, vertical padding scales with the standard site header / footer. */
.rl-page { color: #231F20; font-family: 'Poppins', sans-serif; max-width: 720px; margin: 0 auto; padding: 3rem 2rem; }

.rl-header { text-align:center; margin-bottom:2.5rem; }
.rl-alw-logo { height:40px; width:auto; margin-bottom:0.4rem; display:inline-block; }
.rl-tagline { font-family:'Poppins',sans-serif; font-weight:400; font-size:0.55rem; letter-spacing:0.35em; color:#A67C3A; }

.rl-coming-soon { text-align:center; font-family:'Poppins',sans-serif; font-weight:500; font-size:1rem; letter-spacing:0.2em; color:#231F20; margin-bottom:1.5rem; }

.rl-wordmark { text-align:center; margin-bottom:1.2rem; }
.rl-word { font-family:'Poppins',sans-serif; font-weight:900; font-size:clamp(3rem,8vw,5rem); line-height:0.95; letter-spacing:0.02em; display:block; }
.rl-word span { display:inline-block; }

.rl-strapline { text-align:center; font-family:'Lora',Georgia,serif; font-style:italic; font-size:clamp(1.2rem,3vw,1.8rem); color:#231F20; margin-bottom:3rem; line-height:1.4; }

.rl-hero { display:grid; grid-template-columns:1fr 1.2fr; gap:2rem; align-items:start; margin-bottom:3rem; }
.rl-hero-img { width:100%; aspect-ratio:4/5; object-fit:cover; object-position:center top; border-radius:6px; }
.rl-hero-headline { font-family:'Lora',Georgia,serif; font-style:italic; font-weight:400; font-size:clamp(1.3rem,2.5vw,1.7rem); line-height:1.45; color:#231F20; margin-bottom:1.2rem; }

.rl-body { font-family:'Poppins',sans-serif; font-weight:300; font-size:0.92rem; line-height:1.8; color:#231F20; margin-bottom:1rem; }
.rl-body strong { font-weight:600; }
.rl-body em { font-family:'Lora',Georgia,serif; font-style:italic; }

.rl-section { margin-bottom:2.5rem; text-align:center; }
.rl-section-title { font-family:'Poppins',sans-serif; font-weight:600; font-size:0.7rem; letter-spacing:0.25em; text-transform:uppercase; color:#231F20; margin-bottom:1.2rem; }
.rl-section-body { max-width:600px; margin:0 auto; }
.rl-section-body .rl-body { text-align:center; }

.rl-launch { text-align:center; margin-bottom:2.5rem; }
.rl-launch-label { font-family:'Poppins',sans-serif; font-weight:400; font-size:0.6rem; letter-spacing:0.2em; color:#666; margin-bottom:0.3rem; }
.rl-launch-date { font-family:'Poppins',sans-serif; font-weight:700; font-size:clamp(2rem,5vw,3rem); color:#231F20; letter-spacing:0.05em; }

.rl-founder-card { background:#fff; border:2px solid #F280AA; border-radius:12px; padding:2.5rem 2rem; margin-bottom:2.5rem; text-align:center; }
.rl-founder-eyebrow { font-family:'Poppins',sans-serif; font-weight:500; font-size:0.6rem; letter-spacing:0.25em; color:#F280AA; margin-bottom:0.8rem; }
.rl-founder-headline { font-family:'Lora',Georgia,serif; font-style:italic; font-weight:400; font-size:clamp(1.3rem,2.5vw,1.6rem); color:#231F20; margin-bottom:1rem; line-height:1.4; }

.rl-benefits { list-style:none; text-align:left; max-width:460px; margin:1.5rem auto; padding:0; }
.rl-benefits li { font-family:'Poppins',sans-serif; font-weight:300; font-size:0.85rem; color:#231F20; padding:0.5rem 0; display:flex; align-items:flex-start; gap:0.7rem; line-height:1.5; }
.rl-check { color:#5DCAA5; font-weight:700; font-size:1rem; flex-shrink:0; margin-top:0.1rem; }

.rl-form { max-width:460px; margin:1.5rem auto 1rem; }
.rl-input { width:100%; height:60px; border:2px solid #231F20; border-radius:6px; padding:0 1.2rem; font-family:'Poppins',sans-serif; font-weight:300; font-size:0.9rem; color:#231F20; background:transparent; outline:none; margin-bottom:0.8rem; transition:border-color 0.3s; }
.rl-input::placeholder { color:#999; }
.rl-input:focus { border-color:#F280AA; }
.rl-submit { width:100%; height:60px; background:#231F20; color:#fff; border:none; border-radius:6px; font-family:'Poppins',sans-serif; font-weight:600; font-size:0.7rem; letter-spacing:0.2em; text-transform:uppercase; cursor:pointer; transition:background 0.3s; }
.rl-submit:hover { background:#3D3D3A; }
.rl-submit:disabled { opacity:0.6; cursor:not-allowed; }

.rl-privacy { font-family:'Poppins',sans-serif; font-weight:300; font-size:0.72rem; color:#666; text-align:center; line-height:1.6; }

.rl-footer { text-align:center; padding-top:1rem; border-top:1px solid rgba(0,0,0,0.06); }
.rl-insta { display:inline-block; font-family:'Poppins',sans-serif; font-weight:500; font-size:0.65rem; letter-spacing:0.15em; color:#231F20; text-decoration:none; border:1px solid #231F20; padding:0.7rem 1.8rem; border-radius:4px; transition:all 0.3s; margin-bottom:1rem; }
.rl-insta:hover { background:#231F20; color:#F1EAE0; }
.rl-copyright { font-family:'Poppins',sans-serif; font-weight:300; font-size:0.65rem; color:#999; }

@media (max-width:640px) {
  .rl-page { padding:2rem 1.2rem; }
  .rl-hero { grid-template-columns:1fr; gap:1.5rem; }
  .rl-alw-logo { height:32px; }
  .rl-coming-soon { font-size:0.8rem; }
  .rl-founder-card { padding:1.8rem 1.2rem; }
  .rl-input, .rl-submit { height:54px; }
}
`;
