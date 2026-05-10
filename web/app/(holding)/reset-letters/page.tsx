'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ResetLettersPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      // Substack custom form POST
      const res = await fetch('https://annalouwellness.substack.com/api/v1/free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        window.location.href = '/welcome';
      } else {
        // Fallback: redirect anyway (Substack may block CORS)
        window.location.href = '/welcome';
      }
    } catch {
      // CORS will likely block, redirect to welcome
      window.location.href = '/welcome';
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: holdingStyles }} />

      <div className="rl-page">
        {/* Brand lockup */}
        <header className="rl-header">
          <img src="/alw-logo.png" alt="Anna Lou Wellness" className="rl-alw-logo" />
          <p className="rl-tagline">BEAUTIFULLY WHOLE</p>
        </header>

        {/* Coming Soon eyebrow */}
        <p className="rl-coming-soon">COMING SOON</p>

        {/* Reset Letters wordmark — CSS coloured letters */}
        <div className="rl-wordmark" aria-label="Reset Letters">
          <div className="rl-word">
            <span style={{ color: '#231F20' }}>R</span>
            <span style={{ color: '#EE312F' }}>E</span>
            <span style={{ color: '#FAA21B' }}>S</span>
            <span style={{ color: '#7BAFDD' }}>E</span>
            <span style={{ color: '#F280AA' }}>T</span>
          </div>
          <div className="rl-word">
            <span style={{ color: '#5DCAA5' }}>L</span>
            <span style={{ color: '#FFD07A' }}>E</span>
            <span style={{ color: '#7BAFDD' }}>T</span>
            <span style={{ color: '#F280AA' }}>T</span>
            <span style={{ color: '#D5D0C8' }}>E</span>
            <span style={{ color: '#FAA21B' }}>R</span>
            <span style={{ color: '#5DCAA5' }}>S</span>
          </div>
        </div>

        {/* Strapline */}
        <p className="rl-strapline"><em>for women who have been holding everything</em></p>

        {/* Hero section */}
        <section className="rl-hero">
          <div className="rl-hero-photo">
            <img src="/anna-reset.jpg" alt="Anna Lou Scaife" className="rl-hero-img" />
          </div>
          <div className="rl-hero-text">
            <h1 className="rl-hero-headline">If you&apos;ve been holding everything for a long time, this is for you.</h1>
            <p className="rl-body">Reset Letters is a weekly magazine about what happens when you finally put it all down. The managing. The performing. The pretending you&apos;re fine. This is for the women who have been carrying it all and are ready for something different.</p>
            <p className="rl-body">It is written by me, Anna Lou, with contributions from coaches, therapists, and women I trust. It covers everything from nervous system work and emotional intelligence to beauty, recipes, dating, motherhood, crystals, career pivots, and whatever else needs saying. It is not a wellness brand. It is a living, breathing magazine for real women.</p>
          </div>
        </section>

        {/* What It Is */}
        <section className="rl-section">
          <h2 className="rl-section-title">WHAT IT IS</h2>
          <div className="rl-section-body">
            <p className="rl-body">Reset Letters is a Substack publication. Think of it as a weekly magazine that lands in your inbox every Sunday morning. It is free to read, with some content available only to paying members.</p>
            <p className="rl-body">Each edition explores a different corner of what it means to live as a woman who is no longer willing to shrink. From the practical (budgeting after divorce, how to actually meditate, what to cook when you cannot think) to the poetic (what your nervous system is trying to tell you, the art of leaving, how crystals hold memory).</p>
            <p className="rl-body">It is broad on purpose. Because women are broad. We do not live in one lane.</p>
            <p className="rl-body">Some weeks will make you cry. Some will make you laugh. Some will just make you feel like someone finally said the thing you have been thinking.</p>
            <p className="rl-body">That is the point.</p>
          </div>
        </section>

        {/* Each Week */}
        <section className="rl-section">
          <h2 className="rl-section-title">EACH WEEK</h2>
          <div className="rl-section-body">
            <p className="rl-body"><strong>Sunday Cosmic Forecast</strong> <em>Your weekly energy reading. Moon phases, planetary shifts, and what they mean for your body and your week ahead.</em></p>
            <p className="rl-body"><strong>Wednesday Signal Check</strong> <em>A midweek nervous system check-in. Short, grounding, practical. The pause you did not know you needed.</em></p>
            <p className="rl-body"><strong>Monthly Reset Story</strong> <em>A long-form piece. Real women. Real turning points. Written with care and without filter.</em></p>
            <p className="rl-body"><strong>Monthly Contributor Feature</strong> <em>A guest voice. A coach, therapist, artist, or someone with a story worth hearing.</em></p>
          </div>
        </section>

        {/* Voices & Contributors */}
        <section className="rl-section">
          <h2 className="rl-section-title">VOICES &amp; CONTRIBUTORS</h2>
          <div className="rl-section-body">
            <p className="rl-body">Reset Letters is not a solo project. It is a magazine. That means multiple voices, different perspectives, and the kind of editorial range that keeps things honest.</p>
            <p className="rl-body">Contributors include coaches, therapists, nutritionists, astrologers, designers, mothers, founders, and women who have simply lived through something worth sharing. Some are well known. Some are not. All of them are real.</p>
            <p className="rl-body">If you would like to contribute, or know someone who should, get in touch at hello@annalouwellness.com.</p>
          </div>
        </section>

        {/* A Bit About Anna */}
        <section className="rl-section">
          <h2 className="rl-section-title">A BIT ABOUT ANNA</h2>
          <div className="rl-section-body">
            <p className="rl-body">Anna Lou Scaife is a somatic coach, nervous system specialist, and jewellery designer based in London. She has spent 25 years working with women through every kind of transition. Divorce. Career change. Motherhood. Burnout. Identity loss. Coming back to life. She created Reset Letters because she wanted a space that did not belong to social media. Something slower. Something you could read with a cup of tea on Sunday morning and actually feel different afterwards.</p>
          </div>
        </section>

        {/* Launch date */}
        <div className="rl-launch">
          <p className="rl-launch-label">LAUNCHING</p>
          <p className="rl-launch-date">22 JUNE 2026</p>
        </div>

        {/* Founding Member offer */}
        <section className="rl-founder-card">
          <p className="rl-founder-eyebrow">FOUNDING MEMBER OFFER</p>
          <h3 className="rl-founder-headline">First 500 subscribers join free, for life.</h3>
          <p className="rl-body" style={{ textAlign: 'center' }}>After the first 500, Reset Letters will cost £7 per month. But if you sign up before launch, you get everything. For ever. No catch.</p>

          <ul className="rl-benefits">
            <li><span className="rl-check">&#10003;</span> Full access to every edition, including paid content</li>
            <li><span className="rl-check">&#10003;</span> Early access to Anna&apos;s events, retreats, and new products</li>
            <li><span className="rl-check">&#10003;</span> Founding Member badge on your Substack profile</li>
            <li><span className="rl-check">&#10003;</span> Access to the private Reset Letters community thread</li>
            <li><span className="rl-check">&#10003;</span> A personal welcome email from Anna</li>
          </ul>

          {/* Email signup form */}
          <form className="rl-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="rl-input"
              required
              aria-label="Email address"
            />
            <button type="submit" className="rl-submit" disabled={submitting}>
              {submitting ? 'CLAIMING...' : 'CLAIM MY FOUNDER PLACE'}
            </button>
          </form>

          <p className="rl-privacy">We respect your privacy. Unsubscribe any time.<br />Powered by Substack.</p>
        </section>

        {/* Footer */}
        <footer className="rl-footer">
          <a href="https://www.instagram.com/annalouwellness" target="_blank" rel="noopener noreferrer" className="rl-insta">
            FOLLOW ON INSTAGRAM &rarr;
          </a>
          <p className="rl-copyright">&copy; {new Date().getFullYear()} Anna Lou Wellness</p>
        </footer>
      </div>
    </>
  );
}

