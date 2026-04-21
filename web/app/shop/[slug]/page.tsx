import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProducts } from '@/lib/cms';
import AddToCartButton from '@/components/AddToCartButton';

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
  return {
    title: product.name,
    description: product.shortDescription,
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
            <div className="aspect-square overflow-hidden bg-cream reveal" data-lightbox-group>
              {product.images[0] && (
                <div className="cursor-pointer w-full h-full" data-lightbox={product.images[0]}>
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="reveal reveal-delay-1">
              <p className="font-sans font-light text-[0.52rem] tracking-[0.2em] uppercase text-sage mb-3">{product.category}</p>
              <h1 className="font-display font-normal text-[2rem] text-ink mb-3 leading-tight">{product.name}</h1>
              <p className="font-sans font-light text-[1.4rem] text-ink mb-6">&euro;{product.price.toFixed(2)}</p>

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

              <AddToCartButton
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.images[0] || ''}
                slug={product.slug}
                stock={product.stock}
              />
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
                    {p.images[0] && (
                      <img src={p.images[0]} alt={p.name} loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    )}
                  </div>
                  <h3 className="font-display font-normal text-[0.95rem] text-ink mb-1">{p.name}</h3>
                  <p className="font-sans font-light text-[0.8rem] text-ink">&euro;{p.price.toFixed(2)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
