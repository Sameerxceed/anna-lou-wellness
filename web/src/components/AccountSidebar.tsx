'use client';

/**
 * AccountSidebar — the left rail on every /account/* page.
 *
 * Modelled on Araha London's account section: greeting + email at the top,
 * a nav list beneath, and a Sign out CTA at the bottom.
 *
 * Active-page detection uses startsWith so /account/orders/ALW-XYZ also
 * highlights "My orders". Overview highlights only on the exact /account
 * path so it doesn't win on drill-downs.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Props {
  greeting: string;
  email: string;
}

const items: Array<{ label: string; href: string; match: (path: string) => boolean }> = [
  { label: 'Overview',        href: '/account',           match: (p) => p === '/account' },
  { label: 'My orders',       href: '/account/orders',    match: (p) => p.startsWith('/account/orders') },
  { label: 'Addresses',       href: '/account/addresses', match: (p) => p.startsWith('/account/addresses') },
  { label: 'Account details', href: '/account/details',   match: (p) => p.startsWith('/account/details') },
];

export default function AccountSidebar({ greeting, email }: Props) {
  const path = usePathname() || '';

  return (
    <>
      <aside className="acct-sidebar">
        <div className="acct-sidebar-head">
          <div className="acct-sidebar-eyebrow">Account</div>
          <div className="acct-sidebar-hi">Hi, {greeting}</div>
          <div className="acct-sidebar-email">{email}</div>
        </div>
        <nav className="acct-sidebar-nav" aria-label="Account sections">
          {items.map((it) => {
            const active = it.match(path);
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`acct-sidebar-link${active ? ' is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="acct-sidebar-foot">
          <Link href="/account/wishlist" className="acct-sidebar-secondary">Wishlist</Link>
          {/* GET (not POST): the /api/auth/logout POST handler returns
              raw JSON {ok:true} for fetch-based callers; the GET handler
              clears the cookie AND redirects to /. Using a plain anchor
              means the browser follows the redirect back to the homepage
              instead of stopping on the JSON response. */}
          <a href="/api/auth/logout" className="acct-sidebar-signout" role="button">Sign out</a>
        </div>
      </aside>
      <style jsx>{`
        .acct-sidebar {
          background: #fff;
          border: 1px solid #ece6dc;
          padding: 1.75rem 1.5rem;
          position: sticky;
          top: 6rem;
          align-self: start;
        }
        .acct-sidebar-head { padding-bottom: 1rem; border-bottom: 1px solid #ece6dc; margin-bottom: 1rem; }
        .acct-sidebar-eyebrow {
          font-family: 'Josefin Sans', sans-serif;
          font-weight: 300;
          font-size: 0.55rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #a89e91;
          margin-bottom: 0.55rem;
        }
        .acct-sidebar-hi {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          color: #1a1a18;
          line-height: 1.15;
          margin-bottom: 0.35rem;
        }
        .acct-sidebar-email {
          font-family: 'Lora', serif;
          font-size: 0.8rem;
          color: #c4704a;
          word-break: break-all;
        }
        .acct-sidebar-nav { display: flex; flex-direction: column; gap: 0.15rem; }
        .acct-sidebar-link {
          display: block;
          padding: 0.7rem 0.9rem;
          font-family: 'Lora', serif;
          font-size: 0.92rem;
          color: #4a4640;
          text-decoration: none;
          transition: background 0.2s, color 0.2s;
        }
        .acct-sidebar-link:hover { background: #f7f2ea; color: #1a1a18; }
        .acct-sidebar-link.is-active {
          background: #6E3A5A;
          color: #fff;
        }
        .acct-sidebar-foot {
          margin-top: 1.25rem;
          padding-top: 1rem;
          border-top: 1px solid #ece6dc;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .acct-sidebar-secondary {
          font-family: 'Lora', serif;
          font-size: 0.88rem;
          color: #4a4640;
          text-decoration: none;
          padding: 0.4rem 0.9rem;
        }
        .acct-sidebar-secondary:hover { color: #6E3A5A; }
        .acct-sidebar-signout {
          display: block;
          background: none;
          border: 1px solid #c8c4bc;
          color: #4a4640;
          font-family: 'Josefin Sans', sans-serif;
          font-weight: 400;
          font-size: 0.62rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          text-align: center;
          text-decoration: none;
          padding: 0.7rem 1rem;
          cursor: pointer;
          width: 100%;
          box-sizing: border-box;
          transition: border-color 0.2s, color 0.2s;
        }
        .acct-sidebar-signout:hover { border-color: #6E3A5A; color: #6E3A5A; }
        @media (max-width: 860px) {
          .acct-sidebar { position: static; }
          .acct-sidebar-nav { flex-direction: row; overflow-x: auto; gap: 0; border-bottom: 1px solid #ece6dc; margin: 0 -1.5rem; padding: 0 1.5rem; }
          .acct-sidebar-link { white-space: nowrap; padding: 0.7rem 0.9rem; border-bottom: 2px solid transparent; }
          .acct-sidebar-link.is-active { background: none; color: #6E3A5A; border-bottom-color: #6E3A5A; }
        }
      `}</style>
    </>
  );
}
