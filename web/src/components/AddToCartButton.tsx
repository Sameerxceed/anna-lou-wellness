'use client';

import { useState } from 'react';
import { addToCart } from '@/lib/cart';
import { showToast } from '@/components/Toast';
import { trackEvent } from '@/lib/analytics';

interface Props {
  id: number;
  name: string;
  price: number;
  image: string;
  slug: string;
  stock: number;
  qty?: number;
}

/**
 * Anna 6 Jul: "The Add to Cart button doesn't go anywhere so I can't see
 * where the items are in the cart." Root cause: the button silently
 * added to the cart with only a toast + a nav-badge count update, both
 * of which she missed. Fix: after adding, morph the button into a
 * "View cart \u2192" link that persists for 5 seconds. Direct next step,
 * hard to miss.
 */
export default function AddToCartButton({ id, name, price, image, slug, stock, qty = 1 }: Props) {
  // 'idle' | 'added' | 'link'
  const [state, setState] = useState<'idle' | 'added' | 'link'>('idle');

  if (stock <= 0) {
    return (
      <span style={{
        fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, fontSize: '0.48rem',
        letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#c8c4bc',
      }}>
        Sold Out
      </span>
    );
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (state !== 'idle') return;
    addToCart({ id, name, price, image, slug }, qty);
    setState('added');
    showToast(qty > 1 ? `${qty} items added \u2014 click cart icon top-right to review` : 'Added to cart \u2014 click cart icon top-right to review');
    trackEvent('add_to_cart', {
      currency: 'GBP',
      value: price * qty,
      items: [{ item_id: String(id), item_name: name, price, quantity: qty }],
    });
    // 1.4s of "\u2713 Added" for confirmation, then 5s of "View cart \u2192" link
    // so Anna (or any customer) has a direct path to the cart. Total 6.4s
    // of feedback before the button reverts to normal.
    setTimeout(() => setState('link'), 1400);
    setTimeout(() => setState('idle'), 6400);
  };

  const baseStyle: React.CSSProperties = {
    fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, fontSize: '0.48rem',
    letterSpacing: '0.12em', textTransform: 'uppercase' as const,
    padding: '0.42rem 0.85rem',
    transition: 'all 0.3s',
    textDecoration: 'none',
    display: 'inline-block',
  };

  if (state === 'link') {
    return (
      <a
        href="/cart"
        style={{
          ...baseStyle,
          color: '#fff',
          background: '#0A7A3B',
          border: '1px solid #0A7A3B',
          cursor: 'pointer',
        }}
      >
        View cart &rarr;
      </a>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={state === 'added'}
      style={{
        ...baseStyle,
        color: '#fff',
        background: state === 'added' ? '#1a1a18' : '#c4704a',
        border: `1px solid ${state === 'added' ? '#1a1a18' : '#c4704a'}`,
        cursor: state === 'added' ? 'default' : 'pointer',
      }}
    >
      {state === 'added' ? '\u2713 Added' : 'Add to Cart'}
    </button>
  );
}
