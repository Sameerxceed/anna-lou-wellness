import { Metadata } from 'next';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { fetchOrdersForUser, fetchOrdersForEmail } from '@/lib/strapi-admin';

export const metadata: Metadata = {
  title: 'My orders — Anna Lou Wellness',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/**
 * /account/orders — full order history for the signed-in user.
 * Merges orders linked to their user record with any guest orders
 * placed against the same email BEFORE the account was created.
 */
export default async function OrdersListPage() {
  const session = await getSession();
  if (!session) return null;
  const { user } = session;

  const [linked, byEmail] = await Promise.all([
    fetchOrdersForUser(user.id),
    fetchOrdersForEmail(user.email),
  ]);
  const seen = new Set<number>(linked.map((o: any) => o.id));
  const orders = [
    ...linked,
    ...byEmail.filter((o: any) => !seen.has(o.id)),
  ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div>
      <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, fontSize: '0.55rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#c4704a', margin: 0 }}>Orders</p>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.4rem', color: '#1a1a18', margin: '0.4rem 0 0.6rem', lineHeight: 1.05 }}>
        My orders
      </h1>
      <p style={{ fontFamily: "'Lora', serif", fontSize: '0.95rem', color: '#6e6a62', margin: '0 0 2rem' }}>
        {orders.length === 0
          ? 'You have not placed an order yet.'
          : `Every order you have placed with us — most recent first.`}
      </p>

      {orders.length === 0 ? (
        <div style={{ padding: '2rem', background: '#f7f2ea', border: '1px solid #ece6dc', textAlign: 'center' }}>
          <Link href="/shop" style={{ display: 'inline-block', padding: '0.75rem 1.4rem', background: '#6E3A5A', color: '#fff', textDecoration: 'none', fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            Visit the shop
          </Link>
        </div>
      ) : (
        <div style={{ border: '1px solid #ece6dc' }}>
          {orders.map((o: any, i: number) => (
            <OrderCard key={o.id} order={o} isLast={i === orders.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, isLast }: { order: any; isLast: boolean }) {
  const status = String(order.status || 'pending').toLowerCase();
  const total = Number(order.total || 0);
  const created = order.createdAt ? new Date(order.createdAt) : null;
  const itemCount = Array.isArray(order.items) ? order.items.reduce((n: number, it: any) => n + Number(it.qty || 1), 0) : 0;
  return (
    <Link
      href={`/account/orders/${order.orderNumber}`}
      style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr 0.8fr auto auto',
        alignItems: 'center',
        gap: '1rem',
        padding: '1.1rem 1.25rem',
        borderBottom: isLast ? 'none' : '1px solid #ece6dc',
        textDecoration: 'none',
        color: '#1a1a18',
        transition: 'background 0.2s',
      }}
    >
      <div>
        <div style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 400, fontSize: '0.65rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c4704a' }}>
          Order {order.orderNumber}
        </div>
        <div style={{ fontFamily: "'Lora', serif", fontSize: '0.78rem', color: '#a89e91', marginTop: '0.15rem' }}>
          {itemCount} item{itemCount === 1 ? '' : 's'}
        </div>
      </div>
      <div style={{ fontFamily: "'Lora', serif", fontSize: '0.85rem', color: '#6e6a62', fontStyle: 'italic' }}>
        {created ? created.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
      </div>
      <div style={{ fontFamily: "'Lora', serif", fontSize: '0.78rem', color: '#6e6a62', textTransform: 'capitalize' }}>
        {String(order.paymentMethod || '—')}
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
