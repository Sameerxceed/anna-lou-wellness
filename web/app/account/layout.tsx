import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import AccountSidebar from '@/components/AccountSidebar';

/**
 * Shared shell for every /account/* page.
 *
 * - Auth-gates the whole section (redirects to /login if no session).
 * - Renders a two-column grid: sticky sidebar on the left, page content
 *   on the right. Collapses to a single column on mobile with the sidebar
 *   nav becoming a horizontal tab bar.
 * - Passes greeting + email to the sidebar; picks the first non-empty of
 *   firstName -> username -> local-part of email (avoids showing weird
 *   auto-generated usernames like "sameer1-53ow00" if we have better data).
 */
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect('/login?next=/account');
  }
  const { user } = session;
  const greeting =
    (user.firstName && user.firstName.trim()) ||
    (user.username && !/^\w+\d+-\w+$/.test(user.username) ? user.username : '') ||
    user.email.split('@')[0];

  return (
    <section className="acct-shell">
      <div className="acct-shell-inner">
        <AccountSidebar greeting={greeting} email={user.email} />
        <div className="acct-shell-main">{children}</div>
      </div>
      <style>{`
        .acct-shell {
          background: #f5f3ef;
          min-height: calc(100vh - 200px);
          padding: 3rem 1.5rem 5rem;
        }
        .acct-shell-inner {
          max-width: 1120px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 2rem;
          align-items: start;
        }
        .acct-shell-main {
          background: #fff;
          border: 1px solid #ece6dc;
          padding: 2.5rem;
          min-height: 480px;
        }
        @media (max-width: 860px) {
          .acct-shell-inner { grid-template-columns: 1fr; gap: 1rem; }
          .acct-shell-main { padding: 1.5rem; }
        }
      `}</style>
    </section>
  );
}
