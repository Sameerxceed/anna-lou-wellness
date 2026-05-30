'use client';

import { useEffect, useState } from 'react';
import { getWishlistCount, onWishlistChange } from '@/lib/wishlist';

/**
 * Nav link to /wishlist with a small count badge that appears once the
 * visitor has saved at least one item. Uses the same `nav-cart-badge`
 * class as the cart counter so it stays visually consistent.
 *
 * The link is hidden until at least one item is saved — keeps the nav
 * clean for new visitors and only appears once it's relevant.
 */
export default function WishlistNavLink({
  className = 'nav-action-btn',
  label = 'Wishlist',
}: { className?: string; label?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(getWishlistCount());
    const off = onWishlistChange(() => setCount(getWishlistCount()));
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.count !== undefined) setCount(detail.count);
    };
    window.addEventListener('wishlist-updated', handler);
    return () => { off(); window.removeEventListener('wishlist-updated', handler); };
  }, []);

  if (count === 0) return null;

  return (
    <a href="/wishlist" className={className} aria-label={`${label} (${count} saved)`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 14, height: 14, marginRight: 6, verticalAlign: '-2px' }} aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {label}
      <span className="nav-cart-badge" style={{ background: '#c4704a' }}>{count}</span>
    </a>
  );
}
