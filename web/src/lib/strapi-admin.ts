/**
 * Strapi admin operations using the long-lived admin API token.
 *
 * Used by the Stripe webhook to create/update users and assign the
 * 'reset-room-member' role on successful subscription.
 *
 * Env var:
 *   STRAPI_ADMIN_API_TOKEN - full-access token (Strapi admin -> Settings -> API Tokens)
 */

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const ADMIN_TOKEN = process.env.STRAPI_ADMIN_API_TOKEN;

function authHeaders() {
  if (!ADMIN_TOKEN) {
    throw new Error('STRAPI_ADMIN_API_TOKEN not set — cannot perform admin operations');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${ADMIN_TOKEN}`,
  };
}

export type StrapiUser = {
  id: number;
  email: string;
  username: string;
  confirmed: boolean;
  blocked: boolean;
  role?: { id: number; name: string; type: string };
};

export type StrapiRole = {
  id: number;
  name: string;
  type: string;
};

/**
 * Find a user by email. Returns null if not found.
 */
export async function findUserByEmail(email: string): Promise<StrapiUser | null> {
  const url = new URL(`${STRAPI_URL}/api/users`);
  url.searchParams.set('filters[email][$eq]', email.toLowerCase());
  url.searchParams.set('populate', 'role');

  const res = await fetch(url.toString(), { headers: authHeaders(), cache: 'no-store' });
  if (!res.ok) throw new Error(`findUserByEmail ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as StrapiUser[];
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

/**
 * Find a role by its `type` slug (e.g. 'reset-room-member', 'authenticated').
 */
export async function findRoleByType(type: string): Promise<StrapiRole | null> {
  const res = await fetch(`${STRAPI_URL}/api/users-permissions/roles`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`findRoleByType ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { roles: StrapiRole[] };
  return data.roles.find((r) => r.type === type) || null;
}

/**
 * Create a new user with the given role. Returns the created user.
 * Password is randomized; caller should trigger a password-reset email
 * so the user can set their own.
 */
export async function createUser(args: {
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  roleId: number;
}): Promise<StrapiUser> {
  // Random 32-char password — user resets via email.
  const password = Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const res = await fetch(`${STRAPI_URL}/api/users`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      email: args.email.toLowerCase(),
      username: args.username,
      password,
      confirmed: true,
      blocked: false,
      role: args.roleId,
      firstName: args.firstName,
      lastName: args.lastName,
    }),
  });
  if (!res.ok) throw new Error(`createUser ${res.status}: ${await res.text()}`);
  return (await res.json()) as StrapiUser;
}

/**
 * Update an existing user's role (e.g. promote to reset-room-member).
 */
export async function updateUserRole(userId: number, roleId: number): Promise<void> {
  const res = await fetch(`${STRAPI_URL}/api/users/${userId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ role: roleId }),
  });
  if (!res.ok) throw new Error(`updateUserRole ${res.status}: ${await res.text()}`);
}

/**
 * Trigger a password-reset email so a newly-created user can set their own password.
 * Uses the public users-permissions endpoint (not the admin token).
 *
 * NOTE: Strapi's built-in forgot-password requires the email plugin to be
 * configured. Anna's CMS has no email plugin, so the reset email won't
 * actually leave Strapi. Use generateResetToken() instead and send your own
 * email via Resend (web/src/lib/email.ts) — that's what grantShopCustomerAccount
 * and the /api/auth/forgot-password route do.
 */
export async function sendPasswordReset(email: string): Promise<void> {
  const res = await fetch(`${STRAPI_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
    cache: 'no-store',
  });
  if (!res.ok) {
    // Don't throw — email send is best-effort. Log and continue.
    console.warn(`[strapi-admin] sendPasswordReset ${res.status}: ${await res.text()}`);
  }
}

/**
 * Generate a password reset token + write it to the user. Returns the raw
 * token; pass it back via `${SITE}/login/reset?code=${token}` in your own
 * email. The customer's /login/reset form will POST it back to Strapi's
 * /api/auth/reset-password.
 *
 * Strapi v5 doesn't hash reset tokens at the DB level (unlike passwords), so
 * we can simply write a random string. We use 48 hex chars (192 bits).
 */
export async function generateResetToken(userId: number): Promise<string> {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const res = await fetch(`${STRAPI_URL}/api/users/${userId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ resetPasswordToken: token }),
  });
  if (!res.ok) {
    throw new Error(`generateResetToken ${res.status}: ${await res.text()}`);
  }
  return token;
}

