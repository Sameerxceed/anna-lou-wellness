'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getCart,
  updateQty,
  removeFromCart,
  getCartTotal,
  onCartChange,
  getAppliedCoupon,
  setAppliedCoupon,
  clearAppliedCoupon,
  type CartItem,
  type AppliedCoupon,
} from '@/lib/cart';

type ShopSettings = {
  freeShippingThreshold: number;
  freeShippingLabel: string;
  shippingFlatRate: number;
};

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [settings, setSettings] = useState<ShopSettings>({
    freeShippingThreshold: 50,
    freeShippingLabel: 'Free UK shipping on orders over £50',
    shippingFlatRate: 4.95,
  });
  const [code, setCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const refresh = useCallback(() => {
    setCart(getCart());
    setSubtotal(getCartTotal());
    setCoupon(getAppliedCoupon());
  }, []);

  useEffect(() => {
    refresh();
    const off = onCartChange(refresh);
    fetch('/api/shop-settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => { if (s) setSettings({
        freeShippingThreshold: s.freeShippingThreshold,
        freeShippingLabel: s.freeShippingLabel,
        shippingFlatRate: s.shippingFlatRate,
      }); })
      .catch(() => {});
    return off;
  }, [refresh]);

  // Re-validate the saved coupon whenever the cart contents change. If the
  // user emptied the cart of the eligible items the coupon disappears.
  useEffect(() => {
    if (!coupon || cart.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/coupon/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: coupon.code, items: cart.map((i) => ({ productId: i.id, qty: i.qty })) }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || !data?.valid) {
          clearAppliedCoupon();
        } else if (data.discount !== coupon.discount || data.freeShipping !== coupon.freeShipping) {
          setAppliedCoupon({
            code: data.code || coupon.code,
            type: data.type || coupon.type,
            discount: Number(data.discount) || 0,
            freeShipping: !!data.freeShipping,
            message: data.message || coupon.message,
          });
        }
      } catch { /* offline — keep saved coupon as-is */ }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.map((i) => `${i.id}:${i.qty}`).join('|')]);

  async function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setCouponError('');
    setCouponLoading(true);
    try {
      const res = await fetch('/api/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), items: cart.map((i) => ({ productId: i.id, qty: i.qty })) }),
      });
      const data = await res.json();
      if (!res.ok || !data?.valid) {
        setCouponError(data?.message || 'Coupon code is not valid');
        setAppliedCoupon(null);
        return;
      }
      setAppliedCoupon({
        code: data.code || code.trim().toUpperCase(),
        type: data.type,
        discount: Number(data.discount) || 0,
        freeShipping: !!data.freeShipping,
        message: data.message,
      });
      setCode('');
    } catch {
      setCouponError('Could not check coupon. Please try again.');
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    clearAppliedCoupon();
    setCouponError('');
  }

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

  const discount = coupon?.discount || 0;
  const qualifiesFreeShipping = coupon?.freeShipping || subtotal >= settings.freeShippingThreshold;
  const shipping = qualifiesFreeShipping ? 0 : settings.shippingFlatRate;
  const total = Math.max(0, subtotal - discount + shipping);
  const awayFromFree = Math.max(0, settings.freeShippingThreshold - subtotal);
  const trackerPct = settings.freeShippingThreshold > 0
    ? Math.min(100, Math.round((subtotal / settings.freeShippingThreshold) * 100))
    : 100;

  return (
    <div>
      {/* Free-shipping tracker */}
      {settings.freeShippingThreshold > 0 && (
        <div style={{ background: '#fff', border: '1px solid #ece6dc', padding: '0.9rem 1.1rem', marginBottom: '1.2rem' }}>
          <p style={{ fontFamily: "'Lora', serif", fontSize: '0.85rem', color: qualifiesFreeShipping ? '#5a7a4a' : '#6e6a62', margin: 0, marginBottom: '0.45rem' }}>
            {qualifiesFreeShipping
              ? `✓ ${settings.freeShippingLabel} — you qualify.`
              : `Add £${awayFromFree.toFixed(2)} more for ${settings.freeShippingLabel.toLowerCase().replace(/^free\s+/, 'free ').trim()}.`}
          </p>
          <div style={{ height: 4, background: '#ece6dc', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              width: `${trackerPct}%`,
              height: '100%',
              background: qualifiesFreeShipping ? '#5a7a4a' : '#c4704a',
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>
      )}

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
                &pound;{item.price.toFixed(2)}
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
                &pound;{(item.price * item.qty).toFixed(2)}
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

      {/* Coupon entry */}
      <div style={{ marginTop: '1.5rem', padding: '1.1rem 1.2rem', background: '#fff', border: '1px solid #ece6dc' }}>
        {coupon ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 400, fontSize: '0.62rem', letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: '#5a7a4a', margin: 0, marginBottom: '0.2rem' }}>
                Coupon applied · {coupon.code}
              </p>
              <p style={{ fontFamily: "'Lora', serif", fontStyle: 'italic', fontSize: '0.82rem', color: '#3D3D3A', margin: 0 }}>
                {coupon.message}
              </p>
            </div>
            <button
              type="button"
              onClick={removeCoupon}
              style={{
                background: 'none', border: '1px solid #c8c4bc', cursor: 'pointer',
                fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, fontSize: '0.55rem',
                letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: '#6e6a62',
                padding: '0.5rem 0.9rem',
              }}
            >
              Remove
            </button>
          </div>
        ) : (
          <form onSubmit={applyCoupon} style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <label htmlFor="coupon-code" style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, fontSize: '0.55rem', letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#6e6a62', flexBasis: '100%' }}>
              Have a coupon?
            </label>
            <input
              id="coupon-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code"
              autoComplete="off"
              style={{
                flex: '1 1 200px', fontFamily: "'Lora', serif", fontSize: '0.9rem',
                color: '#1a1a18', background: 'transparent', border: '1px solid #c8c4bc',
                padding: '0.55rem 0.7rem', outline: 'none', textTransform: 'uppercase' as const, letterSpacing: '0.05em',
              }}
            />
            <button
              type="submit"
              disabled={couponLoading || !code.trim()}
              className="btn btn-outline"
              style={{ padding: '0.55rem 1.2rem', opacity: couponLoading ? 0.6 : 1 }}
            >
              {couponLoading ? 'Checking…' : 'Apply'}
            </button>
            {couponError && (
              <p style={{ fontFamily: "'Lora', serif", fontSize: '0.78rem', color: '#a01f1d', margin: 0, flexBasis: '100%' }}>
                {couponError}
              </p>
            )}
          </form>
        )}
      </div>

      <div style={{ background: '#f5f0e8', padding: '2rem', marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', fontFamily: "'Lora', serif", fontSize: '0.88rem', color: '#6e6a62' }}>
          <span>Subtotal</span><span>&pound;{subtotal.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', fontFamily: "'Lora', serif", fontSize: '0.88rem', color: '#5a7a4a' }}>
            <span>Discount {coupon?.code ? `(${coupon.code})` : ''}</span><span>&minus;&pound;{discount.toFixed(2)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', fontFamily: "'Lora', serif", fontSize: '0.88rem', color: '#6e6a62' }}>
          <span>Shipping</span>
          <span>
            {qualifiesFreeShipping ? (
              <span style={{ color: '#5a7a4a' }}>Free</span>
            ) : (
              <>&pound;{shipping.toFixed(2)}</>
            )}
          </span>
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', padding: '0.7rem 0 0', marginTop: '0.4rem',
          borderTop: '1px solid #c8c4bc', fontFamily: "'Josefin Sans', sans-serif", fontWeight: 400,
          fontSize: '0.92rem', letterSpacing: '0.04em', color: '#1a1a18',
        }}>
          <span>Total</span><span>&pound;{total.toFixed(2)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <a href="/shop" className="btn btn-outline">Continue Shopping</a>
        <a href="/checkout" className="btn btn-accent">Proceed to Checkout</a>
      </div>
    </div>
  );
}
