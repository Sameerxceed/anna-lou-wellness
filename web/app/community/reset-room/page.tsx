import { Metadata } from 'next';
import Link from 'next/link';
import { getStockImage, STOCK } from '@/data/stock-images';

export const metadata: Metadata = {
  title: 'The Reset Room | Monthly Somatic Membership',
  description: 'A monthly membership for women rebuilding the relationship with their own inner guidance system. Private podcast, monthly live call, signature journeys vault. £25/month.',
  alternates: { canonical: '/community/reset-room' },
  openGraph: {
    title: 'The Reset Room — Anna Lou Wellness',
    description: 'Where the work moves from podcast to practice. £25/month. Cancel any time.',
    url: '/community/reset-room',
    type: 'website',
  },
};

export default function ResetRoomPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: roomStyles }} />

      {/* Hero */}
      <section className="rr-hero">
        <div className="rr-hero-grid">
          <div className="rr-hero-inner">
            <p className="rr-eyebrow">Monthly somatic membership</p>
            <h1 className="rr-title">The Reset Room.</h1>
            <p className="rr-tagline"><em>Where the work moves from podcast to practice.</em></p>
            <div className="rr-hero-cta">
              <a href="#join" className="rr-btn-primary">Join the Reset Room &middot; £25/month</a>
              <a href="#whats-inside" className="rr-btn-ghost">See what&apos;s inside &darr;</a>
            </div>
            <div className="rr-hero-strip">
              <span>£25/month</span><span>&middot;</span>
              <span>No minimum term</span><span>&middot;</span>
              <span>Cancel any time</span>
            </div>
          </div>
          <div
            className="rr-hero-photo"
            style={{ backgroundImage: `url('${getStockImage('reset-room', 'reset-room-hero')}')` }}
          />
        </div>
      </section>

      {/* Opening body */}
      <section className="rr-intro">
        <div className="rr-intro-inner">
          <p className="rr-intro-lead">The Reset Letters are the front door. The Reset Room is the room behind it.</p>
          <p className="rr-intro-body">This is where the work stops being something you read and starts being something you practice. A members-only podcast, a monthly live call with me, and a growing vault of guided journeys. All for £25 a month.</p>
        </div>
      </section>

      {/* Three pillars — colour-blocked cards */}
      <section className="rr-pillars" id="whats-inside">
        <div className="rr-pillars-header">
          <p className="rr-section-label">What&apos;s inside</p>
          <h2 className="rr-section-title">Three pillars. One quiet room.</h2>
        </div>
        <div className="rr-pillar-grid">
          <article className="rr-pillar rr-p-cream">
            <div className="rr-pillar-num">01</div>
            <p className="rr-pillar-kicker">The Private Podcast</p>
            <h3 className="rr-pillar-name">Reset Room Sessions</h3>
            <p className="rr-pillar-body">A members-only podcast. Two new intimate episodes a month, the conversations that do not belong on the public feed. Listen where you already listen — Apple, Spotify, Overcast.</p>
            <ul className="rr-pillar-list">
              <li>2 new episodes / month</li>
              <li>Private RSS — your player, your way</li>
              <li>Founding episodes already inside</li>
            </ul>
          </article>

          <article className="rr-pillar rr-p-pink">
            <div className="rr-pillar-num">02</div>
            <p className="rr-pillar-kicker">The Monthly Live</p>
            <h3 className="rr-pillar-name">The Reset Call</h3>
            <p className="rr-pillar-body">Ninety minutes with me, live on Zoom, first Thursday of every month. Bring your questions, sit with the group, leave with what you came for. Replay sent the next day.</p>
            <ul className="rr-pillar-list">
              <li>1st Thursday, 7.30pm UK</li>
              <li>90 minutes, group format</li>
              <li>Replay in the Vault by Friday</li>
            </ul>
          </article>

          <article className="rr-pillar rr-p-blue">
            <div className="rr-pillar-num">03</div>
            <p className="rr-pillar-kicker">The Signature Journeys</p>
            <h3 className="rr-pillar-name">The Reset Vault</h3>
            <p className="rr-pillar-body">A growing library of guided somatic journeys. Music, breath, visualisation, embodiment. New piece every month. Where insight becomes the actual life.</p>
            <ul className="rr-pillar-list">
              <li>7 founding journeys ready</li>
              <li>1 new piece every month</li>
              <li>Audio + video + downloadable</li>
            </ul>
          </article>
        </div>
      </section>

      {/* Also included — playful colour band */}
      <section className="rr-extras">
        <div className="rr-extras-inner">
          <p className="rr-section-label rr-on-dark">Also included</p>
          <h2 className="rr-section-title rr-on-dark">The room comes with the rest of the house.</h2>
          <div className="rr-extras-grid">
            <div className="rr-extra">
              <div className="rr-extra-dot" style={{ background: '#FFD07A' }} />
              <h4>Workshop replays</h4>
              <p>Every workshop I have ever run, free for you inside.</p>
            </div>
            <div className="rr-extra">
              <div className="rr-extra-dot" style={{ background: '#5DCAA5' }} />
              <h4>Retreat early access</h4>
              <p>48-hour members-only window on every new retreat before it goes public.</p>
            </div>
            <div className="rr-extra">
              <div className="rr-extra-dot" style={{ background: '#F280AA' }} />
              <h4>10% off all 1:1 work</h4>
              <p>Member rate on all Reset Sessions and One Day intensives.</p>
            </div>
            <div className="rr-extra">
              <div className="rr-extra-dot" style={{ background: '#7BAFDD' }} />
              <h4>Members-only events</h4>
              <p>Quiet rooms that never go on the public calendar.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Founding journeys preview */}
      <section className="rr-vault">
        <div className="rr-vault-inner">
          <p className="rr-section-label">Day one in the Vault</p>
          <h2 className="rr-section-title">Seven founding journeys, ready when you join.</h2>
          <p className="rr-vault-sub">Hand-built, recorded, and inside the Vault from the day you walk in.</p>
          <div className="rr-vault-grid">
            {[
              { name: 'Coming Back Online', length: '12 min', tone: '#F280AA' },
              { name: 'The Three Mantras', length: '8 min', tone: '#FFD07A' },
              { name: 'The Body That Has Been Holding It', length: '18 min', tone: '#7BAFDD' },
              { name: 'The Decision Audit', length: '15 min', tone: '#5DCAA5' },
              { name: 'The Returning', length: '20 min', tone: '#FAA21B' },
              { name: 'The Pattern Underneath', length: '16 min', tone: '#6E3A5A' },
              { name: 'The Houseboat Reset', length: '10 min', tone: '#A67C3A' },
            ].map((j, i) => (
              <div key={i} className="rr-vault-card" style={{ borderLeftColor: j.tone }}>
                <p className="rr-vault-num">{String(i + 1).padStart(2, '0')}</p>
                <h4 className="rr-vault-name">{j.name}</h4>
                <p className="rr-vault-meta">{j.length} &middot; audio + video</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for — quiet section */}
      <section className="rr-who">
        <div className="rr-who-inner">
          <p className="rr-section-label">Who it&apos;s for</p>
          <p className="rr-who-body">The Reset Room is for the woman who has been reading the Reset Letters, listening to the podcast, doing the work on her own, and is ready for something that holds her more closely.</p>
          <p className="rr-who-emphasis"><em>Not therapy. Not a course. A room.</em></p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="rr-final" id="join">
        <div className="rr-final-inner">
          <p className="rr-section-label rr-on-plum">Join</p>
          <h2 className="rr-final-title">Step inside the room.</h2>
          <p className="rr-final-body">£25 a month. No minimum term. Cancel any time. Everything you need is delivered through the podcast player you already use and the member portal you can come back to whenever you want.</p>
          <a href="#" className="rr-btn-large">Join the Reset Room &middot; £25/month &rarr;</a>
          <p className="rr-final-fineprint">Secured by Stripe. Instant access. Unsubscribe in one click from your member portal.</p>
        </div>
      </section>

      {/* FAQ teaser */}
      <section className="rr-faq">
        <div className="rr-faq-inner">
          <p className="rr-section-label">Quick answers</p>
          <details className="rr-faq-item">
            <summary>What if I cancel?</summary>
            <p>Your access continues until the end of your current billing month. No questions, no hard sell. You can rejoin any time.</p>
          </details>
          <details className="rr-faq-item">
            <summary>Do I need to use a podcast app?</summary>
            <p>No. Episodes also play directly inside the member dashboard. The podcast player option is there if you prefer it.</p>
          </details>
          <details className="rr-faq-item">
            <summary>Can I join just for one month?</summary>
            <p>Yes. There is no minimum term. Many members do exactly that — come in for a month, do the founding journeys, and decide whether to stay.</p>
          </details>
          <details className="rr-faq-item">
            <summary>Is this a course?</summary>
            <p>No. It is a room. There is no curriculum, no progression path, no feeling behind. You come in when you need it, you take what you need, you stay as long as it serves you.</p>
          </details>
          <details className="rr-faq-item">
            <summary>Is the live call recorded?</summary>
            <p>Yes — the replay lands in the Vault by Friday lunchtime. Live attendance not required. Most members watch the replay.</p>
          </details>
        </div>
      </section>
    </>
  );
}