/**
 * Ensure a shop customer has a user account so they can log in later to see
 * their orders, manage returns, and access any course they buy.
 *
 * Pattern:
 * - If a user exists for this email → no-op (returning customer, already has
 *   account from a previous order / Reset Room / REGULATED). Returns
 *   { created: false } so the caller knows NOT to send the invite email.
 * - If no user → create with default 'authenticated' role + a random
 *   password they'll never use, generate a reset token, return both so the
 *   caller can send a "set your password" Resend email.
 *
 * Same Strapi User collection that powers Reset Room + REGULATED, so the
 * customer has ONE login across the whole site.
 */
export async function grantShopCustomerAccount(args: {
  email: string;
  firstName?: string;
  lastName?: string;
}): Promise<{ created: boolean; userId: number; resetToken?: string }> {
  const existing = await findUserByEmail(args.email);
  if (existing) {
    return { created: false, userId: existing.id };
  }

  const authRole = await findRoleByType('authenticated');
  if (!authRole) throw new Error('Role "authenticated" not found in Strapi');

  const username = args.email.split('@')[0] + '-' + Math.random().toString(36).slice(2, 8);
  const created = await createUser({
    email: args.email,
    username,
    firstName: args.firstName,
    lastName: args.lastName,
    roleId: authRole.id,
  });
  const resetToken = await generateResetToken(created.id);
  return { created: true, userId: created.id, resetToken };
}

/**
 * High-level: ensure user exists with reset-room-member role.
 *  - If user not found: create them with reset-room-member role + send password reset
 *  - If user found and already member: no-op
 *  - If user found with different role: promote to reset-room-member
 *
 * Idempotent — safe to call from Stripe webhook (which can retry).
 */
export async function grantResetRoomMembership(args: {
  email: string;
  firstName?: string;
  lastName?: string;
}): Promise<{ created: boolean; userId: number }> {
  const role = await findRoleByType('reset-room-member');
  if (!role) {
    throw new Error('Role "reset-room-member" not found in Strapi — run permissions seed first');
  }

  const existing = await findUserByEmail(args.email);
  if (existing) {
    if (existing.role?.type !== 'reset-room-member') {
      await updateUserRole(existing.id, role.id);
    }
    return { created: false, userId: existing.id };
  }

  const username = args.email.split('@')[0] + '-' + Math.random().toString(36).slice(2, 8);
  const created = await createUser({
    email: args.email,
    username,
    firstName: args.firstName,
    lastName: args.lastName,
    roleId: role.id,
  });
  await sendPasswordReset(args.email);
  return { created: true, userId: created.id };
}

/**
 * Grant REGULATED course access (one-off purchase, no cron revoke).
 *
 * Sets hasRegulatedAccess=true + regulatedAccessSince=now on the user.
 * Creates the user (with the default 'authenticated' role, NOT
 * reset-room-member) if they don't yet exist, and sends a password-reset
 * email so they can set their own password and log in.
 *
 * If the user is already a Reset Room member, we keep them in that
 * role and just flip the flag — they get both accesses.
 *
 * Idempotent. Safe to call from Stripe webhook retries.
 */
