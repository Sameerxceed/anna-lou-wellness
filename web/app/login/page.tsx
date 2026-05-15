import { Metadata } from 'next';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Sign in — Anna Lou Wellness',
  description: 'Sign in to your Reset Room member portal.',
  robots: { index: false, follow: false },
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string }>;
}) {
  return <LoginPageInner searchParams={searchParams} />;
}

async function LoginPageInner({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string }>;
}) {
  const { next, reset } = await searchParams;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: loginStyles }} />
      <section className="login-page">
        <div className="login-card">
          <p className="login-eyebrow">Reset Room</p>
          <h1 className="login-title">Sign in.</h1>
          <p className="login-sub"><em>Welcome back. Sit down. The room is open.</em></p>

          {reset === '1' && (
            <div className="login-banner">
              <strong>Check your inbox.</strong>
              <span>If we found your account, we&apos;ve sent a password reset link.</span>
            </div>
          )}

          <LoginForm nextUrl={next || '/community/reset-room/dashboard'} />

          <div className="login-footer">
            <p>Not a member yet? <a href="/community/reset-room">Join the Reset Room</a></p>
          </div>
        </div>
      </section>
    </>
  );
}

const loginStyles = `
.login-page { background: #F1EAE0; min-height: 78vh; display: flex; align-items: center; justify-content: center; padding: 3rem 1rem; }
.login-card { background: #fff; max-width: 420px; width: 100%; padding: 2.4rem 2rem; border-radius: 6px; box-shadow: 0 2px 18px rgba(0,0,0,0.04); }
.login-eyebrow { font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.6rem; letter-spacing: 0.28em; text-transform: uppercase; color: #6E3A5A; margin-bottom: 0.4rem; text-align: center; }
.login-title { font-family: 'EB Garamond', Georgia, serif; font-weight: 400; font-size: 2rem; color: #231F20; text-align: center; margin-bottom: 0.3rem; }
.login-sub { font-family: 'EB Garamond', Georgia, serif; font-size: 0.95rem; color: #8C8880; text-align: center; margin-bottom: 1.8rem; }
.login-banner { background: #E1F5EE; border-left: 3px solid #5DCAA5; padding: 0.8rem 1rem; border-radius: 0 4px 4px 0; margin-bottom: 1.2rem; font-family: 'EB Garamond', Georgia, serif; font-size: 0.9rem; display: flex; flex-direction: column; gap: 0.2rem; }
.login-banner strong { color: #2C7A5C; font-weight: 600; }
.login-banner span { color: #3D3D3A; }
.login-footer { margin-top: 1.4rem; text-align: center; font-family: 'EB Garamond', Georgia, serif; font-size: 0.9rem; color: #8C8880; }
.login-footer a { color: #6E3A5A; text-decoration: underline; }
`;
