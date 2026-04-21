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
}

export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

export function getCartTotal(): number {
  return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}