export async function grantRegulatedAccess(args: {
  email: string;
  firstName?: string;
  lastName?: string;
}): Promise<{ created: boolean; userId: number }> {
  const now = new Date().toISOString();
  const existing = await findUserByEmail(args.email);

  if (existing) {
    // Just flip the flag — preserve role + other state.
    // If user already has regulatedAccessSince, keep it; else stamp now.
    const fullUser = await fetchUserById(existing.id);
    const since = fullUser?.regulatedAccessSince || now;
    const res = await fetch(`${STRAPI_URL}/api/users/${existing.id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({
        hasRegulatedAccess: true,
        regulatedAccessSince: since,
      }),
    });
    if (!res.ok) {
      throw new Error(`grantRegulatedAccess update ${res.status}: ${await res.text()}`);
    }
    return { created: false, userId: existing.id };
  }

  // Need a role for the new user — default to 'authenticated'
  const authRole = await findRoleByType('authenticated');
  if (!authRole) throw new Error('Role "authenticated" not found in Strapi');

  // Random password — user resets via email
  const password = Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const username = args.email.split('@')[0] + '-' + Math.random().toString(36).slice(2, 8);
  const res = await fetch(`${STRAPI_URL}/api/users`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      email: args.email.toLowerCase(),
      username,
      password,
      confirmed: true,
      blocked: false,
      role: authRole.id,
      firstName: args.firstName,
      lastName: args.lastName,
      hasRegulatedAccess: true,
      regulatedAccessSince: now,
    }),
  });
  if (!res.ok) {
    throw new Error(`grantRegulatedAccess create ${res.status}: ${await res.text()}`);
  }
  const created = (await res.json()) as StrapiUser;
  await sendPasswordReset(args.email);
  return { created: true, userId: created.id };
}

async function fetchUserById(id: number): Promise<any | null> {
  const res = await fetch(`${STRAPI_URL}/api/users/${id}`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

/**
 * REGULATED course modules — fetched by the access page using the admin
 * token (modules are NOT publicly readable). Returns ordered list.
 */
export type RegulatedModule = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  sort_order: number;
  intro?: string;
  body?: string;
  video_url?: string;
  audio_url?: string;
  audio_file?: { url?: string; name?: string; ext?: string; mime?: string } | null;
  duration_label?: string;
  is_intro?: boolean;
  downloadable_file?: { url?: string; name?: string; ext?: string } | null;
  thumbnail?: { url?: string } | null;
};

export async function fetchRegulatedModules(): Promise<RegulatedModule[]> {
  const url = new URL(`${STRAPI_URL}/api/regulated-modules`);
  url.searchParams.set('sort', 'sort_order:asc');
  url.searchParams.set('pagination[limit]', '50');
  url.searchParams.set('populate', '*');
  url.searchParams.set('publicationState', 'live');

  const res = await fetch(url.toString(), { headers: authHeaders(), cache: 'no-store' });
  if (!res.ok) {
    console.warn('[regulated] fetchRegulatedModules:', res.status, await res.text());
    return [];
  }
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : [];
}

/**
 * Demote a user from reset-room-member back to the default 'authenticated' role.
 * Called on subscription cancellation.
 */
export async function revokeResetRoomMembership(email: string): Promise<void> {
  const authenticatedRole = await findRoleByType('authenticated');
  if (!authenticatedRole) throw new Error('Role "authenticated" not found in Strapi');

  const user = await findUserByEmail(email);
  if (!user) return; // nothing to revoke
  if (user.role?.type !== 'reset-room-member') return; // already not a member

  await updateUserRole(user.id, authenticatedRole.id);
}

// ─── Shop / Order helpers ───

export type ShopProduct = {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  is_active: boolean;
};

/**
 * Fetch products by their numeric IDs. Used by checkout to validate cart
 * contents against current prices and stock before creating an Order.
 */
export async function fetchProductsByIds(ids: number[]): Promise<ShopProduct[]> {
  if (ids.length === 0) return [];
  const url = new URL(`${STRAPI_URL}/api/products`);
  ids.forEach((id, i) => url.searchParams.append(`filters[id][$in][${i}]`, String(id)));
  url.searchParams.set('pagination[limit]', '100');

  const res = await fetch(url.toString(), { headers: authHeaders(), cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchProductsByIds ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : [];
}

export type CreateOrderInput = {
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address: string;
  items: Array<{ id: number; name: string; price: number; qty: number; slug?: string }>;
  subtotal: number;
  shipping_cost?: number;
  total: number;
  currency?: string;
  payment_method: 'stripe' | 'paypal' | 'bank_transfer';
  notes?: string;
  coupon_code?: string;
  discount_amount?: number;
  user?: number; // Strapi user.id — links the order to the customer's account
};

export type StrapiOrder = {
  id: number;
  documentId: string;
  order_number: string;
  status: string;
  payment_method: string;
  customer_email: string;
  items: any;
  total: number;
};

/**
 * Create a pending order. Returns the created order with documentId.
 */
export async function createOrder(input: CreateOrderInput): Promise<StrapiOrder> {
  const body = {
    data: {
      ...input,
      currency: input.currency || 'gbp',
      shipping_cost: input.shipping_cost ?? 0,
      status: 'pending',
    },
  };
  const res = await fetch(`${STRAPI_URL}/api/orders`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`createOrder ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.data as StrapiOrder;
}

/**
 * Fetch an order by documentId. Used by the Stripe webhook handler.
 */
export async function fetchOrder(documentId: string): Promise<StrapiOrder | null> {
  const res = await fetch(`${STRAPI_URL}/api/orders/${encodeURIComponent(documentId)}`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`fetchOrder ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return (json.data || null) as StrapiOrder | null;
}

/**
 * Fetch an order by its order_number. Used by the Stripe webhook to enforce
 * idempotency — Stripe can retry webhook delivery, so we must not create the
 * same order twice for the same order_number.
 */
export async function fetchOrderByNumber(orderNumber: string): Promise<any | null> {
  const url = new URL(`${STRAPI_URL}/api/orders`);
  url.searchParams.set('filters[order_number][$eq]', orderNumber);
  url.searchParams.set('pagination[limit]', '1');
  const res = await fetch(url.toString(), { headers: authHeaders(), cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchOrderByNumber ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const data = Array.isArray(json?.data) ? json.data : [];
  return data.length > 0 ? data[0] : null;
}

/**
 * Fetch an email template by its key. Used by /api/order-event to render
 * lifecycle emails using copy Anna can edit in the CMS.
 */
export type EmailTemplate = {
  key: string;
  name: string;
  enabled: boolean;
  audience: 'customer' | 'admin';
  subject: string;
  preheader?: string;
  intro?: string;
  outro?: string;
  cta_label?: string;
  cta_url?: string;
  include_order_summary: boolean;
  include_bank_details: boolean;
  include_shipping_address: boolean;
};

export async function fetchEmailTemplate(key: string): Promise<EmailTemplate | null> {
  const url = new URL(`${STRAPI_URL}/api/email-templates`);
  url.searchParams.set('filters[key][$eq]', key);
  url.searchParams.set('pagination[limit]', '1');
  const res = await fetch(url.toString(), { headers: authHeaders(), cache: 'no-store' });
  if (!res.ok) {
    console.warn(`[strapi-admin] fetchEmailTemplate ${key} ${res.status}: ${await res.text()}`);
    return null;
  }
  const json = await res.json();
  const data = Array.isArray(json?.data) ? json.data : [];
  return data.length > 0 ? (data[0] as EmailTemplate) : null;
}

/**
 * Fetch all orders for a logged-in user, newest first. Used by /account.
 * Returns the user's own orders only (filtered by user.id), so a stolen JWT
 * still can't see anyone else's order history.
 */
export async function fetchOrdersForUser(userId: number): Promise<any[]> {
  const url = new URL(`${STRAPI_URL}/api/orders`);
  url.searchParams.set('filters[user][id][$eq]', String(userId));
  url.searchParams.set('sort', 'createdAt:desc');
  url.searchParams.set('pagination[limit]', '50');
  const res = await fetch(url.toString(), { headers: authHeaders(), cache: 'no-store' });
  if (!res.ok) {
    console.warn(`[strapi-admin] fetchOrdersForUser ${res.status}: ${await res.text()}`);
    return [];
  }
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : [];
}

/**
 * Fetch all orders matching an email address (used as a fallback for guest
 * orders placed BEFORE the user set up their password, so they show up in
 * /account once they log in). Filtered by customer_email exact match.
 */
export async function fetchOrdersForEmail(email: string): Promise<any[]> {
  const url = new URL(`${STRAPI_URL}/api/orders`);
  url.searchParams.set('filters[customer_email][$eqi]', email);
  url.searchParams.set('sort', 'createdAt:desc');
  url.searchParams.set('pagination[limit]', '50');
  const res = await fetch(url.toString(), { headers: authHeaders(), cache: 'no-store' });
  if (!res.ok) return [];
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : [];
}

/**
 * Fetch the latest return request for a given order_number. Used by the
 * lifecycle email helpers so the email body can include the return reason
 * + notes from the request the customer just submitted.
 */
export async function fetchLatestReturnRequest(orderNumber: string): Promise<any | null> {
  const url = new URL(`${STRAPI_URL}/api/return-requests`);
  url.searchParams.set('filters[order][order_number][$eq]', orderNumber);
  url.searchParams.set('sort', 'createdAt:desc');
  url.searchParams.set('pagination[limit]', '1');
  url.searchParams.set('populate', 'order');
  const res = await fetch(url.toString(), { headers: authHeaders(), cache: 'no-store' });
  if (!res.ok) return null;
  const json = await res.json();
  const data = Array.isArray(json?.data) ? json.data : [];
  return data.length > 0 ? data[0] : null;
}

/**
 * Mark an order paid + store the Stripe payment ID. Called from webhook.
 */
export async function markOrderPaid(documentId: string, stripePaymentId: string): Promise<void> {
  const res = await fetch(`${STRAPI_URL}/api/orders/${encodeURIComponent(documentId)}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ data: { status: 'paid', stripe_payment_id: stripePaymentId } }),
  });
  if (!res.ok) throw new Error(`markOrderPaid ${res.status}: ${await res.text()}`);
}

