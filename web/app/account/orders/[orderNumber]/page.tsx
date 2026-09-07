import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { fetchOrderByNumber } from '@/lib/strapi-admin';

export const metadata: Metadata = {
  title: 'Order — Anna Lou Wellness',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ orderNumber: string }>;
}

/**
 * /account/orders/[orderNumber] — single order detail.
 *
 * Fetches the order by its human-readable number (e.g. ALW-4T44P3J),
 * checks ownership (user.id match OR email match for guest orders that
 * were later associated), then renders items + totals + delivery info.
 */
export default async function OrderDetailPage({ params }: Props) {
  const { orderNumber } = await params;
  const session = await getSession();
  if (!session) return null;
  const { user } = session;

  const order = await fetchOrderByNumber(orderNumber);
  if (!order) return notFound();

  // Ownership check: user id match OR email match (case-insensitive).
  const orderUserId = order.user?.id ?? order.user?.data?.id ?? null;
  const orderEmail = String(order.customer_email || '').toLowerCase();
  const owns = orderUserId === user.id || orderEmail === user.email.toLowerCase();
  if (!owns) return notFound();

  const status = String(order.status || 'pending').toLowerCase();
  const items: any[] = Array.isArray(order.items) ? order.items : [];
  const total = Number(order.total || 0);
  const subtotal = Number(order.subtotal || items.reduce((s: number, it: any) => s + Number(it.price || 0) * Number(it.qty || 1), 0));
  const shipping = Number(order.shipping || 0);
  const discount = Number(order.discount || 0);
  const giftWrap = Number(order.gift_wrap_price || 0);
  const created = order.createdAt ? new Date(order.createdAt) : null;

  return (
    <div>
      <Link href="/account/orders" style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.65rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c4704a', textDecoration: 'none' }}>
        ← All orders
      </Link>
      <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, fontSize: '0.55rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#c4704a', margin: '1.2rem 0 0' }}>
        Order {order.orderNumber}
      </p>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.2rem', color: '#1a1a18', margin: '0.4rem 0 0.4rem', lineHeight: 1.05 }}>
        Order details
      </h1>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ fontFamily: "'Lora', serif", fontSize: '0.9rem', color: '#6e6a62', fontStyle: 'italic' }}>
          {created ? created.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Items */}
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', color: '#1a1a18', margin: '0 0 0.9rem' }}>Items</h2>
      <div style={{ border: '1px solid #ece6dc', marginBottom: '2rem' }}>
        {items.length === 0 ? (
          <div style={{ padding: '1rem', fontFamily: "'Lora', serif", fontStyle: 'italic', color: '#6e6a62' }}>No items on this order.</div>
        ) : (
          items.map((it: any, i: number) => {
            const price = Number(it.price || 0);
            const qty = Number(it.qty || 1);
            return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr auto auto', gap: '1rem', alignItems: 'center', padding: '0.85rem 1.1rem', borderBottom: i === items.length - 1 ? 'none' : '1px solid #ece6dc' }}>
                <div style={{ fontFamily: "'Lora', serif", fontSize: '0.9rem', color: '#1a1a18' }}>
                  {it.name || `Product #${it.productId}`}
                  <span style={{ color: '#a89e91', marginLeft: '0.5rem' }}>× {qty}</span>
                </div>
                <div style={{ fontFamily: "'Lora', serif", fontSize: '0.85rem', color: '#6e6a62' }}>@ &pound;{price.toFixed(2)}</div>
                <div style={{ fontFamily: "'Lora', serif", fontSize: '0.9rem' }}>&pound;{(price * qty).toFixed(2)}</div>
              </div>
            );
          })
        )}
      </div>

      {/* Totals */}
      <div style={{ maxWidth: 380, marginLeft: 'auto', fontFamily: "'Lora', serif", fontSize: '0.9rem', color: '#4a4640', marginBottom: '2rem' }}>
        <Row label="Subtotal" value={`£${subtotal.toFixed(2)}`} />
        {discount > 0 && <Row label={`Discount${order.coupon_code ? ` (${order.coupon_code})` : ''}`} value={`−£${discount.toFixed(2)}`} />}
        <Row label="Shipping" value={shipping > 0 ? `£${shipping.toFixed(2)}` : 'Free'} />
        {giftWrap > 0 && <Row label="Gift wrap" value={`£${giftWrap.toFixed(2)}`} />}
        <div style={{ borderTop: '1px solid #ece6dc', marginTop: '0.5rem', paddingTop: '0.6rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', color: '#1a1a18' }}>
          <span>Total</span><span>&pound;{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Delivery address */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <InfoBlock label="Delivery to" body={order.customer_address || '—'} />
        <InfoBlock label="Contact" body={`${order.customer_name || '—'}\n${order.customer_email || ''}${order.customer_phone ? `\n${order.customer_phone}` : ''}`} />
      </div>

      {status === 'delivered' && (
        <Link href={`/account/orders/${order.orderNumber}/return`} style={{ display: 'inline-block', padding: '0.7rem 1.2rem', border: '1px solid #6E3A5A', color: '#6E3A5A', textDecoration: 'none', fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          Request a return
        </Link>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0' }}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}

function InfoBlock({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <div style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#a89e91', marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ fontFamily: "'Lora', serif", fontSize: '0.9rem', color: '#1a1a18', whiteSpace: 'pre-line', lineHeight: 1.5 }}>{body}</div>
    </div>
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
