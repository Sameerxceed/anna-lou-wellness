import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Member Dashboard',
  robots: { index: false, follow: false },
};

// PLACEHOLDER: real auth gating wired once Stripe webhook + Strapi reset-room-member role are in place.
// For now, this page renders a "coming soon" state visible to anyone, so the URL exists for layout testing.
export default function DashboardPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: dashStyles }} />

      <section className="dash-page">
        <div className="dash-inner">
          <p className="dash-eyebrow">Reset Room · Member portal</p>
          <h1 className="dash-greeting">Welcome back.</h1>
          <p className="dash-sub"><em>The room is open. Take it slowly.</em></p>

          <div className="dash-notice">
            <p className="dash-notice-label">Pre-launch placeholder</p>
            <p>The full member dashboard goes live with the Stripe billing integration. This page exists today so the URL structure is ready.</p>
          </div>

          {/* Three-pillar row */}
          <div className="dash-grid">
            <article className="dash-card" style={{ borderTopColor: '#F280AA' }}>
              <p className="dash-card-kicker">01 · Private Podcast</p>
              <h3 className="dash-card-name">Reset Room Sessions</h3>
              <p className="dash-card-body">Two new intimate episodes a month. Listen in your own player.</p>
              <div className="dash-card-meta">
                <span>Latest:</span> <em>The first founding episode</em>
              </div>
              <button className="dash-card-btn" disabled>Subscribe in your podcast player</button>
            </article>

            <article className="dash-card" style={{ borderTopColor: '#7BAFDD' }}>
              <p className="dash-card-kicker">02 · Monthly Live</p>
              <h3 className="dash-card-name">The Reset Call</h3>
              <p className="dash-card-body">Ninety minutes with Anna, first Thursday of every month.</p>
              <div className="dash-card-meta">
                <span>Next call:</span> <em>To be scheduled</em>
              </div>
              <button className="dash-card-btn" disabled>Watch the last replay</button>
            </article>

            <article className="dash-card" style={{ borderTopColor: '#FFD07A' }}>
              <p className="dash-card-kicker">03 · Signature Journeys</p>
              <h3 className="dash-card-name">The Reset Vault</h3>
              <p className="dash-card-body">Featured journey of the week. Seven founding pieces ready inside.</p>
              <div className="dash-card-meta">
                <span>This week:</span> <em>Coming Back Online (12 min)</em>
              </div>
              <Link href="/community/reset-room/vault" className="dash-card-btn">Browse the Vault &rarr;</Link>
            </article>
          </div>

          {/* Where to start */}
          <div className="dash-where">
            <p className="dash-section-label">Where to start</p>
            <h2 className="dash-section-title">First 30 days, made simple.</h2>
            <div className="dash-where-grid">
              <div className="dash-where-item">
                <p className="dash-where-num">01</p>
                <p>Watch the 90-second welcome from Anna.</p>
              </div>
              <div className="dash-where-item">
                <p className="dash-where-num">02</p>
                <p>Take the 5-minute orientation tour.</p>
              </div>
              <div className="dash-where-item">
                <p className="dash-where-num">03</p>
                <p>Listen to the founding episode of Reset Room Sessions.</p>
              </div>
              <div className="dash-where-item">
                <p className="dash-where-num">04</p>
                <p>Do your first journey: <em>Coming Back Online</em>.</p>
              </div>
            </div>
          </div>

          {/* Member benefits row */}
          <div className="dash-benefits">
            <div className="dash-benefit">
              <p className="dash-b-label">10% off all 1:1 work</p>
              <p>Apply your member discount to Reset Sessions and One Day intensives.</p>
            </div>
            <div className="dash-benefit">
              <p className="dash-b-label">Retreat early access</p>
              <p>See upcoming retreats 48 hours before they go public.</p>
            </div>
            <div className="dash-benefit">
              <p className="dash-b-label">Members-only events</p>
              <p>Rooms that never go on the public calendar.</p>
            </div>
          </div>

          <div className="dash-footer-links">
            <Link href="/community/reset-room/vault">The Vault</Link>
            <span>·</span>
            <Link href="/community/reset-room">About the room</Link>
            <span>·</span>
            <Link href="/account">Manage subscription</Link>
          </div>
        </div>
      </section>
    </>
  );
}

