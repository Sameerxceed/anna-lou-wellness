import { getStockImage } from '@/data/stock-images';
import { fetchAPI, mediaUrl } from '@/lib/strapi';
import { getFAQs } from '@/lib/cms';
import FAQAccordion from '@/components/FAQAccordion';
import { ServiceSchema, BreadcrumbSchema } from '@/components/StructuredData';
import DecoderForm from './DecoderForm';

export const dynamic = 'force-dynamic';

const f = (cms: Record<string, unknown> | null, key: string, fallback: string): string => {
  const v = cms?.[key];
  return typeof v === 'string' && v.trim() ? v : fallback;
};
const splitParas = (s: string) => s.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
const splitLines = (s: string) => s.split('\n').map((p) => p.trim()).filter(Boolean);

export default async function DecoderPage() {
  let cms: Record<string, unknown> | null = null;
  try {
    const { data: d } = await fetchAPI('/decoder-page', { populate: '*' });
    cms = (d as Record<string, unknown>) || null;
  } catch { cms = null; }
  const faqs = await getFAQs({ page: 'decoder' });

  const coverImageUrl = mediaUrl(cms?.coverImage as { url?: string } | undefined) || getStockImage('decoder', 'decoder-cover');
  const whyParas = splitParas(f(cms, 'whyBody', ''));
  const insideItems = splitLines(f(cms, 'insideItems', ''));

  return (
    <>
      <ServiceSchema
        name="The Nervous System Decoder"
        description="A free somatic self-audit guide. Identify which of the three nervous system states you are in and get a practice for each."
        url="/free/nervous-system-decoder"
        price="0"
      />
      <BreadcrumbSchema items={[{ name: 'Home', href: '/' }, { name: 'Free Decoder', href: '/free/nervous-system-decoder' }]} />
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <section className="dec-hero">
        <div className="dec-hero-inner">
          <p className="dec-eyebrow">{f(cms, 'heroEyebrow', 'Free. Always free.')}</p>
          <h1 className="dec-title">{f(cms, 'heroTitle', 'The Nervous System Decoder.')}</h1>
          <p className="dec-tagline"><em>{f(cms, 'heroTagline', 'The first thing if you are new here.')}</em></p>
        </div>
      </section>

      <section className="dec-body">
        <div className="dec-grid">
          <div className="dec-left">
            <div className="dec-cover" style={{ backgroundImage: `url('${coverImageUrl}')` }}>
              <div className="dec-cover-overlay" />
              <div className="dec-cover-content">
                <p className="dec-cover-label">{f(cms, 'coverLabel', 'Free Guide')}</p>
                <p className="dec-cover-title">{f(cms, 'coverTitle', 'The Nervous System Decoder')}</p>
                <p className="dec-cover-sub">{f(cms, 'coverSubtitle', 'A somatic self-audit, in seven quiet questions.')}</p>
                <p className="dec-cover-author">{f(cms, 'coverAuthor', 'By Anna Lou Scaife')}</p>
              </div>
            </div>
          </div>

          <div className="dec-right">
            <p className="dec-section-label">{f(cms, 'whyTitle', 'Why this exists')}</p>
            {whyParas.map((p, i) => <p key={i} className="dec-body-text">{p}</p>)}

            <div className="dec-whats-inside">
              <p className="dec-section-label">{f(cms, 'insideTitle', "What's inside")}</p>
              <ul>
                {insideItems.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>

            <DecoderForm
              formTitle={f(cms, 'formTitle', 'Send it to me')}
              buttonLabel={f(cms, 'formButtonLabel', 'Send me the Decoder')}
              microcopy={f(cms, 'formMicrocopy', 'No spam. Unsubscribe in one click. We never share your email.')}
              successTitle={f(cms, 'successTitle', 'Your Decoder is on its way.')}
              successBody={f(cms, 'successBody', 'Look for an email from Anna in the next few minutes. If it is not there, check spam or promotions.\n\nIn the meantime, if you want to go further, here is what comes next.')}
            />
          </div>
        </div>
      </section>

      <FAQAccordion faqs={faqs} accentColour="#FFD07A" background="#F5F3EF" />
    </>
  );
}

const pageStyles = `
.dec-hero {
  background: linear-gradient(160deg, #F1EAE0 0%, #FCE8EF 100%);
  padding: 3.5rem 2rem 2.5rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.dec-hero::after {
  content: ''; position: absolute;
  width: 200px; height: 200px; border-radius: 50%;
  background: #FFD07A; filter: blur(80px); opacity: 0.5;
  top: -40px; right: -40px;
}
.dec-hero-inner { max-width: 800px; margin: 0 auto; position: relative; z-index: 1; }
.dec-eyebrow {
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.65rem; letter-spacing: 0.3em; text-transform: uppercase;
  color: #6E3A5A; margin-bottom: 0.6rem;
}
.dec-title {
  font-family: 'Work Sans', sans-serif; font-weight: 300;
  font-size: clamp(2.4rem, 5.5vw, 3.8rem); color: #231F20;
  letter-spacing: 0.04em; line-height: 1.15; margin-bottom: 0.5rem;
}
.dec-tagline {
  font-family: 'EB Garamond', Georgia, serif; font-style: italic;
  font-size: clamp(1.1rem, 2.4vw, 1.4rem); color: #3D3D3A;
}

.dec-body { background: #fff; padding: 3rem 2rem; }
.dec-grid {
  max-width: 1100px; margin: 0 auto;
  display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 3rem; align-items: start;
}

.dec-left { position: sticky; top: 100px; }
.dec-cover {
  aspect-ratio: 3/4; border-radius: 8px;
  background-size: cover; background-position: center;
  position: relative; overflow: hidden;
  box-shadow: 0 16px 48px rgba(0,0,0,0.12);
}
.dec-cover-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(35,31,32,0.15) 0%, rgba(35,31,32,0.55) 100%);
}
.dec-cover-content {
  position: relative; z-index: 1; padding: 2.5rem 2rem;
  height: 100%; display: flex; flex-direction: column; justify-content: space-between;
  color: #F1EAE0;
}
.dec-cover-label {
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.55rem; letter-spacing: 0.28em; text-transform: uppercase;
  color: #FFD07A;
}
.dec-cover-title {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: clamp(1.5rem, 3vw, 2.1rem); line-height: 1.2;
  color: #fff; margin-bottom: 0.5rem;
}
.dec-cover-sub {
  font-family: 'EB Garamond', Georgia, serif; font-style: italic;
  font-size: 0.95rem; color: rgba(255,255,255,0.85);
}
.dec-cover-author {
  font-family: Mulish, sans-serif; font-weight: 400;
  font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase;
  color: rgba(255,255,255,0.55);
}

.dec-section-label {
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase;
  color: #6E3A5A; margin-bottom: 0.6rem;
}
.dec-body-text {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 1rem; line-height: 1.8; color: #3D3D3A;
  margin-bottom: 1rem;
}

.dec-whats-inside { background: #F5F3EF; padding: 1.5rem; border-radius: 6px; margin: 2rem 0; }
.dec-whats-inside ul { list-style: none; padding: 0; margin: 0; }
.dec-whats-inside li {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 0.95rem; line-height: 1.7; color: #3D3D3A;
  padding: 0.4rem 0 0.4rem 1.5rem; position: relative;
}
.dec-whats-inside li::before {
  content: '+'; position: absolute; left: 0; color: #6E3A5A; font-weight: 700; font-size: 1.1rem;
}

.dec-form { background: #231F20; padding: 1.8rem; border-radius: 8px; margin-top: 2rem; }
.dec-form .dec-section-label { color: #FFD07A; }
.dec-label { display: block; margin-bottom: 0.9rem; }
.dec-label span {
  display: block;
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.55rem; letter-spacing: 0.18em; text-transform: uppercase;
  color: rgba(241,234,224,0.7); margin-bottom: 0.4rem;
}
.dec-label input {
  width: 100%; height: 44px;
  background: rgba(241,234,224,0.06);
  border: 1px solid rgba(241,234,224,0.15);
  border-radius: 4px;
  padding: 0 0.9rem;
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 0.95rem; color: #F1EAE0;
  outline: none; transition: border-color 0.2s;
}
.dec-label input:focus { border-color: #FFD07A; }
.dec-submit {
  width: 100%; height: 48px;
  background: #FFD07A; color: #231F20; border: none; border-radius: 4px;
  font-family: Mulish, sans-serif; font-weight: 600;
  font-size: 0.7rem; letter-spacing: 0.18em; text-transform: uppercase;
  cursor: pointer; transition: background 0.2s;
  margin-top: 0.4rem;
}
.dec-submit:hover { background: #FFC15C; }
.dec-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.dec-fineprint {
  font-family: Mulish, sans-serif; font-weight: 300;
  font-size: 0.6rem; color: rgba(241,234,224,0.4);
  text-align: center; margin-top: 0.8rem; letter-spacing: 0.05em;
}

.dec-success { background: #F5F3EF; padding: 1.8rem; border-radius: 8px; margin-top: 2rem; }
.dec-success-title {
  font-family: 'EB Garamond', Georgia, serif; font-style: italic;
  font-size: 1.6rem; color: #231F20; margin-bottom: 0.8rem;
}
.dec-cta-row { display: flex; flex-direction: column; gap: 0.6rem; margin-top: 1rem; }
.dec-cta-link {
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase;
  color: #6E3A5A; text-decoration: none;
  border-bottom: 1px solid #6E3A5A;
  padding-bottom: 2px; align-self: flex-start;
  transition: gap 0.3s;
}
.dec-cta-link:hover { color: #5A2E4A; border-bottom-color: #5A2E4A; }

@media (max-width: 900px) {
  .dec-grid { grid-template-columns: 1fr; gap: 2rem; }
  .dec-left { position: static; max-width: 320px; margin: 0 auto; }
}
`;
