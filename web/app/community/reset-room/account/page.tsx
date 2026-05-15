import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import AccountActions from './AccountActions';

export const metadata: Metadata = {
  title: 'Account — Reset Room',
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect('/login?next=/community/reset-room/account');
  if (!session.isMember) redirect('/community/reset-room');

  const { user } = session;
  const memberSince = user.memberSince
    ? new Date(user.memberSince).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : '—';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />
      <section className="acc-page">
        <div className="acc-inner">
          <p className="acc-eyebrow">Reset Room · Account</p>
          <h1 className="acc-title">Your account.</h1>
          <p className="acc-sub"><em>Everything in one place.</em></p>

          <div className="acc-grid">
            <div className="acc-card">
              <p className="acc-card-label">Member details</p>
              <dl className="acc-dl">
                <dt>Name</dt>
                <dd>{[user.firstName, user.lastName].filter(Boolean).join(' ') || '—'}</dd>
                <dt>Email</dt>
                <dd>{user.email}</dd>
                <dt>Member since</dt>
                <dd>{memberSince}</dd>
                <dt>Status</dt>
                <dd>{user.subscriptionStatus || 'active'}</dd>
              </dl>
            </div>

            <div className="acc-card">
              <p className="acc-card-label">Subscription</p>
              <p className="acc-card-body">Manage payment method, billing details, and cancellation through the Stripe portal.</p>
              <p className="acc-card-body acc-card-pending"><em>Stripe customer portal link wires up in Phase 2B (Stripe integration).</em></p>
              <button className="acc-btn" disabled>Manage subscription</button>
            </div>

            <div className="acc-card">
              <p className="acc-card-label">Sign out</p>
              <p className="acc-card-body">End your session on this device.</p>
              <AccountActions />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const pageStyles = `
.acc-page { background: #F1EAE0; padding: 3rem 2rem 4rem; min-height: 70vh; }
.acc-inner { max-width: 1100px; margin: 0 auto; }
.acc-eyebrow { font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.6rem; letter-spacing: 0.28em; text-transform: uppercase; color: #6E3A5A; margin-bottom: 0.6rem; }
.acc-title { font-family: 'EB Garamond', Georgia, serif; font-weight: 400; font-size: clamp(1.8rem, 4vw, 2.6rem); color: #231F20; margin-bottom: 0.3rem; }
.acc-sub { font-family: 'EB Garamond', Georgia, serif; font-size: 1rem; color: #8C8880; margin-bottom: 2rem; }
.acc-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; }
.acc-card { background: #fff; padding: 1.6rem; border-radius: 6px; }
.acc-card-label { font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase; color: #6E3A5A; margin-bottom: 0.8rem; }
.acc-card-body { font-family: 'EB Garamond', Georgia, serif; font-size: 0.92rem; color: #3D3D3A; line-height: 1.6; margin-bottom: 0.6rem; }
.acc-card-pending { color: #8C8880; font-size: 0.82rem; }
.acc-dl { display: grid; grid-template-columns: 1fr 1.4fr; gap: 0.5rem 1rem; font-family: 'EB Garamond', Georgia, serif; font-size: 0.92rem; }
.acc-dl dt { color: #8C8880; }
.acc-dl dd { color: #231F20; margin: 0; }
.acc-btn { background: #231F20; color: #F5F3EF; border: none; padding: 0.6rem 1rem; border-radius: 4px; font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; }
.acc-btn:disabled { opacity: 0.5; cursor: not-allowed; }
`;
