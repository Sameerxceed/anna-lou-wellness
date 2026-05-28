'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getWishlist,
  removeFromWishlist,
  clearWishlist,
  onWishlistChange,
  type WishlistItem,
} from '@/lib/wishlist';
import { addToCart } from '@/lib/cart';
import { showToast } from '@/components/Toast';

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  const refresh = useCallback(() => setItems(getWishlist()), []);

  useEffect(() => {
    refresh();
    return onWishlistChange(refresh);
  }, [refresh]);

  function moveOneToCart(it: WishlistItem) {
    addToCart({ id: it.id, name: it.name, price: it.price, image: it.image, slug: it.slug });
    showToast(`${it.name} added to cart`);
  }

  function moveAllToCart() {
    if (items.length === 0) return;
    items.forEach((it) => addToCart({ id: it.id, name: it.name, price: it.price, image: it.image, slug: it.slug }));
    showToast(`${items.length} item${items.length === 1 ? '' : 's'} added to cart`);
  }

  function emptyWishlist() {
    if (!confirm('Clear your wishlist?')) return;
    clearWishlist();
  }

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '1.3rem', color: '#6e6a62', marginBottom: '1.5rem' }}>
          Your wishlist is empty. Tap the heart on any piece to save it for later.
        </p>
        <a href="/shop" className="btn btn-outline">Browse the shop</a>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.4rem', flexWrap: 'wrap', gap: '0.7rem' }}>
        <p style={{ fontFamily: "'Lora', serif", fontSize: '0.9rem', color: '#3D3D3A', margin: 0 }}>
          {items.length} saved piece{items.length === 1 ? '' : 's'}
        </p>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={moveAllToCart}
            className="btn btn-accent"
            style={{ padding: '0.55rem 1.2rem' }}
          >
            Add all to cart
          </button>
          <button
            type="button"
            onClick={emptyWishlist}
            className="btn btn-outline"
            style={{ padding: '0.55rem 1.2rem' }}
          >
            Clear wishlist
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
        {items.map((it) => (
          <article key={it.id} style={{ background: '#fff' }}>
            <a href={`/shop/${it.slug}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <div className="aspect-square overflow-hidden mb-3 bg-cream">
                <img
                  src={it.image}
                  alt={it.name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: '1rem', color: '#1a1a18', marginBottom: '0.25rem' }}>{it.name}</h3>
              <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, fontSize: '0.8rem', color: '#1a1a18', marginBottom: '0.7rem' }}>
                &pound;{it.price.toFixed(2)}
              </p>
            </a>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => moveOneToCart(it)}
                style={{
                  fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, fontSize: '0.48rem',
                  letterSpacing: '0.12em', textTransform: 'uppercase' as const,
                  color: '#fff', background: '#c4704a', border: '1px solid #c4704a',
                  padding: '0.4rem 0.85rem', cursor: 'pointer',
                }}
              >
                Add to Cart
              </button>
              <button
                type="button"
                onClick={() => removeFromWishlist(it.id)}
                aria-label="Remove"
                style={{
                  background: 'transparent', border: '1px solid #c8c4bc',
                  color: '#6e6a62',
                  padding: '0.4rem 0.65rem', cursor: 'pointer',
                  fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, fontSize: '0.48rem',
                  letterSpacing: '0.12em', textTransform: 'uppercase' as const,
                }}
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
