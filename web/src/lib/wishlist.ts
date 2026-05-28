// Wishlist Store — localStorage so saved items persist across sessions
// (cart uses sessionStorage; wishlist users expect their picks to be there
// when they come back tomorrow, not just this visit).
//
// Public, no-auth: writing a `wishlist-item` record per user would require
// the shop side to sit behind a Strapi user account. That's a bigger UX
// shift than this gap needs. Local storage gives the customer a working
// wishlist immediately; a future Phase 2 can sync to Strapi if/when the
// shop adopts accounts.

export interface WishlistItem {
  id: number;
  name: string;
  price: number;
  image: string;
  slug: string;
  addedAt: number;
}

const WISHLIST_KEY = 'siteWishlist';

const listeners: Set<() => void> = new Set();
export function onWishlistChange(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }
function notify() {
  listeners.forEach((fn) => fn());
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: { count: getWishlistCount() } }));
  }
}

export function getWishlist(): WishlistItem[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]'); }
  catch { return []; }
}

function save(list: WishlistItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  notify();
}

export function isInWishlist(id: number): boolean {
  return getWishlist().some((i) => i.id === id);
}

export function addToWishlist(item: Omit<WishlistItem, 'addedAt'>) {
  const list = getWishlist();
  if (list.some((i) => i.id === item.id)) return;
  list.unshift({ ...item, addedAt: Date.now() });
  save(list);
}

export function removeFromWishlist(id: number) {
  save(getWishlist().filter((i) => i.id !== id));
}

export function toggleWishlist(item: Omit<WishlistItem, 'addedAt'>): boolean {
  if (isInWishlist(item.id)) { removeFromWishlist(item.id); return false; }
  addToWishlist(item);
  return true;
}

export function clearWishlist() {
  save([]);
}

export function getWishlistCount(): number {
  return getWishlist().length;
}
