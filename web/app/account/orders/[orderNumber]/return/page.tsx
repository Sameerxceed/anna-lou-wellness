import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { fetchOrderByNumber } from '@/lib/strapi-admin';
import ReturnForm from './ReturnForm';

export const metadata: Metadata = {
  title: 'Request a return — Anna Lou Wellness',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const RETURNABLE_STATUSES = ['paid', 'shipped', 'completed'];

export default async function ReturnRequestPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const session = await getSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent(`/account/orders/${orderNumber}/return`)}`);
  }

  const order = await fetchOrderByNumber(orderNumber);
  if (!order) notFound();

  // Ownership check
  const orderUserId = order.user?.id || order.user;
  const ownsByUser = orderUserId === session.user.id;
  const ownsByEmail = String(order.customer_email || '').toLowerCase() === session.user.email.toLowerCase();
  if (!ownsByUser && !ownsByEmail) {
    return (
      <Wrapper>
        <h1 className="rt-title">This order isn&rsquo;t on your account</h1>
        <p className="rt-sub">You can only request a return for orders placed with your signed-in email ({session.user.email}).</p>
        <p style={{ marginTop: '1.4rem' }}><Link href="/account" className="rt-link">← Back to your account</Link></p>
      </Wrapper>
    );
  }

  if (!RETURNABLE_STATUSES.includes(order.status)) {
    return (
      <Wrapper>
        <p className="rt-eyebrow">Order {orderNumber}</p>
        <h1 className="rt-title">This order can&rsquo;t be returned</h1>
        <p className="rt-sub">
          Orders in <strong>{order.status}</strong> status are not eligible for return through the website.
          Please reply to your order confirmation email and we will help directly.
        </p>
        <p style={{ marginTop: '1.4rem' }}><Link href="/account" className="rt-link">← Back to your account</Link></p>
      </Wrapper>
    );
  }

  const items = Array.isArray(order.items)
    ? order.items.filter((it: any) => Number(it.id) > 0) // skip gift-wrap line id:-1
    : [];

  return (
    <Wrapper>
      <p className="rt-eyebrow">Order {orderNumber}</p>
      <h1 className="rt-title">Request a return</h1>
      <p className="rt-sub">
        Tell us which items you want to return and why. We&rsquo;ll review within 1–2 working days
        and reply with shipping instructions. No returns label is printed yet — we&rsquo;ll send
        that after approval.
      </p>
      <ReturnForm orderNumber={orderNumber} items={items} />
    </Wrapper>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <section className="rt-page">
        <div className="rt-inner">{children}</div>
      </section>
    </>
  );
}

const styles = `
.rt-page { min-height: 70vh; padding: 4rem 1.5rem; background: #FAF7F0; }
.rt-inner { max-width: 640px; margin: 0 auto; }
.rt-eyebrow { font-family: 'Josefin Sans', sans-serif; font-size: 0.62rem; letter-spacing: 0.22em; text-transform: uppercase; color: #c4704a; margin: 0 0 0.6rem; }
.rt-title { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 500; font-size: 2.2rem; color: #231F20; margin: 0 0 0.8rem; line-height: 1.1; }
.rt-sub { font-family: 'EB Garamond', Georgia, serif; font-size: 1rem; color: #6e6a62; line-height: 1.6; margin: 0 0 1.8rem; }
.rt-link { color: #6E3A5A; }
`;
