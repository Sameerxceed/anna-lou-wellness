'use client';

import { useState, useEffect } from 'react';
import {
  getCart,
  getCartTotal,
  clearCart,
  getAppliedCoupon,
  getGiftWrap,
  setGiftWrap,
  type CartItem,
  type AppliedCoupon,
} from '@/lib/cart';
import { showToast } from '@/components/Toast';
import { trackEvent, trackPurchase } from '@/lib/analytics';

type BankDetails = {
  accountName: string;
  sortCode: string;
  accountNumber: string;
  iban: string;
  reference: string;
};

type ShopSettings = {
  freeShippingThreshold: number;
  freeShippingLabel: string;
  shippingFlatRate: number;
  giftWrapEnabled: boolean;
  giftWrapPrice: number;
  giftWrapLabel: string;
  giftWrapDescription: string;
};

const defaultShopSettings: ShopSettings = {
  freeShippingThreshold: 50,
  freeShippingLabel: 'Free UK shipping on orders over £50',
  shippingFlatRate: 4.95,
  giftWrapEnabled: true,
  giftWrapPrice: 3.5,
  giftWrapLabel: 'Add gift wrap',
  giftWrapDescription: 'Hand-tied with a satin ribbon and a card you can personalise.',
};

type InitialUser = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
} | null;

