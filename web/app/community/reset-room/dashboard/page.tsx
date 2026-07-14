import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { fetchUserPurchasedRecordings } from '@/lib/strapi-admin';

export const metadata: Metadata = {
  title: 'Your account',
  robots: { index: false, follow: false },
};

/**
 * Members area — everything the logged-in user has paid for, in one place.
 *
 * Access model (OOOM Academy pattern): any logged-in user who has ANY
 * access lands here. Sections show/hide based on what they actually have:
 *  - Reset Room cards → only if isMember (reset-room-member role)
 *  - Circle Recordings → only if user has purchased_recordings
 *  - REGULATED → only if hasRegulatedAccess
 *
 * A logged-in user with nothing at all gets bounced to /community
 * (they must have picked the wrong login somehow — nothing to show them).
 */
export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login?next=/community/reset-room/dashboard');

  const { user, isMember, hasRegulatedAccess } = session;
  const recordings = await fetchUserPurchasedRecordings(user.id);
  const hasRecordings = recordings.length > 0;

  // Nothing to show — send them back to the community hub.
  if (!isMember && !hasRegulatedAccess && !hasRecordings) {
    redirect('/community');
  }

  const firstName = user.firstName || (user.email ? user.email.split('@')[0] : 'there');
  const memberSinceMonth = user.memberSince
    ? new Date(user.memberSince).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : null;
  const daysSinceJoin = user.memberSince
    ? Math.floor((Date.now() - new Date(user.memberSince).getTime()) / 86400000)
    : 0;
  const showWelcomeBlock = isMember && daysSinceJoin <= 30;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: dashStyles }} />

      <section className="dash-page">
        <div className="dash-inner">
          <p className="dash-eyebrow">
            {isMember ? 'Reset Room · Member portal' : 'Your account'}
          </p>
          <h1 className="dash-greeting">Welcome back, {firstName}.</h1>
          <p className="dash-sub">
            <em>Everything you have access to, in one place.</em>
            {isMember && memberSinceMonth && (
              <span className="dash-since"> · Member since {memberSinceMonth}</span>
            )}
          </p>

          {/* Reset Room three-pillar row — members only */}
          {isMember && (
          <div className="dash-grid">
            <article className="dash-card" style={{ borderTopColor: '#F280AA' }}>
              <p className="dash-card-kicker">01 · Sessions</p>
              <h3 className="dash-card-name">Reset Room Sessions</h3>
              <p className="dash-card-body">Two new intimate sessions a month. Watch inside the room, anytime.</p>
              <div className="dash-card-meta">
                <span>Latest:</span> <em>The first founding session</em>
              </div>
              <Link href="/community/reset-room/sessions" className="dash-card-btn">Watch sessions &rarr;</Link>
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
          )}

          {/* Circle Recordings — one per row per week the user has bought */}
          {hasRecordings && (
          <div className="dash-recordings">
            <p className="dash-section-label">Your Returning Circle recordings</p>
            <h2 className="dash-section-title">
              {recordings.length === 1 ? '1 recording in your library.' : `${recordings.length} recordings in your library.`}
            </h2>
            <div className="dash-recording-list">
              {recordings.map((r) => {
                const dateLabel = r.session_date
                  ? new Date(r.session_date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '';
                return (
                  <article key={r.id} className="dash-recording">
                    <div className="dash-recording-text">
                      <p className="dash-recording-kicker">Returning Circle · {dateLabel}</p>
                      <h3 className="dash-recording-title">{r.title}</h3>
                      {r.description && <p className="dash-recording-desc">{r.description}</p>}
                    </div>
                    {r.youtube_url ? (
                      <a
                        href={r.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dash-card-btn"
                      >
                        Watch &rarr;
                      </a>
                    ) : (
                      <span className="dash-recording-pending">Uploading…</span>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
          )}

          {/* REGULATED link — one-off buyers */}
          {hasRegulatedAccess && (
          <div className="dash-single">
            <article className="dash-card" style={{ borderTopColor: '#C4704A' }}>
              <p className="dash-card-kicker">REGULATED</p>
              <h3 className="dash-card-name">Your REGULATED course</h3>
              <p className="dash-card-body">Lifetime access to every module.</p>
              <Link href="/regulated" className="dash-card-btn">Continue &rarr;</Link>
            </article>
          </div>
          )}

          {/* Where to start — first 30 days only, Reset Room members only */}
          {showWelcomeBlock && (
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
          )}

          {/* Member benefits row — Reset Room members only */}
          {isMember && (
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
          )}

          {/* Prompt for non-members with only recordings — invite them into the room */}
          {!isMember && hasRecordings && (
          <div className="dash-invite">
            <p className="dash-section-label">Want more?</p>
            <h2 className="dash-section-title">Step inside the Reset Room.</h2>
            <p className="dash-invite-body">
              Two new sessions a month, a monthly live call with Anna, the full Vault of signature journeys. Members-only rooms that never go on the public calendar.
            </p>
            <Link href="/community/reset-room" className="dash-card-btn">Learn more &rarr;</Link>
          </div>
          )}

          <div className="dash-footer-links">
            {isMember && (
              <>
                <Link href="/community/reset-room/vault">The Vault</Link>
                <span>·</span>
                <Link href="/community/reset-room/replays">Workshop replays</Link>
                <span>·</span>
              </>
            )}
            <Link href="/community/reset-room/account">Account</Link>
            <span>·</span>
            <Link href="/community/the-returning-circle">Returning Circle</Link>
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
.dash-since { font-style: normal; color: #8C8880; font-size: 0.9rem; margin-left: 0.4rem; }

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

/* Circle recordings library */
.dash-recordings { background: #fff; padding: 1.8rem 1.6rem; border-radius: 8px; margin-bottom: 2rem; }
.dash-recording-list { display: flex; flex-direction: column; gap: 0.7rem; }
.dash-recording {
  display: flex; align-items: center; justify-content: space-between;
  gap: 1rem; padding: 1rem 1.2rem; border: 1px solid rgba(0,0,0,0.06); border-radius: 6px;
  background: #FAFAF7;
}
.dash-recording-text { flex: 1; min-width: 0; }
.dash-recording-kicker {
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.55rem; letter-spacing: 0.22em; text-transform: uppercase;
  color: #5DCAA5; margin-bottom: 0.3rem;
}
.dash-recording-title {
  font-family: 'Work Sans', sans-serif; font-weight: 400;
  font-size: 1.05rem; color: #231F20; margin: 0 0 0.25rem;
}
.dash-recording-desc {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 0.9rem; line-height: 1.5; color: #5D5A52; margin: 0;
}
.dash-recording-pending {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 0.9rem; color: #8C8880; font-style: italic;
}

/* Single-card wrapper (REGULATED etc.) */
.dash-single { display: grid; grid-template-columns: 1fr; margin-bottom: 2rem; }
.dash-single .dash-card { max-width: 380px; }

/* Non-member invite block */
.dash-invite { background: #fff; padding: 1.8rem 1.6rem; border-radius: 8px; margin-bottom: 2rem; }
.dash-invite-body {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 1rem; line-height: 1.6; color: #3D3D3A; margin-bottom: 1rem;
}
.dash-invite .dash-card-btn { display: inline-block; }

@media (max-width: 900px) {
  .dash-grid, .dash-where-grid, .dash-benefits { grid-template-columns: 1fr; }
  .dash-recording { flex-direction: column; align-items: flex-start; }
}
@media (max-width: 480px) {
  .dash-where-grid { grid-template-columns: repeat(2, 1fr); }
}
`;
