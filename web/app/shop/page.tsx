import { Metadata } from 'next';
import { getProducts, getShopCategoryTree, getSectionLandingPage, getFAQs } from '@/lib/cms';
import ShopGrid from './ShopGrid';
import FAQAccordion from '@/components/FAQAccordion';
import UpsellBlockForSingleton from '@/components/UpsellBlockForSingleton';
import BlocksRenderer from '@/components/BlocksRenderer';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Jewellery with meaning. Emotional support jewellery, personalised pieces, and new arrivals from Anna Lou of London.',
  openGraph: {
    title: 'Shop — Anna Lou Wellness',
    description: 'Jewellery with meaning. Made to be worn.',
  },
};

interface ShopPageProps {
  searchParams: Promise<{ category?: string; sub?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const [products, categoryTree, page, faqs] = await Promise.all([
    getProducts(),
    getShopCategoryTree(),
    getSectionLandingPage('/shop-page', {
      kicker: 'Anna Lou of London',
      title: 'Jewellery with meaning.',
      intro: 'I have been designing jewellery for over twenty-five years. The pieces that actually matter are not the most expensive ones. They are the ones you reach for in hard moments. The ones that remind you.',
      heroImage: '',
      kickerColour: '#5DCAA5',
    }),
    getFAQs({ page: 'shop' }),
  ]);
  const activeProducts = products.filter(p => p.isActive);
  const initialParent = params?.category || 'all';
  const initialChild = params?.sub || 'all';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: shopStyles }} />
      <section className="shop-header">
        <div className="shop-header-inner reveal">
          <p className="shop-kicker" style={{ color: page.kickerColour }}>{page.kicker}</p>
          <h1 className="shop-title">{page.title}</h1>
          {page.introBlocks ? (
            <div className="shop-intro shop-intro-blocks"><BlocksRenderer content={page.introBlocks} /></div>
          ) : page.intro ? (
            <p className="shop-intro">{page.intro}</p>
          ) : null}
        </div>
      </section>
      <section className="shop-content">
        <div className="max-w-[1200px] mx-auto">
          <ShopGrid
            products={activeProducts}
            categoryTree={categoryTree}
            initialParent={initialParent}
            initialChild={initialChild}
          />
        </div>
      </section>

      <FAQAccordion faqs={faqs} accentColour="#5DCAA5" background="#F5F3EF" />
    <UpsellBlockForSingleton endpoint="/shop-page" />
    </>
  );
}

const shopStyles = `
.shop-header { background:#E1F5EE; padding:2.5rem 3rem 1.5rem; text-align:center; }
.shop-header-inner { max-width:900px; margin:0 auto; }
.shop-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.7rem; letter-spacing:0.2em; text-transform:uppercase; color:#5DCAA5; margin-bottom:0.5rem; }
.shop-title { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:300; font-size:clamp(2rem,5vw,3.2rem); color:#231F20; letter-spacing:0.05em; line-height:1.1; margin-bottom:1rem; }
.shop-intro { font-family:'EB Garamond',Georgia,serif; font-size:1.05rem; color:#3D3D3A; line-height:1.85; max-width:800px; margin:0 auto; }
.shop-intro-blocks p { margin-bottom:0.6rem; }
.shop-intro-blocks a { color:#6E3A5A; text-decoration:underline; text-decoration-thickness:1px; text-underline-offset:3px; }
.shop-intro-blocks a:hover { color:#5A2E4A; text-decoration-thickness:2px; }
.shop-intro-blocks strong { font-weight:600; color:#231F20; }
.shop-intro-blocks em { font-style:italic; }
.shop-content { background:#fff; padding:2rem 2rem 3rem; }
@media (max-width:900px) {
  .shop-header { padding:2rem 1.2rem 1rem; }
  .shop-content { padding:1.5rem 1rem 2rem; }
}
`;
