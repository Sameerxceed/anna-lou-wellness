'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton';
import type { Product, ShopCategoryNode } from '@/lib/cms';
import { getStockImage } from '@/data/stock-images';

/**
 * Shop grid with two-level category filter.
 *
 * Top row: parent categories (Jewellery, Crystals, Sage & Palo Santo,
 * Gifts) + "All".
 * Second row: sub-categories of the selected parent (e.g. clicking
 * "Jewellery" reveals Bracelets / Earrings / Necklaces / Charms).
 * Hidden when the selected parent has no children.
 *
 * Filtering treats sub-category membership as "also belongs to parent" —
 * clicking "Jewellery" shows products tagged with Jewellery OR any of
 * its sub-categories. Clicking a sub-category narrows further.
 */

interface Props {
  products: Product[];
  categoryTree: ShopCategoryNode[];
  /** Initial parent category slug from URL (?category=jewellery), default 'all'. */
  initialParent?: string;
  /** Initial sub-category slug from URL (?sub=bracelets), default 'all'. */
  initialChild?: string;
}

const ALL_SLUG = 'all';

export default function ShopGrid({ products, categoryTree, initialParent = ALL_SLUG, initialChild = ALL_SLUG }: Props) {
  const [parentSlug, setParentSlug] = useState<string>(initialParent);
  const [childSlug, setChildSlug] = useState<string>(initialChild);

  // Map: child slug -> parent slug. Lets us answer "does this product
  // belong under parent X?" when the product is tagged with a child slug.
  const childToParent = useMemo(() => {
    const map = new Map<string, string>();
    categoryTree.forEach((p) => {
      p.children.forEach((c) => map.set(c.slug, p.slug));
    });
    return map;
  }, [categoryTree]);

  const selectedParent = categoryTree.find((p) => p.slug === parentSlug);
  const hasChildren = (selectedParent?.children.length ?? 0) > 0;

  const filtered = useMemo(() => {
    if (parentSlug === ALL_SLUG) return products;
    return products.filter((p) => {
      const pCat = p.category;
      if (!pCat) return false;
      if (childSlug !== ALL_SLUG) return pCat === childSlug;
      if (pCat === parentSlug) return true;
      return childToParent.get(pCat) === parentSlug;
    });
  }, [products, parentSlug, childSlug, childToParent]);

  function handleParentClick(slug: string) {
    setParentSlug(slug);
    setChildSlug(ALL_SLUG);
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pillStyles }} />

      <div className="shop-pill-row reveal">
        <button
          onClick={() => handleParentClick(ALL_SLUG)}
          className={`shop-pill ${parentSlug === ALL_SLUG ? 'is-active' : ''}`}
        >
          All
        </button>
        {categoryTree.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => handleParentClick(cat.slug)}
            className={`shop-pill ${parentSlug === cat.slug ? 'is-active' : ''}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {hasChildren && (
        <div className="shop-pill-row shop-pill-row-sub reveal rd1">
          <button
            onClick={() => setChildSlug(ALL_SLUG)}
            className={`shop-pill shop-pill-sub ${childSlug === ALL_SLUG ? 'is-active' : ''}`}
          >
            All {selectedParent!.name}
          </button>
          {selectedParent!.children.map((child) => (
            <button
              key={child.slug}
              onClick={() => setChildSlug(child.slug)}
              className={`shop-pill shop-pill-sub ${childSlug === child.slug ? 'is-active' : ''}`}
            >
              {child.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-4 gap-6 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 mt-8">
        {filtered.map((product) => {
          const productImg = product.images[0] || getStockImage('product', product.slug);
          return (
            <div key={product.slug} className="group reveal">
              <Link href={`/shop/${product.slug}`} className="block">
                <div className="aspect-square overflow-hidden mb-4 bg-cream">
                  <img
                    src={productImg}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-display font-normal text-[1rem] text-ink mb-1">{product.name}</h3>
                <p className="font-body text-[0.78rem] text-stone mb-2 line-clamp-2">{product.shortDescription}</p>
              </Link>
              <div className="flex items-center justify-between">
                <span className="font-sans font-light text-[0.8rem] text-ink">&pound;{product.price.toFixed(2)}</span>
                <AddToCartButton
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image={productImg}
                  slug={product.slug}
                  stock={product.stock}
                />
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center font-body text-stone italic py-12">No products in this category yet.</p>
      )}
    </>
  );
}

const pillStyles = `
.shop-pill-row { display:flex; flex-wrap:wrap; gap:0.5rem; justify-content:center; margin-bottom:0.6rem; }
.shop-pill-row-sub { margin-bottom:1.5rem; }
.shop-pill {
  background:transparent; border:1px solid #D5D0C8;
  padding:0.45rem 1rem; cursor:pointer;
  font-family:Mulish,sans-serif; font-weight:400;
  font-size:0.6rem; letter-spacing:0.14em; text-transform:uppercase;
  color:#3D3D3A; transition:all 0.2s ease; border-radius:3px;
}
.shop-pill:hover { border-color:#231F20; color:#231F20; }
.shop-pill.is-active { background:#231F20; color:#fff; border-color:#231F20; }
.shop-pill-sub { font-size:0.58rem; padding:0.4rem 0.85rem; border-style:dashed; }
.shop-pill-sub.is-active { border-style:solid; background:#5DCAA5; border-color:#5DCAA5; }
`;
