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
  // Pre-fill the checkout form for returning customers.
  //   Priority for address + phone:
  //     1. user.default_address / user.phone (saved from /account/addresses)
  //     2. shipping_address / customer_phone on their most recent order
  //     3. blank
  //   Priority for name/email: user record (always).
  const session = await getSession();
  let initialUser: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    defaultAddress: {
      line1?: string;
      line2?: string;
      city?: string;
      county?: string;
      postcode?: string;
      country?: string;
    } | null;
  } | null = null;

  if (session) {
    let lastAddress = '';
    let lastPhone = '';
    const savedAddr = session.user.default_address || null;
    const savedPhone = session.user.phone || '';

    // Fallback to the address on the latest order only if there is no
    // saved default. Once the user saves a default we always trust that.
    if (!savedAddr?.line1) {
      try {
        const orders = await fetchOrdersForUser(session.user.id);
        const latestWithAddress = orders.find((o: any) => o.shipping_address);
        if (latestWithAddress) {
          lastAddress = latestWithAddress.shipping_address || '';
          lastPhone = latestWithAddress.customer_phone || '';
        }
      } catch {/* non-fatal */}
    }

    initialUser = {
      firstName: session.user.firstName || '',
      lastName: session.user.lastName || '',
      email: session.user.email,
      phone: savedPhone || lastPhone,
      address: lastAddress,
      defaultAddress: savedAddr,
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
