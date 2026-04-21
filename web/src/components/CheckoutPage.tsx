'use client';

import { useState, useEffect } from 'react';
import { getCart, getCartTotal, clearCart, type CartItem } from '@/lib/cart';
import { showToast } from '@/components/Toast';

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [step, setStep] = useState<'form' | 'processing' | 'confirmed'>('form');
  const [orderNum, setOrderNum] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const c = getCart();
    if (c.length === 0) { window.location.href = '/cart'; return; }
    setCart(c);
    setTotal(getCartTotal());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    const num = 'ARD-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    setOrderNum(num);
    setTimeout(() => {
      setStep('confirmed');
      clearCart();
      showToast('Order placed successfully!');
    }, 1500);
  };

  if (step === 'confirmed') {
    return (
      <div style={{ textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(196,112,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#c4704a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="section-label">Order Confirmed</p>
        <h2 className="section-heading">Your order has been placed</h2>
        <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, fontSize: '1rem', letterSpacing: '0.15em', color: '#c4704a', margin: '0.8rem 0 1.5rem' }}>{orderNum}</p>
        <p className="section-body" style={{ margin: '0 auto 1.2rem', textAlign: 'center' }}>
          A confirmation will be sent to <strong>{email}</strong>.
        </p>
        <div style={{ maxWidth: 400, margin: '0 auto', textAlign: 'left' }}>
          <div style={{ background: '#f5f0e8', padding: '1.5rem' }}>
            {cart.map(i => (
              <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontFamily: "'Lora', serif", fontSize: '0.85rem', color: '#6e6a62' }}>
                <span>{i.name} &times; {i.qty}</span>
                <span>&euro;{(i.price * i.qty).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.7rem 0 0', marginTop: '0.4rem', borderTop: '1px solid #c8c4bc', fontFamily: "'Josefin Sans', sans-serif", fontWeight: 400, fontSize: '0.9rem', color: '#1a1a18' }}>
              <span>Total</span><span>&euro;{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <a href="/shop" className="btn btn-outline" style={{ marginTop: '2rem' }}>Continue Shopping</a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem', alignItems: 'start' }} className="checkout-grid">
        <div>
          <p className="section-label">Your Details</p>
          <h2 className="section-heading" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Shipping Information</h2>
          {[
            { label: 'Full Name *', type: 'text', required: true, placeholder: 'Your full name' },
            { label: 'Email *', type: 'email', required: true, placeholder: 'your@email.com', isEmail: true },
            { label: 'Phone', type: 'tel', required: false, placeholder: '+353...' },
          ].map(field => (
            <div key={field.label} style={{ marginBottom: '1.4rem' }}>
              <label style={{ display: 'block', fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, fontSize: '0.5rem', letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#6e6a62', marginBottom: '0.4rem' }}>{field.label}</label>
              <input
                type={field.type} required={field.required} placeholder={field.placeholder}
                onChange={field.isEmail ? (e) => setEmail(e.target.value) : undefined}
                style={{ width: '100%', fontFamily: "'Lora', serif", fontSize: '0.88rem', color: '#1a1a18', background: 'transparent', border: 'none', borderBottom: '1px solid #c8c4bc', padding: '0.6rem 0', outline: 'none' }}
              />
            </div>
          ))}
          <div style={{ marginBottom: '1.4rem' }}>
            <label style={{ display: 'block', fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, fontSize: '0.5rem', letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#6e6a62', marginBottom: '0.4rem' }}>Shipping Address *</label>
            <textarea required placeholder="Full postal address" style={{ width: '100%', fontFamily: "'Lora', serif", fontSize: '0.88rem', color: '#1a1a18', background: 'transparent', border: '1px solid #c8c4bc', padding: '0.7rem', outline: 'none', minHeight: 80, resize: 'vertical' }} />
          </div>
          <div style={{ marginTop: '1.8rem' }}>
            <p className="section-label">Payment Method</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.7rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.75rem 1rem', border: '1px solid rgba(0,0,0,0.06)', cursor: 'pointer' }}>
                <input type="radio" name="payment" value="bank" defaultChecked style={{ accentColor: '#c4704a' }} />
                <div>
                  <div style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, fontSize: '0.56rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Bank Transfer</div>
                  <div style={{ fontFamily: "'Lora', serif", fontSize: '0.7rem', color: '#6e6a62', marginTop: 2 }}>Pay by bank transfer. Order confirmed on receipt.</div>
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.75rem 1rem', border: '1px solid rgba(0,0,0,0.06)', cursor: 'pointer' }}>
                <input type="radio" name="payment" value="stripe" style={{ accentColor: '#c4704a' }} />
                <div>
                  <div style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, fontSize: '0.56rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Card Payment (Stripe)</div>
                  <div style={{ fontFamily: "'Lora', serif", fontSize: '0.7rem', color: '#6e6a62', marginTop: 2 }}>Visa, Mastercard, Apple Pay.</div>
                </div>
              </label>
            </div>
          </div>
          <button type="submit" disabled={step === 'processing'} className="btn btn-accent"
            style={{ width: '100%', textAlign: 'center', marginTop: '1.8rem', padding: '0.9rem' }}>
            {step === 'processing' ? 'Processing...' : `Place Order \u2014 \u20AC${total.toFixed(2)}`}
          </button>
          <p style={{ textAlign: 'center', marginTop: '0.7rem', fontFamily: "'Lora', serif", fontSize: '0.72rem', color: '#c8c4bc' }}>
            Your order will be confirmed by email.
          </p>
        </div>

        <div style={{ position: 'sticky', top: '6rem', background: '#f5f0e8', padding: '2rem' }} className="checkout-summary">
          <p className="section-label" style={{ marginBottom: '0.8rem' }}>Order Summary</p>
          {cart.map(i => (
            <div key={i.id} style={{ display: 'flex', gap: '0.7rem', padding: '0.55rem 0', borderBottom: '1px solid rgba(0,0,0,0.04)', alignItems: 'center' }}>
              <img src={i.image} alt="" style={{ width: 44, height: 44, objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Lora', serif", fontSize: '0.8rem', color: '#1a1a18', lineHeight: 1.3 }}>{i.name}</div>
                <div style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.48rem', letterSpacing: '0.1em', color: '#6e6a62' }}>Qty: {i.qty}</div>
              </div>
              <div style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.76rem', color: '#1a1a18', flexShrink: 0 }}>&euro;{(i.price * i.qty).toFixed(2)}</div>
            </div>
          ))}
          <div style={{ marginTop: '0.8rem', paddingTop: '0.6rem', borderTop: '1px solid #c8c4bc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', fontFamily: "'Lora', serif", fontSize: '0.85rem', color: '#6e6a62' }}>
              <span>Subtotal</span><span>&euro;{total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', fontFamily: "'Lora', serif", fontSize: '0.85rem', color: '#6e6a62' }}>
              <span>Shipping</span><span>TBC</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0 0', marginTop: '0.3rem', borderTop: '1px solid #c8c4bc', fontFamily: "'Josefin Sans', sans-serif", fontWeight: 400, fontSize: '0.9rem', color: '#1a1a18' }}>
              <span>Total</span><span>&euro;{total.toFixed(2)}</span>
            </div>
          </div>
          <a href="/cart" style={{ display: 'block', textAlign: 'center', marginTop: '0.8rem', fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.5rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#6e6a62', textDecoration: 'none' }}>&larr; Edit Cart</a>
        </div>
      </div>
    </form>
  );
}
