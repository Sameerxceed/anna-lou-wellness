'use client';

import { useState, useEffect } from 'react';
import { getCartCount, onCartChange } from '@/lib/cart';

export default function CartIcon() {
  const [count, setCount] = useState(0);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    setCount(getCartCount());
    const unsub = onCartChange(() => {
      const newCount = getCartCount();
      setCount(newCount);
      if (newCount > 0) {
        setBump(true);
        setTimeout(() => setBump(false), 250);
      }
    });
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.count !== undefined) setCount(detail.count);
    };
    window.addEventListener('cart-updated', handler);
    return () => { unsub(); window.removeEventListener('cart-updated', handler); };
  }, []);

  return (
    <a href="/cart" className="nav-cart-island" aria-label="Cart" style={{ display: 'inline-flex', alignItems: 'center', position: 'relative', textDecoration: 'none', color: 'inherit' }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 16, height: 16 }}>
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
      </svg>
      {count > 0 && (
        <span style={{
          position: 'absolute', top: -6, right: -8, minWidth: 15, height: 15,
          borderRadius: '50%', background: '#c4704a', color: '#fff',
          fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.46rem', fontWeight: 400,
          display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
          transform: bump ? 'scale(1.35)' : 'scale(1)',
          transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
        }}>
          {count}
        </span>
      )}
    </a>
  );
}
