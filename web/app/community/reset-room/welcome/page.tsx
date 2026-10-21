import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Welcome to the Reset Room',
  robots: { index: false, follow: false },
};

/**
 * Post-checkout landing for new Reset Room members.
 *
 * Previously the Stripe success_url pointed straight at the member
 * dashboard, which requires login. A brand-new member had just paid
 * but didn't have a password yet (one is auto-emailed to them by the
 * Strapi webhook flow a few seconds later) — so they hit a login wall
 * and often thought the payment had failed. This page sits between
 * payment and the dashboard, sets expectations, and tells them where
 * to look for their login email.
 *
 * The webhook also fires `customer_reset_room_welcome` which is a
 * branded email from Anna — that's what guides the login journey. This
 * page is the holding bay for the ~30 seconds between landing here and
 * the email arriving.
 */

export default function ResetRoomWelcomePage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <section className="rrw-page">
        <div className="rrw-inner">
          <p className="rrw-kicker">The Reset Room</p>
          <h1 className="rrw-title">
            <em>Welcome home.</em>
          </h1>
          <p className="rrw-lede">
            Your membership is active. You will be charged £25 on the same date each month, and you can cancel any time from your account.
          </p>

          <div className="rrw-steps">
            <div className="rrw-step">
              <span className="rrw-step-num">1</span>
              <div>
                <h2>Check your email</h2>
                <p>
                  We have just sent you a short welcome note from Anna and a link to set your password. If you don't see it in the next couple of minutes, check your spam folder. The password link is valid for 24 hours.
                </p>
              </div>
            </div>
            <div className="rrw-step">
              <span className="rrw-step-num">2</span>
              <div>
                <h2>Set your password</h2>
                <p>
                  One login works everywhere on this site — Reset Room, workshop replays, and anything else you buy later. The link in the email will take you straight to the right place.
                </p>
              </div>
            </div>
            <div className="rrw-step">
              <span className="rrw-step-num">3</span>
              <div>
                <h2>Log in and look around</h2>
                <p>
                  The Vault, replays, monthly Signal Check, and the next live-call schedule are all behind the sign-in. Take your time. This is somewhere to come back to, not somewhere to rush through.
                </p>
              </div>
            </div>
          </div>

          <div className="rrw-ctas">
            <Link href="/login?next=/community/reset-room/dashboard" className="rrw-cta rrw-cta-primary">
              I've set my password — log in →
            </Link>
            <Link href="/community/reset-room" className="rrw-cta rrw-cta-secondary">
              Back to the Reset Room overview
            </Link>
          </div>

          <p className="rrw-foot">
            Anything not working? Email <a href="mailto:hello@annalouwellness.com">hello@annalouwellness.com</a> and someone will get back to you.
          </p>
        </div>
      </section>
    </>
  );
}

const styles = `
.rrw-page { background:#F5F3EF; padding:3rem 1.5rem 4rem; }
.rrw-inner { max-width:720px; margin:0 auto; }
.rrw-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.65rem; letter-spacing:0.22em; text-transform:uppercase; color:#6E3A5A; margin:0 0 0.6rem; text-align:center; }
.rrw-title { font-family:'EB Garamond',Georgia,serif; font-weight:400; font-size:clamp(1.9rem,4vw,2.6rem); color:#231F20; line-height:1.25; margin:0 0 1rem; text-align:center; }
.rrw-title em { font-style:italic; }
.rrw-lede { font-family:'EB Garamond',Georgia,serif; font-size:1.1rem; line-height:1.7; color:#3D3D3A; text-align:center; margin:0 0 2.4rem; }
.rrw-steps { background:#fff; border-radius:8px; padding:1.6rem 1.8rem; border:1px solid rgba(0,0,0,0.05); }
.rrw-step { display:flex; gap:1rem; align-items:flex-start; padding:0.8rem 0; }
.rrw-step + .rrw-step { border-top:1px solid rgba(0,0,0,0.05); }
.rrw-step-num { flex-shrink:0; width:28px; height:28px; display:inline-flex; align-items:center; justify-content:center; background:#6E3A5A; color:#fff; border-radius:50%; font-family:Mulish,sans-serif; font-weight:600; font-size:0.85rem; }
.rrw-step h2 { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:500; font-size:1rem; color:#231F20; margin:0 0 0.3rem; }
.rrw-step p { font-family:'EB Garamond',Georgia,serif; font-size:0.98rem; line-height:1.6; color:#3D3D3A; margin:0; }
.rrw-ctas { display:flex; flex-direction:column; gap:0.6rem; align-items:center; margin:2.4rem 0 1.6rem; }
.rrw-cta { font-family:Mulish,sans-serif; font-weight:500; font-size:0.7rem; letter-spacing:0.14em; text-transform:uppercase; padding:0.85rem 1.8rem; border-radius:3px; text-decoration:none; transition:all 0.2s; display:inline-block; }
.rrw-cta-primary { background:#6E3A5A; color:#fff; border:1px solid #6E3A5A; }
.rrw-cta-primary:hover { background:#5A2E4A; }
.rrw-cta-secondary { color:#6E3A5A; border:1px solid rgba(110,58,90,0.3); background:transparent; }
.rrw-cta-secondary:hover { background:rgba(110,58,90,0.05); }
.rrw-foot { font-family:'EB Garamond',Georgia,serif; font-size:0.95rem; color:#5D5A52; text-align:center; margin:1.6rem 0 0; }
.rrw-foot a { color:#6E3A5A; text-decoration:underline; }
`;
