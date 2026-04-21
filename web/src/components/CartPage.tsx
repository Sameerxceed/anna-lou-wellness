'use client';

import { useState, useEffect } from 'react';
import { getCart, updateQty, removeFromCart, getCartTotal, onCartChange, type CartItem } from '@/lib/cart';

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);

  const refresh = () => {
    setCart(getCart());
    setTotal(getCartTotal());
  };

  useEffect(() => {
    refresh();
    return onCartChange(refresh);
  }, []);

  if (cart.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '1.3rem', color: '#6e6a62', marginBottom: '1.5rem' }}>
          Your cart is empty.
        </p>
        <a href="/shop" className="btn btn-outline">Continue Shopping</a>
      </div>
    );
  }

  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Product', '', 'Price', 'Qty', 'Subtotal', ''].map((h, i) => (
              <th key={i} style={{
                fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, fontSize: '0.5rem',
                letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#6e6a62',
                textAlign: 'left', padding: '0.6rem 0', borderBottom: '1px solid #c8c4bc',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cart.map(item => (
            <tr key={item.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
              <td style={{ padding: '1rem 0' }}>
                <img src={item.image} alt="" style={{ width: 60, height: 60, objectFit: 'cover' }} />
              </td>
              <td>
                <a href={`/shop/${item.slug}`} style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: '1rem', color: '#1a1a18', textDecoration: 'none' }}>
                  {item.name}
                </a>
              </td>
              <td style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, fontSize: '0.8rem', color: '#1a1a18' }}>
                &euro;{item.price.toFixed(2)}
              </td>
              <td>
                <input
                  type="number" value={item.qty} min={1} max={99}
                  onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 1)}
                  style={{
                    width: 46, textAlign: 'center', fontFamily: "'Lora', serif", fontSize: '0.85rem',
                    border: '1px solid #c8c4bc', padding: '0.3rem', background: 'transparent',
                    color: '#1a1a18', outline: 'none',
                  }}
                />
              </td>
              <td style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, fontSize: '0.8rem', color: '#1a1a18' }}>
                &euro;{(item.price * item.qty).toFixed(2)}
              </td>
              <td>
                <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c8c4bc', padding: '0.2rem', transition: 'color 0.3s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#c4704a')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#c8c4bc')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 14, height: 14 }}>
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ background: '#f5f0e8', padding: '2rem', marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', fontFamily: "'Lora', serif", fontSize: '0.88rem', color: '#6e6a62' }}>
          <span>Subtotal</span><span>&euro;{total.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', fontFamily: "'Lora', serif", fontSize: '0.88rem', color: '#6e6a62' }}>
          <span>Shipping</span><span style={{ fontStyle: 'italic', fontSize: '0.78rem', color: '#c8c4bc' }}>Calculated at checkout</span>
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', padding: '0.7rem 0 0', marginTop: '0.4rem',
          borderTop: '1px solid #c8c4bc', fontFamily: "'Josefin Sans', sans-serif", fontWeight: 400,
          fontSize: '0.92rem', letterSpacing: '0.04em', color: '#1a1a18',
        }}>
          <span>Total</span><span>&euro;{total.toFixed(2)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <a href="/shop" className="btn btn-outline">Continue Shopping</a>
        <a href="/checkout" className="btn btn-accent">Proceed to Checkout</a>
      </div>
    </div>
  );
}
