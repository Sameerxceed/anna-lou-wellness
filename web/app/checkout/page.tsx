import { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import CheckoutPageClient from '@/components/CheckoutPage';
import { getSession } from '@/lib/auth';
import { fetchOrdersForUser } from '@/lib/strapi-admin';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your purchase.',
};

export const dynamic = 'force-dynamic';

export default async function CheckoutRoute() {
  // Pre-fill the checkout form for returning customers. We grab name +
  // email from the user record, and the shipping_address from their most
  // recent order (most useful default — what they actually shipped to last).
  const session = await getSession();
  let initialUser: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
  } | null = null;

  if (session) {
    let lastAddress = '';
    let lastPhone = '';
    try {
      const orders = await fetchOrdersForUser(session.user.id);
      const latestWithAddress = orders.find((o: any) => o.shipping_address);
      if (latestWithAddress) {
        lastAddress = latestWithAddress.shipping_address || '';
        lastPhone = latestWithAddress.customer_phone || '';
      }
    } catch {/* non-fatal */}

    initialUser = {
      firstName: session.user.firstName || '',
      lastName: session.user.lastName || '',
      email: session.user.email,
      phone: lastPhone,
      address: lastAddress,
    };
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `@media (max-width: 768px) { .checkout-grid { grid-template-columns: 1fr !important; } .checkout-summary { position: static !important; } }` }} />
      <PageHero title="Checkout" bgClass="hero-shop" height="35vh" />
      <section className="py-16 px-8">
        <div className="max-w-[1100px] mx-auto">
          <CheckoutPageClient initialUser={initialUser} />
        </div>
      </section>
    </>
  );
}
