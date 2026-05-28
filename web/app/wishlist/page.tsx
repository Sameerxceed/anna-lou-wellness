import { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import WishlistPageClient from '@/components/WishlistPage';

export const metadata: Metadata = {
  title: 'Wishlist',
  description: 'Pieces and gifts you have saved from Anna Lou Wellness.',
  alternates: { canonical: '/wishlist' },
  robots: { index: false, follow: true },
};

export default function WishlistRoute() {
  return (
    <>
      <PageHero title="Your Wishlist" bgClass="hero-shop" height="35vh" />
      <section className="py-16 px-8">
        <div className="max-w-[1100px] mx-auto">
          <WishlistPageClient />
        </div>
      </section>
    </>
  );
}
