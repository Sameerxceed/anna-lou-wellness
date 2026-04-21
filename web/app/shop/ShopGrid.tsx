'use client';

import { useState } from 'react';
import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton';
import type { Product } from '@/lib/cms';

interface Props {
  products: Product[];
  categories: Array<{ name: string; slug: string }>;
}

export default function ShopGrid({ products, categories }: Props) {
  const [active, setActive] = useState('all');
  const filtered = active === 'all' ? products : products.filter(p => p.category === active);

  return (
    <>
      <div className="flex flex-wrap gap-2 justify-center mb-12 reveal">
        {categories.map(cat => (
          <button
            key={cat.slug}
            onClick={() => setActive(cat.slug)}
            className={`font-sans font-light text-[0.55rem] tracking-[0.15em] uppercase px-5 py-2 border transition-all cursor-pointer ${
              active === cat.slug
                ? 'bg-ink text-warm-white border-ink'
                : 'bg-transparent text-stone border-mist hover:border-ink hover:text-ink'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-6 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
        {filtered.map((product) => (
          <div key={product.slug} className="group reveal">
            <Link href={`/shop/${product.slug}`} className="block">
              <div className="aspect-square overflow-hidden mb-4 bg-cream">
                {product.images[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
              </div>
              <h3 className="font-display font-normal text-[1rem] text-ink mb-1">{product.name}</h3>
              <p className="font-body text-[0.78rem] text-stone mb-2 line-clamp-2">{product.shortDescription}</p>
            </Link>
            <div className="flex items-center justify-between">
              <span className="font-sans font-light text-[0.8rem] text-ink">&euro;{product.price.toFixed(2)}</span>
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
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center font-body text-stone italic py-12">No products in this category yet.</p>
      )}
    </>
  );
}
