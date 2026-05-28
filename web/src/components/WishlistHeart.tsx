'use client';

import { useEffect, useState } from 'react';
import { isInWishlist, toggleWishlist, onWishlistChange } from '@/lib/wishlist';
import { showToast } from '@/components/Toast';
import { trackEvent } from '@/lib/analytics';

interface Props {
  id: number;
  name: string;
  price: number;
  image: string;
  slug: string;
  /** 'card' (small overlay on product card) or 'detail' (button on product page). */
  variant?: 'card' | 'detail';
}

export default function WishlistHeart({ id, name, price, image, slug, variant = 'card' }: Props) {
  const [active, setActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setActive(isInWishlist(id));
    return onWishlistChange(() => setActive(isInWishlist(id)));
  }, [id]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nowActive = toggleWishlist({ id, name, price, image, slug });
    showToast(nowActive ? 'Saved to wishlist' : 'Removed from wishlist');
    if (nowActive) {
      trackEvent('add_to_wishlist', {
        currency: 'GBP',
        value: price,
        items: [{ item_id: String(id), item_name: name, price, quantity: 1 }],
      });
    }
  };

  if (variant === 'detail') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={active ? 'Remove from wishlist' : 'Save to wishlist'}
        aria-pressed={active}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
          background: 'transparent',
          border: `1px solid ${active ? '#c4704a' : '#c8c4bc'}`,
          color: active ? '#c4704a' : '#3D3D3A',
          padding: '0.55rem 1rem',
          fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, fontSize: '0.55rem',
          letterSpacing: '0.16em', textTransform: 'uppercase' as const,
          cursor: 'pointer', transition: 'all 0.25s',
        }}
      >
        <svg viewBox="0 0 24 24" fill={active ? '#c4704a' : 'none'} stroke="currentColor" strokeWidth="1.6" style={{ width: 14, height: 14 }}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        {active ? 'Saved' : 'Save'}
      </button>
    );
  }

  // 'card' variant — small floating heart on top-right of product image
  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={active ? 'Remove from wishlist' : 'Save to wishlist'}
      aria-pressed={active}
      title={active ? 'Remove from wishlist' : 'Save to wishlist'}
      style={{
        position: 'absolute', top: 8, right: 8, zIndex: 2,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 32, height: 32, borderRadius: '50%',
        background: 'rgba(255,255,255,0.92)',
        border: 'none', cursor: 'pointer',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        color: active ? '#c4704a' : '#6e6a62',
        // Skip animation until mounted so SSR / first paint matches.
        transform: mounted && active ? 'scale(1.05)' : 'scale(1)',
        transition: 'transform 0.2s, color 0.2s',
      }}
    >
      <svg viewBox="0 0 24 24" fill={active ? '#c4704a' : 'none'} stroke="currentColor" strokeWidth="1.6" style={{ width: 16, height: 16 }}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