export default function CheckoutPage({ initialUser = null }: { initialUser?: InitialUser } = {}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [giftWrap, setGiftWrapState] = useState(false);
  const [settings, setSettings] = useState<ShopSettings>(defaultShopSettings);
  const [step, setStep] = useState<'form' | 'processing' | 'confirmed'>('form');
  const [orderNum, setOrderNum] = useState('');
  const [email, setEmail] = useState(initialUser?.email || '');
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'stripe'>('bank');
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmedTotal, setConfirmedTotal] = useState(0);

  const isLoggedIn = Boolean(initialUser);
  const fullName = initialUser
    ? [initialUser.firstName, initialUser.lastName].filter(Boolean).join(' ').trim()
    : '';

  useEffect(() => {
    const c = getCart();
    if (c.length === 0) { window.location.href = '/cart'; return; }
    setCart(c);
    setSubtotal(getCartTotal());
    setCoupon(getAppliedCoupon());
    setGiftWrapState(getGiftWrap());

    fetch('/api/shop-settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => { if (s) setSettings(s); })
      .catch(() => {});

    // Fire begin_checkout once when the visitor lands on this page with a
    // populated cart. GA4 + Meta both expect this event before purchase.
    trackEvent('begin_checkout', {
      currency: 'GBP',
      value: getCartTotal(),
      items: c.map((i) => ({
        item_id: String(i.id),
        item_name: i.name,
        price: i.price,
        quantity: i.qty,
      })),
    });
  }, []);

  const discount = coupon?.discount || 0;
  const qualifiesFreeShipping = coupon?.freeShipping || subtotal >= settings.freeShippingThreshold;
  const shipping = qualifiesFreeShipping ? 0 : settings.shippingFlatRate;
  const giftWrapAmount = giftWrap && settings.giftWrapEnabled ? settings.giftWrapPrice : 0;
  const total = Math.max(0, subtotal - discount + shipping + giftWrapAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStep('processing');

    const fd = new FormData(e.target as HTMLFormElement);
    const payment = (fd.get('payment') as 'bank' | 'stripe') || 'bank';
    setPaymentMethod(payment);

    const payload = {
      customer: {
        name: String(fd.get('name') || '').trim(),
        email: String(fd.get('email') || '').trim().toLowerCase(),
        phone: String(fd.get('phone') || '').trim() || undefined,
        address: String(fd.get('address') || '').trim(),
      },
      items: cart.map((i) => ({ productId: i.id, qty: i.qty })),
      paymentMethod: payment,
      couponCode: coupon?.code || undefined,
      giftWrap: giftWrap && settings.giftWrapEnabled,
    };

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || 'Checkout failed. Please try again.');
        setStep('form');
        return;
      }

      if (payment === 'stripe') {
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        setError('Stripe session error. Please try again.');
        setStep('form');
        return;
      }

      setOrderNum(data.orderNumber);
      setConfirmedTotal(Number(data.total) || total);
      setBankDetails(data.bankDetails);
      // Fire purchase event BEFORE clearing the cart so we still have items.
      trackPurchase({
        transactionId: data.orderNumber,
        value: Number(data.total) || total,
        currency: 'GBP',
        items: cart.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
      });
      clearCart();
      setStep('confirmed');
      showToast('Order placed. Bank details below.');
    } catch (err: any) {
      setError(err?.message || 'Network error. Please try again.');
      setStep('form');
    }
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
                <span>&pound;{(i.price * i.qty).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.7rem 0 0', marginTop: '0.4rem', borderTop: '1px solid #c8c4bc', fontFamily: "'Josefin Sans', sans-serif", fontWeight: 400, fontSize: '0.9rem', color: '#1a1a18' }}>
              <span>Total</span><span>&pound;{confirmedTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
        {bankDetails && (
          <div style={{ maxWidth: 460, margin: '1.5rem auto 0', textAlign: 'left', background: '#fff', border: '1px solid #c8c4bc', padding: '1.5rem' }}>
            <p className="section-label" style={{ marginBottom: '0.6rem', color: '#6E3A5A' }}>Bank Transfer Details</p>
            <p style={{ fontFamily: "'Lora', serif", fontSize: '0.85rem', color: '#3D3D3A', lineHeight: 1.7, marginBottom: '0.8rem' }}>
              Please transfer <strong>&pound;{confirmedTotal.toFixed(2)}</strong> using your order number <strong>{bankDetails.reference}</strong> as the reference.
            </p>
            <div style={{ fontFamily: "'Lora', serif", fontSize: '0.85rem', color: '#3D3D3A', lineHeight: 1.8 }}>
              <div><strong>Account name:</strong> {bankDetails.accountName}</div>
              <div><strong>Sort code:</strong> {bankDetails.sortCode}</div>
              <div><strong>Account number:</strong> {bankDetails.accountNumber}</div>
              <div><strong>IBAN:</strong> {bankDetails.iban}</div>
              <div><strong>Reference:</strong> {bankDetails.reference}</div>
            </div>
            <p style={{ fontFamily: "'Lora', serif", fontSize: '0.75rem', color: '#8C8880', marginTop: '0.8rem', fontStyle: 'italic' }}>
              Your order will be confirmed and dispatched once payment is received. For any questions, email hello@annalouwellness.com.
            </p>
          </div>
        )}
        <a href="/shop" className="btn btn-outline" style={{ marginTop: '2rem' }}>Continue Shopping</a>
      </div>
    );
  }

  const fieldDefaults: Record<string, string> = {
    name: fullName,
    email: initialUser?.email || '',
    phone: initialUser?.phone || '',
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem', alignItems: 'start' }} className="checkout-grid">
        <div>
          {/* Logged-in welcome OR "sign in" prompt for returning customers */}
          {isLoggedIn ? (
            <div style={{ padding: '0.85rem 1.1rem', background: '#EFE4D8', border: '1px solid #c4704a', marginBottom: '1.6rem', fontFamily: "'Lora', serif", fontSize: '0.88rem', color: '#3D3D3A', lineHeight: 1.5 }}>
              Signed in as <strong>{initialUser?.email}</strong>. Your details below are pre-filled from your last order — feel free to edit. <a href="/api/auth/logout" style={{ color: '#6E3A5A', marginLeft: '0.4rem' }}>Sign out</a>
            </div>
          ) : (
            <div style={{ padding: '0.85rem 1.1rem', background: '#F5F0E8', border: '1px solid #ece6dc', marginBottom: '1.6rem', fontFamily: "'Lora', serif", fontSize: '0.88rem', color: '#3D3D3A', lineHeight: 1.5 }}>
              Already shopped with us? <a href={`/login?next=${encodeURIComponent('/checkout')}`} style={{ color: '#6E3A5A', fontWeight: 600 }}>Sign in</a> to pre-fill your details and skip the form.
            </div>
          )}

          <p className="section-label">Your Details</p>
          <h2 className="section-heading" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Shipping Information</h2>
          {[
            { name: 'name', label: 'Full Name *', type: 'text', required: true, placeholder: 'Your full name' },
            { name: 'email', label: 'Email *', type: 'email', required: true, placeholder: 'your@email.com', isEmail: true },
            { name: 'phone', label: 'Phone', type: 'tel', required: false, placeholder: '+44...' },
          ].map(field => (
            <div key={field.label} style={{ marginBottom: '1.4rem' }}>
              <label style={{ display: 'block', fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, fontSize: '0.5rem', letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#6e6a62', marginBottom: '0.4rem' }}>{field.label}</label>
              <input
                name={field.name} type={field.type} required={field.required} placeholder={field.placeholder}
                defaultValue={fieldDefaults[field.name] || ''}
                onChange={field.isEmail ? (e) => setEmail(e.target.value) : undefined}
                style={{ width: '100%', fontFamily: "'Lora', serif", fontSize: '0.88rem', color: '#1a1a18', background: 'transparent', border: 'none', borderBottom: '1px solid #c8c4bc', padding: '0.6rem 0', outline: 'none' }}
              />
            </div>
          ))}
          <div style={{ marginBottom: '1.4rem' }}>
            <label style={{ display: 'block', fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, fontSize: '0.5rem', letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#6e6a62', marginBottom: '0.4rem' }}>Shipping Address *</label>
            <textarea
              name="address" required placeholder="Full postal address"
              defaultValue={initialUser?.address || ''}
              style={{ width: '100%', fontFamily: "'Lora', serif", fontSize: '0.88rem', color: '#1a1a18', background: 'transparent', border: '1px solid #c8c4bc', padding: '0.7rem', outline: 'none', minHeight: 80, resize: 'vertical' }}
            />
          </div>

          {/* Guest account-creation notice — only shown to non-logged-in users */}
          {!isLoggedIn && (
            <div style={{ marginBottom: '1.4rem', padding: '0.7rem 1rem', background: '#FAF7F0', border: '1px dashed #c8c4bc', fontFamily: "'Lora', serif", fontSize: '0.8rem', color: '#6e6a62', fontStyle: 'italic', lineHeight: 1.5 }}>
              We&rsquo;ll create a free account for you with this email so you can track your order, see past purchases, and skip the form next time. We&rsquo;ll send you a one-time link to set your password — no marketing emails.
            </div>
          )}

          {settings.giftWrapEnabled && (
            <div style={{ marginBottom: '1.6rem', padding: '0.9rem 1.1rem', background: '#fff', border: '1px solid #ece6dc' }}>
              <label style={{ display: 'flex', gap: '0.7rem', alignItems: 'flex-start', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={giftWrap}
                  onChange={(e) => { const v = e.target.checked; setGiftWrapState(v); setGiftWrap(v); }}
                  style={{ marginTop: 3, accentColor: '#c4704a' }}
                />
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.6rem', alignItems: 'baseline' }}>
                    <span style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 400, fontSize: '0.62rem', letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: '#1a1a18' }}>
                      {settings.giftWrapLabel}
                    </span>
                    <span style={{ fontFamily: "'Lora', serif", fontSize: '0.85rem', color: '#1a1a18' }}>
                      +£{settings.giftWrapPrice.toFixed(2)}
                    </span>
                  </div>
                  <p style={{ fontFamily: "'Lora', serif", fontStyle: 'italic', fontSize: '0.8rem', color: '#6e6a62', margin: '0.25rem 0 0' }}>
                    {settings.giftWrapDescription}
                  </p>
                </div>
              </label>
            </div>
          )}

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
          {error && (
            <p style={{ marginTop: '1rem', padding: '0.7rem 1rem', background: 'rgba(238,49,47,0.08)', border: '1px solid rgba(238,49,47,0.3)', color: '#a01f1d', fontFamily: "'Lora', serif", fontSize: '0.85rem' }}>
              {error}
            </p>
          )}
          <button type="submit" disabled={step === 'processing'} className="btn btn-accent"
            style={{ width: '100%', textAlign: 'center', marginTop: '1.8rem', padding: '0.9rem' }}>
            {step === 'processing' ? 'Processing...' : `Place Order — £${total.toFixed(2)}`}
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
              <div style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.76rem', color: '#1a1a18', flexShrink: 0 }}>&pound;{(i.price * i.qty).toFixed(2)}</div>
            </div>
          ))}
          <div style={{ marginTop: '0.8rem', paddingTop: '0.6rem', borderTop: '1px solid #c8c4bc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', fontFamily: "'Lora', serif", fontSize: '0.85rem', color: '#6e6a62' }}>
              <span>Subtotal</span><span>&pound;{subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', fontFamily: "'Lora', serif", fontSize: '0.85rem', color: '#5a7a4a' }}>
                <span>Discount {coupon?.code ? `(${coupon.code})` : ''}</span><span>&minus;&pound;{discount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', fontFamily: "'Lora', serif", fontSize: '0.85rem', color: '#6e6a62' }}>
              <span>Shipping</span>
              <span>{qualifiesFreeShipping ? <span style={{ color: '#5a7a4a' }}>Free</span> : <>&pound;{shipping.toFixed(2)}</>}</span>
            </div>
            {giftWrapAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', fontFamily: "'Lora', serif", fontSize: '0.85rem', color: '#6e6a62' }}>
                <span>Gift wrap</span><span>&pound;{giftWrapAmount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0 0', marginTop: '0.3rem', borderTop: '1px solid #c8c4bc', fontFamily: "'Josefin Sans', sans-serif", fontWeight: 400, fontSize: '0.9rem', color: '#1a1a18' }}>
              <span>Total</span><span>&pound;{total.toFixed(2)}</span>
            </div>
          </div>
          <a href="/cart" style={{ display: 'block', textAlign: 'center', marginTop: '0.8rem', fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.5rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#6e6a62', textDecoration: 'none' }}>&larr; Edit Cart</a>
        </div>
      </div>
    </form>
  );
}
