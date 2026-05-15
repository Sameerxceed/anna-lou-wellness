import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Workshop replays — Reset Room',
  robots: { index: false, follow: false },
};

export default async function ReplaysPage() {
  const session = await getSession();
  if (!session) redirect('/login?next=/community/reset-room/replays');
  if (!session.isMember) redirect('/community/reset-room');

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />
      <section className="rp-page">
        <div className="rp-inner">
          <p className="rp-eyebrow">Reset Room · Workshop replays</p>
          <h1 className="rp-title">Every workshop, free for you inside.</h1>
          <p className="rp-sub"><em>Each one a small reset. Watch what calls.</em></p>

          <div className="rp-empty">
            <p>Workshop replays will appear here as Anna releases them.</p>
            <p className="rp-empty-sub">First batch coming with the public launch.</p>
            <Link href="/community/reset-room/dashboard" className="rp-back">&larr; Back to dashboard</Link>
          </div>
        </div>
      </section>
    </>
  );
}

const pageStyles = `
.rp-page { background: #F1EAE0; padding: 3rem 2rem 4rem; min-height: 70vh; }
.rp-inner { max-width: 1100px; margin: 0 auto; }
.rp-eyebrow { font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.6rem; letter-spacing: 0.28em; text-transform: uppercase; color: #6E3A5A; margin-bottom: 0.6rem; }
.rp-title { font-family: 'EB Garamond', Georgia, serif; font-weight: 400; font-size: clamp(1.8rem, 4vw, 2.6rem); color: #231F20; margin-bottom: 0.3rem; }
.rp-sub { font-family: 'EB Garamond', Georgia, serif; font-size: 1rem; color: #8C8880; margin-bottom: 2.4rem; }
.rp-empty { background: #fff; padding: 3rem 2rem; border-radius: 6px; text-align: center; }
.rp-empty p { font-family: 'EB Garamond', Georgia, serif; font-size: 1rem; color: #3D3D3A; margin-bottom: 0.5rem; }
.rp-empty-sub { color: #8C8880 !important; font-size: 0.9rem !important; margin-bottom: 1.5rem !important; }
.rp-back { display: inline-block; margin-top: 1rem; font-family: Mulish, sans-serif; font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; color: #6E3A5A; text-decoration: none; padding: 0.6rem 1.2rem; border: 1px solid #6E3A5A; border-radius: 3px; }
.rp-back:hover { background: #6E3A5A; color: #fff; }
`;
