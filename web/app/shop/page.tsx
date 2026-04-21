import { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import { getProducts, getCategories } from '@/lib/cms';
import ShopGrid from './ShopGrid';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Crystals, jewellery, digital downloads, and gifts from Anna Lou of London.',
};

export default async function ShopPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const activeProducts = products.filter(p => p.isActive);

  return (
    <>
      <PageHero label="Anna Lou of London" title="Shop" subtitle="Crystals, jewellery, digital downloads, and gifts" bgClass="hero-shop" />
      <section className="py-24 px-8">
        <div className="max-w-[1200px] mx-auto">
          <ShopGrid products={activeProducts} categories={categories} />
        </div>
      </section>
    </>
  );
}