const roomStyles = `
/* ═══ HERO ═══ */
.rr-hero {
  background: linear-gradient(160deg, #F1EAE0 0%, #F5F0E8 100%);
  padding: 4rem 2rem 3rem;
  position: relative;
  overflow: hidden;
}
.rr-hero::before, .rr-hero::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.4;
  pointer-events: none;
}
.rr-hero::before { width: 240px; height: 240px; background: #F280AA; top: -60px; left: -60px; }
.rr-hero::after { width: 280px; height: 280px; background: #7BAFDD; bottom: -80px; right: -80px; }
.rr-hero-grid {
  max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 0.9fr; gap: 3rem; align-items: center;
  position: relative; z-index: 1;
}
.rr-hero-inner { max-width: 600px; }
.rr-hero-photo {
  aspect-ratio: 4/5; max-height: 480px;
  background-size: cover; background-position: center;
  border-radius: 8px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.12);
}
@media (max-width: 900px) {
  .rr-hero-grid { grid-template-columns: 1fr; gap: 2rem; }
  .rr-hero-inner { text-align: center; margin: 0 auto; }
  .rr-hero-photo { max-height: 320px; aspect-ratio: 16/10; }
}
.rr-eyebrow {
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.65rem; letter-spacing: 0.32em; text-transform: uppercase;
  color: #6E3A5A; margin-bottom: 0.8rem;
}
.rr-title {
  font-family: 'Work Sans', sans-serif; font-weight: 300;
  font-size: clamp(3rem, 8vw, 5.5rem); line-height: 1; letter-spacing: 0.04em;
  color: #231F20; margin-bottom: 0.6rem;
}
.rr-tagline {
  font-family: 'EB Garamond', Georgia, serif; font-style: italic;
  font-size: clamp(1.2rem, 2.6vw, 1.7rem); color: #3D3D3A; margin-bottom: 2rem;
}
.rr-hero-cta { display: flex; gap: 0.8rem; justify-content: center; flex-wrap: wrap; margin-bottom: 1.5rem; }
.rr-btn-primary {
  display: inline-block;
  background: #6E3A5A; color: #fff;
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.7rem; letter-spacing: 0.18em; text-transform: uppercase;
  padding: 1rem 1.8rem; border-radius: 4px;
  text-decoration: none;
  transition: all 0.3s;
}
.rr-btn-primary:hover { background: #5A2E4A; transform: translateY(-1px); }
.rr-btn-ghost {
  display: inline-block;
  font-family: Mulish, sans-serif; font-weight: 400;
  font-size: 0.7rem; letter-spacing: 0.18em; text-transform: uppercase;
  color: #231F20;
  padding: 1rem 1.4rem;
  text-decoration: none;
  border-bottom: 1px solid #231F20;
}
.rr-hero-strip {
  display: inline-flex; gap: 0.6rem; flex-wrap: wrap; justify-content: center;
  font-family: Mulish, sans-serif; font-weight: 400;
  font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase;
  color: #8C8880;
}

/* ═══ INTRO ═══ */
.rr-intro { background: #fff; padding: 3rem 2rem; text-align: center; }
.rr-intro-inner { max-width: 800px; margin: 0 auto; }
.rr-intro-lead {
  font-family: 'EB Garamond', Georgia, serif; font-style: italic;
  font-size: clamp(1.4rem, 2.8vw, 1.9rem); color: #231F20;
  line-height: 1.4; margin-bottom: 1.2rem;
}
.rr-intro-body {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 1.05rem; line-height: 1.8; color: #3D3D3A;
}

/* ═══ SECTION HEADINGS ═══ */
.rr-section-label {
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.6rem; letter-spacing: 0.28em; text-transform: uppercase;
  color: #6E3A5A; margin-bottom: 0.6rem;
}
.rr-section-label.rr-on-dark { color: #FFD07A; }
.rr-section-label.rr-on-plum { color: #FFD07A; }
.rr-section-title {
  font-family: 'Work Sans', sans-serif; font-weight: 300;
  font-size: clamp(1.8rem, 4vw, 2.6rem); line-height: 1.15;
  color: #231F20; letter-spacing: 0.03em; margin-bottom: 0.6rem;
}
.rr-section-title.rr-on-dark { color: #F1EAE0; }

/* ═══ PILLARS — colour-blocked cards ═══ */
.rr-pillars { background: #F5F3EF; padding: 4rem 2rem; }
.rr-pillars-header { text-align: center; max-width: 720px; margin: 0 auto 2.5rem; }
.rr-pillar-grid {
  max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.2rem;
}
.rr-pillar {
  border-radius: 12px; padding: 2.2rem 1.8rem;
  display: flex; flex-direction: column; gap: 0.8rem;
  transition: transform 0.3s;
}
.rr-pillar:hover { transform: translateY(-4px); }
.rr-p-cream { background: #F1EAE0; }
.rr-p-pink { background: #FCE8EF; }
.rr-p-blue { background: #E5EFF8; }
.rr-pillar-num {
  font-family: 'Work Sans', sans-serif; font-weight: 700;
  font-size: 2.2rem; color: rgba(0,0,0,0.12);
  line-height: 1; letter-spacing: 0.05em;
}
.rr-pillar-kicker {
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.55rem; letter-spacing: 0.22em; text-transform: uppercase;
  color: #6E3A5A;
}
.rr-pillar-name {
  font-family: 'Work Sans', sans-serif; font-weight: 400;
  font-size: 1.4rem; line-height: 1.2; color: #231F20;
}
.rr-pillar-body {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 0.95rem; line-height: 1.7; color: #3D3D3A;
  margin-bottom: 0.4rem;
}
.rr-pillar-list {
  list-style: none; padding: 0; margin: 0;
  border-top: 1px solid rgba(0,0,0,0.08); padding-top: 0.8rem;
}
.rr-pillar-list li {
  font-family: Mulish, sans-serif; font-weight: 400;
  font-size: 0.72rem; color: #3D3D3A; padding: 0.25rem 0;
  position: relative; padding-left: 1rem;
}
.rr-pillar-list li::before {
  content: '+'; position: absolute; left: 0; color: #6E3A5A; font-weight: 700;
}

/* ═══ EXTRAS — dark colour band ═══ */
.rr-extras { background: #231F20; padding: 4rem 2rem; }
.rr-extras-inner { max-width: 1100px; margin: 0 auto; text-align: center; }
.rr-extras-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem;
  margin-top: 2rem;
}
.rr-extra { text-align: left; }
.rr-extra-dot {
  width: 12px; height: 12px; border-radius: 50%;
  margin-bottom: 0.8rem;
}
.rr-extra h4 {
  font-family: 'Work Sans', sans-serif; font-weight: 400;
  font-size: 0.95rem; color: #F1EAE0; margin-bottom: 0.3rem;
}
.rr-extra p {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 0.85rem; line-height: 1.6; color: rgba(241,234,224,0.6);
}

/* ═══ VAULT PREVIEW ═══ */
.rr-vault { background: #fff; padding: 4rem 2rem; }
.rr-vault-inner { max-width: 1100px; margin: 0 auto; text-align: center; }
.rr-vault-sub {
  font-family: 'EB Garamond', Georgia, serif; font-style: italic;
  font-size: 0.95rem; color: #8C8880; margin-bottom: 2rem;
}
.rr-vault-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.8rem;
  text-align: left;
}
.rr-vault-card {
  background: #F5F3EF; padding: 1.2rem 1.2rem 1rem;
  border-left: 3px solid;
  border-radius: 4px;
  transition: transform 0.3s;
}
.rr-vault-card:hover { transform: translateX(2px); }
.rr-vault-num {
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.55rem; letter-spacing: 0.2em; color: #8C8880;
  margin-bottom: 0.3rem;
}
.rr-vault-name {
  font-family: 'Work Sans', sans-serif; font-weight: 400;
  font-size: 0.9rem; color: #231F20; line-height: 1.3; margin-bottom: 0.3rem;
}
.rr-vault-meta {
  font-family: Mulish, sans-serif; font-weight: 300;
  font-size: 0.65rem; letter-spacing: 0.05em; color: #8C8880;
}

/* ═══ WHO ═══ */
.rr-who { background: #F5F3EF; padding: 3.5rem 2rem; text-align: center; }
.rr-who-inner { max-width: 720px; margin: 0 auto; }
.rr-who-body {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 1.1rem; line-height: 1.8; color: #3D3D3A; margin-bottom: 1rem;
}
.rr-who-emphasis {
  font-family: 'EB Garamond', Georgia, serif; font-style: italic;
  font-size: 1.4rem; color: #231F20;
}

/* ═══ FINAL CTA ═══ */
.rr-final { background: #6E3A5A; padding: 4.5rem 2rem; text-align: center; }
.rr-final-inner { max-width: 700px; margin: 0 auto; }
.rr-final-title {
  font-family: 'Work Sans', sans-serif; font-weight: 300;
  font-size: clamp(2rem, 5vw, 3rem); color: #F1EAE0;
  letter-spacing: 0.04em; line-height: 1.15; margin-bottom: 0.8rem;
}
.rr-final-body {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 1.05rem; line-height: 1.8;
  color: rgba(241,234,224,0.75); margin-bottom: 1.8rem;
}
.rr-btn-large {
  display: inline-block;
  background: #FFD07A; color: #231F20;
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.75rem; letter-spacing: 0.18em; text-transform: uppercase;
  padding: 1.2rem 2.4rem; border-radius: 4px;
  text-decoration: none;
  transition: all 0.3s;
  margin-bottom: 1.2rem;
}
.rr-btn-large:hover { background: #FFC15C; transform: translateY(-1px); }
.rr-final-fineprint {
  font-family: Mulish, sans-serif; font-weight: 300;
  font-size: 0.65rem; letter-spacing: 0.05em;
  color: rgba(241,234,224,0.45);
}

/* ═══ FAQ ═══ */
.rr-faq { background: #fff; padding: 3.5rem 2rem; }
.rr-faq-inner { max-width: 700px; margin: 0 auto; }
.rr-faq-item {
  border-bottom: 1px solid rgba(0,0,0,0.08);
  padding: 1rem 0;
}
.rr-faq-item summary {
  font-family: 'Work Sans', sans-serif; font-weight: 400;
  font-size: 1rem; color: #231F20; cursor: pointer;
  list-style: none; display: flex; justify-content: space-between; align-items: center;
}
.rr-faq-item summary::after {
  content: '+'; color: #6E3A5A; font-size: 1.4rem; font-weight: 300;
}
.rr-faq-item[open] summary::after { content: '−'; }
.rr-faq-item p {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 0.95rem; line-height: 1.7; color: #3D3D3A;
  padding: 0.8rem 0 0.4rem;
}

/* ═══ MOBILE ═══ */
@media (max-width: 900px) {
  .rr-pillar-grid { grid-template-columns: 1fr; }
  .rr-extras-grid { grid-template-columns: repeat(2, 1fr); }
  .rr-vault-grid { grid-template-columns: repeat(2, 1fr); }
  .rr-hero { padding: 3rem 1.2rem 2rem; }
  .rr-pillars, .rr-vault, .rr-extras, .rr-who, .rr-final, .rr-faq, .rr-intro { padding-left: 1.2rem; padding-right: 1.2rem; }
}
@media (max-width: 480px) {
  .rr-extras-grid, .rr-vault-grid { grid-template-columns: 1fr; }
  .rr-hero-cta { flex-direction: column; }
  .rr-btn-primary, .rr-btn-ghost { width: 100%; text-align: center; }
}
`;
