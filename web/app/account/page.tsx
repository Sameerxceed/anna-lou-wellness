import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { fetchOrdersForUser, fetchOrdersForEmail } from '@/lib/strapi-admin';

export const metadata: Metadata = {
  title: 'Your account — Anna Lou Wellness',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type AccountSearchParams = { welcome?: string };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<AccountSearchParams>;
}) {
  const { welcome } = await searchParams;
  const session = await getSession();
  if (!session) {
    redirect('/login?next=/account');
  }

  const { user, isMember, hasRegulatedAccess } = session;

  // Pull orders linked to this user; also include any legacy guest orders
  // placed against the same email BEFORE the user record existed (auto-link
  // would be nice but isn't done yet, so fall back to email match).
  const [linkedOrders, emailOrders] = await Promise.all([
    fetchOrdersForUser(user.id),
    fetchOrdersForEmail(user.email),
  ]);
  const seenIds = new Set<number>(linkedOrders.map((o: any) => o.id));
  const orders = [
    ...linkedOrders,
    ...emailOrders.filter((o: any) => !seenIds.has(o.id)),
  ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const greeting = user.firstName || user.username || user.email.split('@')[0];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />
      <section className="acct-page">
        <div className="acct-inner">
          {welcome === '1' && (
            <div className="acct-welcome-banner">
              Welcome — your account is set up. Below are your orders, and you can use this email + password to sign in any time.
            </div>
          )}
          <p className="acct-eyebrow">Your account</p>
          <h1 className="acct-title">Hi {greeting}.</h1>
          <p className="acct-sub">Your orders and anything you have access to, all in one place.</p>

          {(isMember || hasRegulatedAccess) && (
            <div className="acct-quick-links">
              {isMember && (
                <Link href="/community/reset-room/dashboard" className="acct-quick-link">
                  <span className="acct-quick-link-label">Reset Room</span>
                  <span className="acct-quick-link-sub">Vault, replays, account</span>
                </Link>
              )}
              {hasRegulatedAccess && (
                <Link href="/the-work/regulated/access" className="acct-quick-link">
                  <span className="acct-quick-link-label">REGULATED</span>
                  <span className="acct-quick-link-sub">Course access</span>
                </Link>
              )}
            </div>
          )}

          <div className="acct-section">
            <h2 className="acct-h2">Your orders</h2>
            {orders.length === 0 ? (
              <p className="acct-empty">
                No orders yet. <Link href="/shop">Visit the shop</Link>.
              </p>
            ) : (
              <ul className="acct-order-list">
                {orders.map((o: any) => (
                  <OrderRow key={o.id} order={o} />
                ))}
              </ul>
            )}
          </div>

          <div className="acct-section">
            <h2 className="acct-h2">Account</h2>
            <ul className="acct-meta">
              <li><strong>Email:</strong> {user.email}</li>
              {user.firstName && <li><strong>Name:</strong> {user.firstName} {user.lastName || ''}</li>}
            </ul>
            <p className="acct-logout">
              <a href="/api/auth/logout">Sign out</a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function OrderRow({ order }: { order: any }) {
  const items = Array.isArray(order.items) ? order.items : [];
  const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const statusLabel = (order.status || 'pending').replace(/_/g, ' ');
  const total = Number(order.total || 0).toFixed(2);
  return (
    <li className="acct-order">
      <div className="acct-order-head">
        <div>
          <p className="acct-order-num">Order {order.order_number}</p>
          <p className="acct-order-date">{date}</p>
        </div>
        <div className="acct-order-meta">
          <span className={`acct-status acct-status-${order.status || 'pending'}`}>{statusLabel}</span>
          <p className="acct-order-total">£{total}</p>
        </div>
      </div>
      <ul className="acct-order-items">
        {items.map((it: any, i: number) => (
          <li key={i}>{it.name} &times; {it.qty}</li>
        ))}
      </ul>
      {order.tracking_number && order.tracking_url && (
        <p className="acct-tracking">
          <a href={order.tracking_url} target="_blank" rel="noopener">Track parcel: {order.tracking_number}</a>
        </p>
      )}
    </li>
  );
}

const pageStyles = `
.acct-page { min-height: 70vh; padding: 4rem 1.5rem; background: #FAF7F0; }
.acct-inner { max-width: 760px; margin: 0 auto; }
.acct-welcome-banner { background: #EFE4D8; border: 1px solid #c4704a; padding: 1rem 1.2rem; font-family: 'EB Garamond', Georgia, serif; font-size: 0.95rem; color: #4a3a25; line-height: 1.5; margin-bottom: 2rem; }
.acct-eyebrow { font-family: 'Josefin Sans', sans-serif; font-size: 0.62rem; letter-spacing: 0.22em; text-transform: uppercase; color: #c4704a; margin: 0 0 0.6rem; }
.acct-title { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 500; font-size: 2.4rem; color: #231F20; margin: 0 0 0.6rem; line-height: 1.1; }
.acct-sub { font-family: 'EB Garamond', Georgia, serif; font-size: 1rem; color: #6e6a62; line-height: 1.6; margin: 0 0 2rem; }

.acct-quick-links { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2.4rem; }
.acct-quick-link { flex: 1; min-width: 200px; background: #fff; border: 1px solid rgba(0,0,0,0.08); padding: 1rem 1.2rem; text-decoration: none; transition: border-color 0.2s; }
.acct-quick-link:hover { border-color: #6E3A5A; }
.acct-quick-link-label { display: block; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.3rem; color: #231F20; }
.acct-quick-link-sub { display: block; font-family: 'EB Garamond', Georgia, serif; font-size: 0.85rem; color: #6e6a62; margin-top: 0.2rem; }

.acct-section { margin-top: 2.4rem; }
.acct-h2 { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 500; font-size: 1.4rem; color: #231F20; margin: 0 0 1rem; }
.acct-empty { font-family: 'EB Garamond', Georgia, serif; font-size: 0.95rem; color: #6e6a62; }
.acct-empty a { color: #6E3A5A; }

.acct-order-list { list-style: none; padding: 0; margin: 0; }
.acct-order { background: #fff; border: 1px solid rgba(0,0,0,0.08); padding: 1.1rem 1.3rem; margin-bottom: 0.8rem; }
.acct-order-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 0.6rem; }
.acct-order-num { font-family: 'Josefin Sans', sans-serif; font-size: 0.7rem; letter-spacing: 0.14em; text-transform: uppercase; color: #231F20; margin: 0; }
.acct-order-date { font-family: 'EB Garamond', Georgia, serif; font-size: 0.85rem; color: #6e6a62; margin: 0.2rem 0 0; }
.acct-order-meta { text-align: right; }
.acct-order-total { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.2rem; color: #231F20; margin: 0.3rem 0 0; }

.acct-status { display: inline-block; padding: 0.2rem 0.6rem; font-family: Mulish, sans-serif; font-size: 0.55rem; letter-spacing: 0.14em; text-transform: uppercase; border-radius: 3px; background: #efe4d8; color: #4a3a25; }
.acct-status-paid { background: #d8e4d8; color: #2a4a2a; }
.acct-status-shipped { background: #d8e4ef; color: #2a3a4a; }
.acct-status-completed { background: #d4d8ef; color: #2a2a4a; }
.acct-status-cancelled { background: #efd8d8; color: #4a2a2a; }
.acct-status-refunded { background: #efe4d8; color: #4a3a25; }

.acct-order-items { list-style: none; padding: 0; margin: 0; font-family: 'EB Garamond', Georgia, serif; font-size: 0.9rem; color: #4a463e; }
.acct-order-items li { margin: 0.2rem 0; }

.acct-tracking { margin: 0.6rem 0 0; font-family: 'EB Garamond', Georgia, serif; font-size: 0.88rem; }
.acct-tracking a { color: #6E3A5A; }

.acct-meta { list-style: none; padding: 0; margin: 0; font-family: 'EB Garamond', Georgia, serif; font-size: 0.95rem; color: #4a463e; line-height: 1.8; }
.acct-logout { margin-top: 1rem; }
.acct-logout a { color: #6E3A5A; font-family: 'EB Garamond', Georgia, serif; font-size: 0.9rem; }
`;
