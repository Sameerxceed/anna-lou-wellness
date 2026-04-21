import { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import CartPageClient from '@/components/CartPage';

export const metadata: Metadata = {
  title: 'Cart',
  description: 'Your shopping cart.',
};

export default function CartRoute() {
  return (
    <>
      <PageHero title="Your Cart" bgClass="hero-shop" height="35vh" />
      <section className="py-16 px-8">
        <div className="max-w-[900px] mx-auto">
          <CartPageClient />
        </div>
      </section>
    </>
  );
}
