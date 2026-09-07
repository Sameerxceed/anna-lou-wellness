import { Metadata } from 'next';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { fetchOrdersForUser, fetchOrdersForEmail } from '@/lib/strapi-admin';

export const metadata: Metadata = {
  title: 'Your account — Anna Lou Wellness',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type AccountSearchParams = { welcome?: string };

/**
 * Overview page — /account
 *
 * Modelled on Araha's dashboard: a welcome header, stat cards (order count
 * + address status), the 3 most recent orders, then a shortcut grid to the
 * other sections. Auth + sidebar are handled by the shared layout.
 */
export default async function AccountOverview({
  searchParams,
}: {
  searchParams: Promise<AccountSearchParams>;
}) {
  const { welcome } = await searchParams;
  const session = await getSession();
  // Layout already redirects if session is null, but TS needs the narrow.
  if (!session) return null;
  const { user, isMember, hasRegulatedAccess } = session;

  const [linkedOrders, emailOrders] = await Promise.all([
    fetchOrdersForUser(user.id),
    fetchOrdersForEmail(user.email),
  ]);
  const seenIds = new Set<number>(linkedOrders.map((o: any) => o.id));
  const orders = [
    ...linkedOrders,
    ...emailOrders.filter((o: any) => !seenIds.has(o.id)),
  ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const recent = orders.slice(0, 3);
  const hasAddress = Boolean(user.default_address?.line1);

  return (
    <div>
      {welcome === '1' && (
        <div style={{ padding: '0.9rem 1.1rem', background: '#f0e8dc', border: '1px solid #d9caae', color: '#5c3f16', fontFamily: "'Lora', serif", fontSize: '0.88rem', marginBottom: '1.5rem' }}>
          Welcome — your account is set up. Sign in any time with this email + your password.
        </div>
      )}
      <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, fontSize: '0.55rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#c4704a', margin: 0 }}>Overview</p>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.4rem', color: '#1a1a18', margin: '0.4rem 0 0.6rem', lineHeight: 1.05 }}>
        Your account, all in one place.
      </h1>
      <p style={{ fontFamily: "'Lora', serif", fontSize: '0.95rem', color: '#6e6a62', margin: '0 0 2rem' }}>
        Orders, saved address and details at a glance.
      </p>

      {(isMember || hasRegulatedAccess) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2rem' }}>
          {isMember && (
            <Link href="/community/reset-room/dashboard" style={{ padding: '0.75rem 1.1rem', background: '#6E3A5A', color: '#fff', textDecoration: 'none', fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              Reset Room →
            </Link>
          )}
          {hasRegulatedAccess && (
            <Link href="/the-work/regulated/access" style={{ padding: '0.75rem 1.1rem', background: '#c4704a', color: '#fff', textDecoration: 'none', fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              REGULATED →
            </Link>
          )}
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <StatCard number={orders.length} label="Orders" />
        <StatCard number={hasAddress ? 1 : 0} label="Saved address" />
      </div>

      {/* Recent orders */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: '#1a1a18', margin: 0 }}>Recent orders</h2>
          {orders.length > 3 && (
            <Link href="/account/orders" style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.65rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c4704a', textDecoration: 'none' }}>
              See all orders →
            </Link>
          )}
        </div>
        {recent.length === 0 ? (
          <p style={{ fontFamily: "'Lora', serif", fontSize: '0.9rem', color: '#6e6a62', fontStyle: 'italic' }}>
            No orders yet. <Link href="/shop" style={{ color: '#c4704a' }}>Visit the shop</Link>.
          </p>
        ) : (
          <div style={{ border: '1px solid #ece6dc' }}>
            {recent.map((o: any, i: number) => (
              <OrderRow key={o.id} order={o} isLast={i === recent.length - 1} />
            ))}
          </div>
        )}
      </div>

      {/* Shortcuts grid */}
      <div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: '#1a1a18', margin: '0 0 1rem' }}>Shortcuts</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.9rem' }}>
          <Shortcut href="/account/orders" label="All orders" sub={`${orders.length} in total`} />
          <Shortcut href="/account/addresses" label="Addresses" sub={hasAddress ? 'Saved · edit' : 'Save default'} />
          <Shortcut href="/account/details" label="Account details" sub="Name, email, phone" />
          <Shortcut href="/account/wishlist" label="Wishlist" sub="Saved products" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ number, label }: { number: number; label: string }) {
  return (
    <div style={{ padding: '1.4rem 1.5rem', background: '#f7f2ea', border: '1px solid #ece6dc' }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', color: '#1a1a18', lineHeight: 1 }}>{number}</div>
      <div style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, fontSize: '0.55rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#a89e91', marginTop: '0.5rem' }}>{label}</div>
    </div>
  );
}

function Shortcut({ href, label, sub }: { href: string; label: string; sub: string }) {
  return (
    <Link href={href} style={{ display: 'block', padding: '1rem 1.15rem', border: '1px solid #ece6dc', textDecoration: 'none', background: '#fff', transition: 'border-color 0.2s, background 0.2s' }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem', color: '#1a1a18' }}>{label}</div>
      <div style={{ fontFamily: "'Lora', serif", fontSize: '0.78rem', color: '#6e6a62', marginTop: '0.2rem' }}>{sub}</div>
    </Link>
  );
}

function OrderRow({ order, isLast }: { order: any; isLast: boolean }) {
  const status = String(order.status || 'pending').toLowerCase();
  const total = Number(order.total || 0);
  const created = order.createdAt ? new Date(order.createdAt) : null;
  return (
    <Link
      href={`/account/orders/${order.orderNumber}`}
      style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr auto auto',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.95rem 1.1rem',
        borderBottom: isLast ? 'none' : '1px solid #ece6dc',
        textDecoration: 'none',
        color: '#1a1a18',
      }}
    >
      <div style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 400, fontSize: '0.65rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c4704a' }}>
        Order {order.orderNumber}
      </div>
      <div style={{ fontFamily: "'Lora', serif", fontSize: '0.85rem', color: '#6e6a62', fontStyle: 'italic' }}>
        {created ? created.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
      </div>
      <StatusBadge status={status} />
      <div style={{ fontFamily: "'Lora', serif", fontSize: '0.95rem' }}>&pound;{total.toFixed(2)}</div>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    pending:   { bg: '#f0e8dc', fg: '#5c3f16', label: 'Pending' },
    paid:      { bg: '#dcecdc', fg: '#2c5c2c', label: 'Paid' },
    shipped:   { bg: '#dce4f0', fg: '#1a3a5c', label: 'Shipped' },
    delivered: { bg: '#e4dcf0', fg: '#3a1a5c', label: 'Delivered' },
    cancelled: { bg: '#f0dcdc', fg: '#5c1a1a', label: 'Cancelled' },
    refunded:  { bg: '#ece6dc', fg: '#4a4640', label: 'Refunded' },
  };
  const s = map[status] || { bg: '#ece6dc', fg: '#4a4640', label: status.charAt(0).toUpperCase() + status.slice(1) };
  return (
    <span style={{ padding: '0.25rem 0.65rem', background: s.bg, color: s.fg, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 400, fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
      {s.label}
    </span>
  );
}
