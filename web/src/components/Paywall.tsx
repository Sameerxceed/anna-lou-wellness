import Link from 'next/link';

export interface PaywallProps {
  substackUrl?: string;
  accentColour?: string;
}

/**
 * Paywall block shown at the cut point of a paid Substack article.
 * Body above this is the free preview (first ~3 paragraphs / ~150 words).
 * To keep reading, reader subscribes on Substack — Substack handles all paid access.
 */
export default function Paywall({ substackUrl, accentColour = '#6E3A5A' }: PaywallProps) {
  const subscribeHref = substackUrl?.replace(/\/p\/[^/]+\/?$/, '') + '/subscribe' || 'https://annalouwellness.substack.com/subscribe';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: paywallStyles }} />

      <div className="pw-fade" aria-hidden="true" />

      <section className="pw-block" style={{ borderTopColor: accentColour }}>
        <p className="pw-eyebrow" style={{ color: accentColour }}>For paid subscribers</p>
        <h3 className="pw-title">The rest of this letter is for paid subscribers.</h3>
        <p className="pw-body">
          Reset Letters is a weekly magazine. The Sunday Cosmic Forecast and Wednesday Signal Check
          are free for everyone. The long-form Reset Stories and the audio sessions are for paid
          subscribers. £7 a month, set inside Substack. The first 500 founding members read everything for life.
        </p>

        <div className="pw-cta-row">
          <a
            href={subscribeHref}
            target="_blank"
            rel="noopener noreferrer"
            className="pw-btn-primary"
            style={{ background: accentColour }}
          >
            Subscribe to read the full letter &rarr;
          </a>
          {substackUrl && (
            <a
              href={substackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pw-btn-ghost"
              style={{ color: accentColour, borderColor: accentColour }}
            >
              Read on Substack
            </a>
          )}
        </div>

        <p className="pw-fineprint">
          Already a paid subscriber? <a href={substackUrl || subscribeHref} target="_blank" rel="noopener noreferrer">Open this letter on Substack</a> to read the full version.
        </p>
      </section>
    </>
  );
}

const paywallStyles = `
.pw-fade {
  position: relative;
  height: 120px;
  margin-top: -120px;
  margin-bottom: 0;
  background: linear-gradient(180deg, transparent 0%, #ffffff 90%);
  pointer-events: none;
}
.pw-block {
  background: #F5F3EF;
  border-top: 3px solid #6E3A5A;
  border-radius: 0 0 8px 8px;
  padding: 2rem 1.8rem;
  margin: 0 0 2rem;
  text-align: center;
}
.pw-eyebrow {
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.6rem; letter-spacing: 0.28em; text-transform: uppercase;
  margin-bottom: 0.6rem;
}
.pw-title {
  font-family: 'Work Sans', sans-serif; font-weight: 400;
  font-size: clamp(1.3rem, 2.6vw, 1.7rem); line-height: 1.25;
  color: #231F20; margin-bottom: 0.8rem;
}
.pw-body {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 1rem; line-height: 1.75; color: #3D3D3A;
  max-width: 540px; margin: 0 auto 1.4rem;
}
.pw-cta-row {
  display: flex; gap: 0.8rem; justify-content: center; flex-wrap: wrap; margin-bottom: 0.9rem;
}
.pw-btn-primary {
  display: inline-block;
  color: #fff; padding: 0.95rem 1.6rem; border-radius: 4px;
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.7rem; letter-spacing: 0.18em; text-transform: uppercase;
  text-decoration: none; transition: filter 0.2s, transform 0.2s;
}
.pw-btn-primary:hover { filter: brightness(0.92); transform: translateY(-1px); }
.pw-btn-ghost {
  display: inline-block;
  background: transparent; padding: 0.95rem 1.4rem; border-radius: 4px;
  border: 1px solid;
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.7rem; letter-spacing: 0.18em; text-transform: uppercase;
  text-decoration: none; transition: opacity 0.2s;
}
.pw-btn-ghost:hover { opacity: 0.7; }
.pw-fineprint {
  font-family: Mulish, sans-serif; font-weight: 300;
  font-size: 0.7rem; color: #8C8880; letter-spacing: 0.05em;
}
.pw-fineprint a { color: inherit; text-decoration: underline; }

@media (max-width: 640px) {
  .pw-cta-row { flex-direction: column; }
  .pw-btn-primary, .pw-btn-ghost { width: 100%; text-align: center; }
}
`;
