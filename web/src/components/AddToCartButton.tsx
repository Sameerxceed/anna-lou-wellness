'use client';

import { useState } from 'react';
import { addToCart } from '@/lib/cart';
import { showToast } from '@/components/Toast';

interface Props {
  id: number;
  name: string;
  price: number;
  image: string;
  slug: string;
  stock: number;
  qty?: number;
}

export default function AddToCartButton({ id, name, price, image, slug, stock, qty = 1 }: Props) {
  const [added, setAdded] = useState(false);

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
    addToCart({ id, name, price, image, slug }, qty);
    setAdded(true);
    showToast(qty > 1 ? `${qty} items added to cart` : 'Added to cart');
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <button
      onClick={handleClick}
      disabled={added}
      style={{
        fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, fontSize: '0.48rem',
        letterSpacing: '0.12em', textTransform: 'uppercase' as const,
        color: '#fff',
        background: added ? '#1a1a18' : '#c4704a',
        border: `1px solid ${added ? '#1a1a18' : '#c4704a'}`,
        padding: '0.42rem 0.85rem', cursor: added ? 'default' : 'pointer',
        transition: 'all 0.3s',
      }}
    >
      {added ? '\u2713 Added' : 'Add to Cart'}
    </button>
  );
}