/**
 * Stamp refund details on an order after a Stripe refund succeeds. Sets
 * stripe_refund_id (prevents double-refunds), refund_amount (if not already
 * filled by Anna), and refunded_at. Does NOT change status — the status
 * transition that triggered the refund already moved it to 'refunded'.
 */
export async function stampOrderRefund(
  documentId: string,
  args: { stripe_refund_id: string; refund_amount: number; refunded_at?: string },
): Promise<void> {
  const data: Record<string, any> = {
    stripe_refund_id: args.stripe_refund_id,
    refund_amount: args.refund_amount,
    refunded_at: args.refunded_at || new Date().toISOString(),
  };
  const res = await fetch(`${STRAPI_URL}/api/orders/${encodeURIComponent(documentId)}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ data }),
  });
  if (!res.ok) throw new Error(`stampOrderRefund ${res.status}: ${await res.text()}`);
}

/**
 * Update an order's status. Used by the refund flow when a return-request
 * is marked refunded — the parent order should also flip to 'refunded'.
 */
export async function updateOrderStatus(documentId: string, status: string): Promise<void> {
  const res = await fetch(`${STRAPI_URL}/api/orders/${encodeURIComponent(documentId)}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ data: { status } }),
  });
  if (!res.ok) throw new Error(`updateOrderStatus ${res.status}: ${await res.text()}`);
}

