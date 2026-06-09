import { Metadata } from 'next';
import ResetForm from './ResetForm';

export const metadata: Metadata = {
  title: 'Set your password — Anna Lou Wellness',
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; welcome?: string }>;
}) {
  const { code = '', welcome } = await searchParams;
  const isWelcome = welcome === '1';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />
      <section className="reset-page">
        <div className="reset-card">
          <p className="reset-eyebrow">{isWelcome ? 'Welcome' : 'Password reset'}</p>
          <h1 className="reset-title">
            {isWelcome ? 'Set your password' : 'Set a new password'}
          </h1>
          <p className="reset-sub">
            {isWelcome
              ? 'One login for the shop, the Reset Room, and any course you buy. Choose a password to finish setting up your account.'
              : 'Choose a new password for your account.'}
          </p>
          {code ? (
            <ResetForm code={code} isWelcome={isWelcome} />
          ) : (
            <p className="reset-error">
              This link is missing the reset code. Please use the link from your email, or{' '}
              <a href="/login">request a fresh reset link</a>.
            </p>
          )}
        </div>
      </section>
    </>
  );
}

const pageStyles = `
.reset-page { min-height: 70vh; display: flex; align-items: center; justify-content: center; padding: 4rem 1.5rem; background: #FAF7F0; }
.reset-card { background: #fff; padding: 3rem 2.5rem; max-width: 440px; width: 100%; border: 1px solid rgba(0,0,0,0.06); }
.reset-eyebrow { font-family: 'Josefin Sans', sans-serif; font-size: 0.62rem; letter-spacing: 0.22em; text-transform: uppercase; color: #c4704a; margin: 0 0 0.6rem; }
.reset-title { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 500; font-size: 1.9rem; color: #231F20; margin: 0 0 0.8rem; line-height: 1.2; }
.reset-sub { font-family: 'EB Garamond', Georgia, serif; font-size: 0.95rem; color: #6e6a62; line-height: 1.6; margin: 0 0 1.8rem; }
.reset-error { font-family: 'EB Garamond', Georgia, serif; font-size: 0.9rem; color: #B33A3A; padding: 0.8rem 1rem; background: #FDE8E8; border-radius: 4px; }
.reset-error a { color: #6E3A5A; }
`;
