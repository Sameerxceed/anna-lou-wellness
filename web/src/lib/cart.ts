// Cart Store — shared across all React components
// Uses sessionStorage so cart persists across page navigations

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  slug: string;
  qty: number;
}

const CART_KEY = 'siteCart';

// Event system for cross-component updates
const listeners: Set<() => void> = new Set();
export function onCartChange(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }
function notify() { listeners.forEach(fn => fn()); }

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(sessionStorage.getItem(CART_KEY) || '[]'); }
  catch { return []; }
}

function saveCart(cart: CartItem[]) {
  sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
  notify();
  window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count: getCartCount() } }));
}

export function addToCart(item: Omit<CartItem, 'qty'>, qty = 1) {
  const cart = getCart();
  const existing = cart.find(i => i.id === item.id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ ...item, qty });
  }
  saveCart(cart);
}

export function updateQty(id: number, qty: number) {
  let cart = getCart();
  if (qty <= 0) {
    cart = cart.filter(i => i.id !== id);
  } else {
    const item = cart.find(i => i.id === id);
    if (item) item.qty = qty;
  }
  saveCart(cart);
}

export function removeFromCart(id: number) {
  saveCart(getCart().filter(i => i.id !== id));
}

export function clearCart() {
  saveCart([]);
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(COUPON_KEY);
    sessionStorage.removeItem(GIFTWRAP_KEY);
  }
}

export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

export function getCartTotal(): number {
  return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}

// ── Applied coupon (sessionStorage) ──

export interface AppliedCoupon {
  code: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  discount: number;       // amount in £ — for free_shipping this is 0 (shipping handled separately)
  freeShipping: boolean;
  message: string;
}

const COUPON_KEY = 'siteCartCoupon';

export function getAppliedCoupon(): AppliedCoupon | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(COUPON_KEY);
    return raw ? (JSON.parse(raw) as AppliedCoupon) : null;
  } catch {
    return null;
  }
}

export function setAppliedCoupon(c: AppliedCoupon | null) {
  if (typeof window === 'undefined') return;
  if (c) sessionStorage.setItem(COUPON_KEY, JSON.stringify(c));
  else sessionStorage.removeItem(COUPON_KEY);
  notify();
}

export function clearAppliedCoupon() {
  setAppliedCoupon(null);
}

// ── Gift wrap (sessionStorage) ──

const GIFTWRAP_KEY = 'siteCartGiftWrap';

export function getGiftWrap(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(GIFTWRAP_KEY) === '1';
}

export function setGiftWrap(enabled: boolean) {
  if (typeof window === 'undefined') return;
  if (enabled) sessionStorage.setItem(GIFTWRAP_KEY, '1');
  else sessionStorage.removeItem(GIFTWRAP_KEY);
  notify();
}