/**
 * Decrement stock on a product by `qty`. Best-effort — logs warning on failure
 * rather than throwing so a stock-update bug never blocks order completion.
 */
export async function decrementProductStock(productId: number, qty: number): Promise<void> {
  try {
    const url = new URL(`${STRAPI_URL}/api/products`);
    url.searchParams.set('filters[id][$eq]', String(productId));
    const findRes = await fetch(url.toString(), { headers: authHeaders(), cache: 'no-store' });
    if (!findRes.ok) {
      console.warn(`[strapi] decrementProductStock find ${findRes.status}`);
      return;
    }
    const findJson = await findRes.json();
    const product = Array.isArray(findJson?.data) ? findJson.data[0] : null;
    if (!product) return;
    const newStock = Math.max(0, Number(product.stock || 0) - qty);
    const updateRes = await fetch(`${STRAPI_URL}/api/products/${encodeURIComponent(product.documentId)}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ data: { stock: newStock } }),
    });
    if (!updateRes.ok) {
      console.warn(`[strapi] decrementProductStock update ${updateRes.status}: ${await updateRes.text()}`);
    }
  } catch (err: any) {
    console.warn(`[strapi] decrementProductStock failed for product ${productId}:`, err?.message);
  }
}

// ─── Circle Recording helpers ───

export type Recording = {
  id: number;
  documentId?: string;
  title: string;
  session_date: string;
  youtube_url: string;
  price_gbp: number;
  is_available_for_purchase: boolean;
  description?: string | null;
};

/**
 * Fetch the current recording available for purchase. Returns the most
 * recent one where is_available_for_purchase is true. Anna flags one at
 * a time; if she leaves multiple ticked, we pick the most recent by
 * session_date. Returns null if nothing is on sale.
 */
export async function fetchCurrentRecording(): Promise<Recording | null> {
  try {
    const url = new URL(`${STRAPI_URL}/api/recordings`);
    url.searchParams.set('filters[is_available_for_purchase][$eq]', 'true');
    url.searchParams.set('sort', 'session_date:desc');
    url.searchParams.set('pagination[pageSize]', '1');
    const res = await fetch(url.toString(), { headers: authHeaders(), cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    const rec = Array.isArray(json?.data) && json.data.length > 0 ? json.data[0] : null;
    return rec as Recording | null;
  } catch (err: any) {
    console.warn('[strapi] fetchCurrentRecording failed:', err?.message);
    return null;
  }
}

/**
 * Fetch a single recording by numeric id. Used by the webhook to look up
 * the recording that was just paid for.
 */
export async function fetchRecordingById(id: number): Promise<Recording | null> {
  try {
    const url = new URL(`${STRAPI_URL}/api/recordings`);
    url.searchParams.set('filters[id][$eq]', String(id));
    const res = await fetch(url.toString(), { headers: authHeaders(), cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    const rec = Array.isArray(json?.data) && json.data.length > 0 ? json.data[0] : null;
    return rec as Recording | null;
  } catch (err: any) {
    console.warn('[strapi] fetchRecordingById failed:', err?.message);
    return null;
  }
}

/**
 * Attach a Recording to a user's purchased_recordings list. Idempotent —
 * if the user already has this recording, we don't duplicate. The write
 * goes through the users-permissions user endpoint using the admin token.
 */
export async function attachRecordingToUser(
  userId: number,
  recordingId: number,
): Promise<void> {
  try {
    // Read the current purchased_recordings so we can merge rather than replace.
    const readUrl = new URL(`${STRAPI_URL}/api/users/${userId}`);
    readUrl.searchParams.set('populate', 'purchased_recordings');
    const readRes = await fetch(readUrl.toString(), { headers: authHeaders(), cache: 'no-store' });
    if (!readRes.ok) {
      console.warn(`[strapi] attachRecordingToUser read ${readRes.status}`);
      return;
    }
    const user = await readRes.json();
    const existing = Array.isArray(user?.purchased_recordings) ? user.purchased_recordings : [];
    const existingIds: number[] = existing.map((r: any) => r?.id).filter((n: any) => Number.isFinite(n));
    if (existingIds.includes(recordingId)) return; // idempotent
    const mergedIds = [...existingIds, recordingId];
    const writeRes = await fetch(`${STRAPI_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ purchased_recordings: mergedIds }),
    });
    if (!writeRes.ok) {
      console.warn(`[strapi] attachRecordingToUser update ${writeRes.status}: ${await writeRes.text()}`);
    }
  } catch (err: any) {
    console.warn(`[strapi] attachRecordingToUser failed for user ${userId} + recording ${recordingId}:`, err?.message);
  }
}

/**
 * Fetch all recordings a user has purchased. Sorted by session_date desc
 * (most recent first). Used by the members dashboard.
 */
export async function fetchUserPurchasedRecordings(userId: number): Promise<Recording[]> {
  try {
    const url = new URL(`${STRAPI_URL}/api/users/${userId}`);
    url.searchParams.set('populate[purchased_recordings][sort]', 'session_date:desc');
    const res = await fetch(url.toString(), { headers: authHeaders(), cache: 'no-store' });
    if (!res.ok) return [];
    const user = await res.json();
    const arr = Array.isArray(user?.purchased_recordings) ? user.purchased_recordings : [];
    return arr as Recording[];
  } catch (err: any) {
    console.warn(`[strapi] fetchUserPurchasedRecordings failed for user ${userId}:`, err?.message);
    return [];
  }
}
