import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProducts } from '@/lib/cms';
import AddToCartButton from '@/components/AddToCartButton';
import WishlistHeart from '@/components/WishlistHeart';
import { ProductSchema, BreadcrumbSchema } from '@/components/StructuredData';
import { getStockImage } from '@/data/stock-images';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.filter(p => p.isActive).map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const products = await getProducts();
  const product = products.find(p => p.slug === slug);
  if (!product) return { title: 'Product Not Found' };
  const title = `${product.name} — Anna Lou Wellness Shop`;
  const description = product.shortDescription || product.description?.slice(0, 160) || `${product.name}. Handmade by Anna Lou Wellness.`;
  return {
    title,
    description,
    alternates: { canonical: `/shop/${slug}` },
    openGraph: { title, description, type: 'website', url: `/shop/${slug}`, images: product.images[0] ? [{ url: product.images[0] }] : undefined },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const products = await getProducts();
  const product = products.find(p => p.slug === slug);
  if (!product) notFound();

  const related = products
    .filter(p => p.isActive && p.slug !== slug && p.category === product.category)
    .slice(0, 4);

  return (
    <>
      <ProductSchema name={product.name} description={product.shortDescription || product.description} slug={slug} price={product.price} image={product.images[0]} inStock={product.stock > 0} />
      <BreadcrumbSchema items={[{ name: 'Home', href: '/' }, { name: 'Shop', href: '/shop' }, { name: product.name, href: `/shop/${slug}` }]} />
      <section className="pt-32 pb-16 px-8">
        <div className="max-w-[1100px] mx-auto">
          <nav className="mb-8 reveal">
            <span className="font-sans font-light text-[0.5rem] tracking-[0.15em] uppercase text-mist">
              <Link href="/shop" className="hover:text-ink transition-colors">Shop</Link>
              <span className="mx-2">/</span>
              <span className="text-stone">{product.name}</span>
            </span>
          </nav>

          <div className="grid grid-cols-2 gap-12 max-md:grid-cols-1">
            {/* Main product image: square frame, but image uses object-contain
                so non-square photos (landscape product shots, portrait
                lifestyle shots, oddly-shaped uploads) fit cleanly inside
                instead of being cropped. Cream background fills any padding. */}
            <div className="aspect-square overflow-hidden bg-warm-neutral reveal flex items-center justify-center" data-lightbox-group>
              {(() => {
                const img = product.images[0] || getStockImage('product', slug);
                return (
                  <div className="cursor-pointer w-full h-full flex items-center justify-center" data-lightbox={img}>
                    <img
                      src={img}
                      alt={product.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                );
              })()}
            </div>

            <div className="reveal reveal-delay-1">
              <p className="font-sans font-light text-[0.52rem] tracking-[0.2em] uppercase text-sage mb-3">{product.category}</p>
              <h1 className="font-display font-normal text-[2rem] text-ink mb-3 leading-tight">{product.name}</h1>
              <p className="font-sans font-light text-[1.4rem] text-ink mb-6">&pound;{product.price.toFixed(2)}</p>

              <p className="section-body max-w-none mb-8">{product.description}</p>

              <div className="mb-6">
                {product.stock > 0 ? (
                  <p className="font-sans font-extralight text-[0.5rem] tracking-[0.12em] uppercase text-sage">
                    {product.stock <= 5 ? `Only ${product.stock} left in stock` : 'In stock'}
                  </p>
                ) : (
                  <p className="font-sans font-extralight text-[0.5rem] tracking-[0.12em] uppercase text-mist">Out of stock</p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <AddToCartButton
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.images[0] || ''}
                  slug={product.slug}
                  stock={product.stock}
                />
                <WishlistHeart
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.images[0] || ''}
                  slug={product.slug}
                  variant="detail"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-cream py-24 px-8">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12 reveal">
              <p className="section-label">You Might Also Like</p>
            </div>
            <div className="grid grid-cols-4 gap-6 max-lg:grid-cols-3 max-md:grid-cols-2">
              {related.map(p => (
                <Link key={p.slug} href={`/shop/${p.slug}`} className="group block reveal">
                  <div className="aspect-square overflow-hidden mb-3 bg-warm-white">
                    <img
                      src={p.images[0] || getStockImage('product', p.slug)}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="font-display font-normal text-[0.95rem] text-ink mb-1">{p.name}</h3>
                  <p className="font-sans font-light text-[0.8rem] text-ink">&pound;{p.price.toFixed(2)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
