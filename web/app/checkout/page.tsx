import { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import CheckoutPageClient from '@/components/CheckoutPage';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your purchase.',
};

export default function CheckoutRoute() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `@media (max-width: 768px) { .checkout-grid { grid-template-columns: 1fr !important; } .checkout-summary { position: static !important; } }` }} />
      <PageHero title="Checkout" bgClass="hero-shop" height="35vh" />
      <section className="py-16 px-8">
        <div className="max-w-[1100px] mx-auto">
          <CheckoutPageClient />
        </div>
      </section>
    </>
  );
}
