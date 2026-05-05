import { Metadata } from 'next';
import { getProducts, getCategories } from '@/lib/cms';
import ShopGrid from './ShopGrid';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Jewellery with meaning. Emotional support jewellery, personalised pieces, and new arrivals from Anna Lou of London.',
  openGraph: {
    title: 'Shop — Anna Lou Wellness',
    description: 'Jewellery with meaning. Made to be worn.',
  },
};

export default async function ShopPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const activeProducts = products.filter(p => p.isActive);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: shopStyles }} />
      <section className="shop-header">
        <div className="shop-header-inner reveal">
          <p className="shop-kicker">Anna Lou of London</p>
          <h1 className="shop-title">Jewellery with meaning.</h1>
          <p className="shop-intro">I have been designing jewellery for over twenty-five years. The pieces that actually matter are not the most expensive ones. They are the ones you reach for in hard moments. The ones that remind you.</p>
        </div>
      </section>
      <section className="shop-content">
        <div className="max-w-[1200px] mx-auto">
          <ShopGrid products={activeProducts} categories={categories} />
        </div>
      </section>
    </>
  );
}

const shopStyles = `
.shop-header { background:#E1F5EE; padding:2.5rem 3rem 1.5rem; text-align:center; }
.shop-header-inner { max-width:700px; margin:0 auto; }
.shop-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.7rem; letter-spacing:0.2em; text-transform:uppercase; color:#5DCAA5; margin-bottom:0.5rem; }
.shop-title { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:300; font-size:clamp(2rem,5vw,3.2rem); color:#231F20; letter-spacing:0.05em; line-height:1.1; margin-bottom:1rem; }
.shop-intro { font-family:'EB Garamond',Georgia,serif; font-size:1.05rem; color:#3D3D3A; line-height:1.85; max-width:600px; margin:0 auto; }
.shop-content { background:#fff; padding:2rem 2rem 3rem; }
@media (max-width:900px) {
  .shop-header { padding:2rem 1.2rem 1rem; }
  .shop-content { padding:1.5rem 1rem 2rem; }
}
`;