const dashStyles = `
.dash-page { background: #F1EAE0; padding: 3rem 2rem 4rem; min-height: 70vh; }
.dash-inner { max-width: 1100px; margin: 0 auto; }

.dash-eyebrow {
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.6rem; letter-spacing: 0.28em; text-transform: uppercase;
  color: #6E3A5A; margin-bottom: 0.6rem;
}
.dash-greeting {
  font-family: 'Work Sans', sans-serif; font-weight: 300;
  font-size: clamp(2.2rem, 5vw, 3.2rem); color: #231F20;
  letter-spacing: 0.04em; line-height: 1.15; margin-bottom: 0.4rem;
}
.dash-sub {
  font-family: 'EB Garamond', Georgia, serif; font-style: italic;
  font-size: 1.15rem; color: #3D3D3A; margin-bottom: 1.5rem;
}

.dash-notice {
  background: #FFE9C4; border-left: 3px solid #FAA21B;
  padding: 1rem 1.2rem; border-radius: 0 4px 4px 0; margin-bottom: 2rem;
}
.dash-notice-label {
  font-family: Mulish, sans-serif; font-weight: 600;
  font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase;
  color: #FAA21B; margin-bottom: 0.3rem;
}
.dash-notice p {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 0.9rem; color: #3D3D3A; line-height: 1.6;
}

.dash-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;
  margin-bottom: 3rem;
}
.dash-card {
  background: #fff; padding: 1.6rem 1.4rem; border-radius: 8px;
  border-top: 3px solid;
  display: flex; flex-direction: column; gap: 0.5rem;
}
.dash-card-kicker {
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.55rem; letter-spacing: 0.22em; text-transform: uppercase;
  color: #8C8880;
}
.dash-card-name {
  font-family: 'Work Sans', sans-serif; font-weight: 400;
  font-size: 1.1rem; color: #231F20;
}
.dash-card-body {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 0.92rem; line-height: 1.6; color: #3D3D3A;
  margin-bottom: 0.4rem;
}
.dash-card-meta {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 0.85rem; color: #3D3D3A;
  border-top: 1px solid rgba(0,0,0,0.06); padding-top: 0.6rem;
}
.dash-card-meta span {
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.55rem; letter-spacing: 0.18em; text-transform: uppercase;
  color: #8C8880;
}
.dash-card-btn {
  margin-top: 0.6rem; padding: 0.6rem 1rem;
  background: #6E3A5A; color: #fff; border: none; border-radius: 4px;
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase;
  cursor: pointer; text-decoration: none; text-align: center;
  transition: background 0.2s;
}
.dash-card-btn:hover { background: #5A2E4A; }
.dash-card-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.dash-where { background: #fff; padding: 2rem; border-radius: 8px; margin-bottom: 2rem; }
.dash-section-label {
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase;
  color: #6E3A5A; margin-bottom: 0.4rem;
}
.dash-section-title {
  font-family: 'Work Sans', sans-serif; font-weight: 400;
  font-size: 1.4rem; color: #231F20; margin-bottom: 1.2rem;
}
.dash-where-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.dash-where-item {
  padding: 0.8rem 0;
}
.dash-where-num {
  font-family: 'Work Sans', sans-serif; font-weight: 700;
  font-size: 1.4rem; color: #F280AA; line-height: 1; margin-bottom: 0.5rem;
}
.dash-where-item p {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 0.92rem; line-height: 1.5; color: #3D3D3A;
}

.dash-benefits {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;
  margin-bottom: 2rem;
}
.dash-benefit {
  background: #fff; padding: 1.2rem; border-radius: 6px;
}
.dash-b-label {
  font-family: 'Work Sans', sans-serif; font-weight: 500;
  font-size: 0.85rem; color: #231F20; margin-bottom: 0.3rem;
}
.dash-benefit p {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 0.85rem; line-height: 1.5; color: #3D3D3A;
}

.dash-footer-links {
  text-align: center; padding-top: 1.5rem;
  border-top: 1px solid rgba(0,0,0,0.06);
}
.dash-footer-links a {
  font-family: Mulish, sans-serif; font-weight: 400;
  font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase;
  color: #8C8880; text-decoration: none; padding: 0 0.5rem;
}
.dash-footer-links a:hover { color: #6E3A5A; }
.dash-footer-links span { color: #8C8880; padding: 0 0.2rem; }

@media (max-width: 900px) {
  .dash-grid, .dash-where-grid, .dash-benefits { grid-template-columns: 1fr; }
}
@media (max-width: 480px) {
  .dash-where-grid { grid-template-columns: repeat(2, 1fr); }
}
`;