const holdingStyles = `
* { margin:0; padding:0; box-sizing:border-box; }

.rl-page {
  background: #F1EAE0;
  color: #231F20;
  font-family: 'Poppins', sans-serif;
  min-height: 100vh;
  max-width: 720px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

/* Header / Brand lockup */
.rl-header { text-align:center; margin-bottom:2.5rem; }
.rl-alw-logo { height:40px; width:auto; margin-bottom:0.4rem; display:inline-block; }
.rl-tagline {
  font-family:'Poppins',sans-serif;
  font-weight:400;
  font-size:0.55rem;
  letter-spacing:0.35em;
  color:#A67C3A;
}

/* Coming Soon */
.rl-coming-soon {
  text-align:center;
  font-family:'Poppins',sans-serif;
  font-weight:500;
  font-size:1rem;
  letter-spacing:0.2em;
  color:#231F20;
  margin-bottom:1.5rem;
}

/* Wordmark */
.rl-wordmark { text-align:center; margin-bottom:1.2rem; }
.rl-word {
  font-family:'Poppins',sans-serif;
  font-weight:900;
  font-size:clamp(3rem,8vw,5rem);
  line-height:0.95;
  letter-spacing:0.02em;
  display:block;
}
.rl-word span { display:inline-block; }

/* Strapline */
.rl-strapline {
  text-align:center;
  font-family:'Lora',Georgia,serif;
  font-style:italic;
  font-size:clamp(1.2rem,3vw,1.8rem);
  color:#231F20;
  margin-bottom:3rem;
  line-height:1.4;
}

/* Hero */
.rl-hero {
  display:grid;
  grid-template-columns:1fr 1.2fr;
  gap:2rem;
  align-items:start;
  margin-bottom:3rem;
}
.rl-hero-photo { }
.rl-hero-img {
  width:100%;
  aspect-ratio:4/5;
  object-fit:cover;
  object-position:center top;
  border-radius:6px;
}
.rl-hero-headline {
  font-family:'Lora',Georgia,serif;
  font-style:italic;
  font-weight:400;
  font-size:clamp(1.3rem,2.5vw,1.7rem);
  line-height:1.45;
  color:#231F20;
  margin-bottom:1.2rem;
}

/* Body text */
.rl-body {
  font-family:'Poppins',sans-serif;
  font-weight:300;
  font-size:0.92rem;
  line-height:1.8;
  color:#231F20;
  margin-bottom:1rem;
}
.rl-body strong { font-weight:600; }
.rl-body em { font-family:'Lora',Georgia,serif; font-style:italic; }

/* Sections */
.rl-section { margin-bottom:2.5rem; text-align:center; }
.rl-section-title {
  font-family:'Poppins',sans-serif;
  font-weight:600;
  font-size:0.7rem;
  letter-spacing:0.25em;
  text-transform:uppercase;
  color:#231F20;
  margin-bottom:1.2rem;
}
.rl-section-body { max-width:600px; margin:0 auto; }
.rl-section-body .rl-body { text-align:center; }

/* Launch date */
.rl-launch { text-align:center; margin-bottom:2.5rem; }
.rl-launch-label {
  font-family:'Poppins',sans-serif;
  font-weight:400;
  font-size:0.6rem;
  letter-spacing:0.2em;
  color:#666;
  margin-bottom:0.3rem;
}
.rl-launch-date {
  font-family:'Poppins',sans-serif;
  font-weight:700;
  font-size:clamp(2rem,5vw,3rem);
  color:#231F20;
  letter-spacing:0.05em;
}

/* Founding Member card */
.rl-founder-card {
  background:#fff;
  border:2px solid #F280AA;
  border-radius:12px;
  padding:2.5rem 2rem;
  margin-bottom:2.5rem;
  text-align:center;
}
.rl-founder-eyebrow {
  font-family:'Poppins',sans-serif;
  font-weight:500;
  font-size:0.6rem;
  letter-spacing:0.25em;
  color:#F280AA;
  margin-bottom:0.8rem;
}
.rl-founder-headline {
  font-family:'Lora',Georgia,serif;
  font-style:italic;
  font-weight:400;
  font-size:clamp(1.3rem,2.5vw,1.6rem);
  color:#231F20;
  margin-bottom:1rem;
  line-height:1.4;
}

/* Benefits list */
.rl-benefits {
  list-style:none;
  text-align:left;
  max-width:460px;
  margin:1.5rem auto;
  padding:0;
}
.rl-benefits li {
  font-family:'Poppins',sans-serif;
  font-weight:300;
  font-size:0.85rem;
  color:#231F20;
  padding:0.5rem 0;
  display:flex;
  align-items:flex-start;
  gap:0.7rem;
  line-height:1.5;
}
.rl-check {
  color:#5DCAA5;
  font-weight:700;
  font-size:1rem;
  flex-shrink:0;
  margin-top:0.1rem;
}

/* Email form */
.rl-form {
  max-width:460px;
  margin:1.5rem auto 1rem;
}
.rl-input {
  width:100%;
  height:60px;
  border:2px solid #231F20;
  border-radius:6px;
  padding:0 1.2rem;
  font-family:'Poppins',sans-serif;
  font-weight:300;
  font-size:0.9rem;
  color:#231F20;
  background:transparent;
  outline:none;
  margin-bottom:0.8rem;
  transition:border-color 0.3s;
}
.rl-input::placeholder { color:#999; }
.rl-input:focus { border-color:#F280AA; }
.rl-submit {
  width:100%;
  height:60px;
  background:#231F20;
  color:#fff;
  border:none;
  border-radius:6px;
  font-family:'Poppins',sans-serif;
  font-weight:600;
  font-size:0.7rem;
  letter-spacing:0.2em;
  text-transform:uppercase;
  cursor:pointer;
  transition:background 0.3s;
}
.rl-submit:hover { background:#3D3D3A; }
.rl-submit:disabled { opacity:0.6; cursor:not-allowed; }

/* Privacy line */
.rl-privacy {
  font-family:'Poppins',sans-serif;
  font-weight:300;
  font-size:0.72rem;
  color:#666;
  text-align:center;
  line-height:1.6;
}

/* Footer */
.rl-footer {
  text-align:center;
  padding-top:1rem;
  border-top:1px solid rgba(0,0,0,0.06);
}
.rl-insta {
  display:inline-block;
  font-family:'Poppins',sans-serif;
  font-weight:500;
  font-size:0.65rem;
  letter-spacing:0.15em;
  color:#231F20;
  text-decoration:none;
  border:1px solid #231F20;
  padding:0.7rem 1.8rem;
  border-radius:4px;
  transition:all 0.3s;
  margin-bottom:1rem;
}
.rl-insta:hover { background:#231F20; color:#F1EAE0; }
.rl-copyright {
  font-family:'Poppins',sans-serif;
  font-weight:300;
  font-size:0.65rem;
  color:#999;
}

/* Mobile */
@media (max-width:640px) {
  .rl-page { padding:2rem 1.2rem; }
  .rl-hero { grid-template-columns:1fr; gap:1.5rem; }
  .rl-hero-placeholder { max-height:350px; }
  .rl-alw-logo { height:32px; }
  .rl-coming-soon { font-size:0.8rem; }
  .rl-founder-card { padding:1.8rem 1.2rem; }
  .rl-input, .rl-submit { height:54px; }
}
`;
