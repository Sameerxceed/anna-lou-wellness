import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { fetchOrderByNumber } from '@/lib/strapi-admin';

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const ADMIN_TOKEN = process.env.STRAPI_ADMIN_API_TOKEN;

/**
 * Customer creates a return request for one of their own orders.
 *
 * Body:
 *   {
 *     order_number: 'ALW-XXXXXXXX',
 *     items: [{ id, name, qty }],   // subset of the order's items
 *     reason: 'damaged' | 'wrong_item' | 'not_as_described' | 'changed_mind' | 'other',
 *     notes?: string,
 *   }
 *
 * Auth: requires a logged-in user (rr_session cookie). The order must
 * belong to that user (via user relation OR matching customer_email).
 *
 * Eligibility: order status must be paid, shipped, or completed. Cancelled
 * and refunded orders cannot be returned.
 *
 * Strapi side: creates the return-request row. The afterCreate lifecycle
 * hook fires the customer + admin emails automatically.
 */

const VALID_REASONS = ['damaged', 'wrong_item', 'not_as_described', 'changed_mind', 'other'];
const RETURNABLE_STATUSES = ['paid', 'shipped', 'completed'];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  }
  if (!ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Server misconfigured (no admin token)' }, { status: 500 });
  }

  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const orderNumber = String(body?.order_number || '').trim();
  const reason = String(body?.reason || '').trim();
  const notes = body?.notes ? String(body.notes).trim().slice(0, 2000) : '';
  const items = Array.isArray(body?.items) ? body.items : [];

  if (!orderNumber) {
    return NextResponse.json({ error: 'order_number required' }, { status: 400 });
  }
  if (!VALID_REASONS.includes(reason)) {
    return NextResponse.json({ error: 'Invalid reason' }, { status: 400 });
  }
  if (items.length === 0) {
    return NextResponse.json({ error: 'Select at least one item to return' }, { status: 400 });
  }

  let order;
  try {
    order = await fetchOrderByNumber(orderNumber);
  } catch (err: any) {
    return NextResponse.json({ error: `Could not load order: ${err?.message}` }, { status: 502 });
  }
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Ownership check: order's user relation matches, OR fallback to email match
  // (legacy orders placed before user accounts were created).
  const orderUserId = order.user?.id || order.user;
  const ownsByUser = orderUserId === session.user.id;
  const ownsByEmail = String(order.customer_email || '').toLowerCase() === session.user.email.toLowerCase();
  if (!ownsByUser && !ownsByEmail) {
    return NextResponse.json({ error: 'This order does not belong to your account' }, { status: 403 });
  }

  if (!RETURNABLE_STATUSES.includes(order.status)) {
    return NextResponse.json(
      { error: `Orders in '${order.status}' status cannot be returned. Please reply to your order email and we will help.` },
      { status: 400 },
    );
  }

  // Sanitise the items list against the actual order — never trust client
  // to claim items not in their order, or qty greater than they bought.
  const orderItems: any[] = Array.isArray(order.items) ? order.items : [];
  const sanitisedItems = items
    .map((it: any) => {
      const id = Number(it.id);
      const requestedQty = Math.max(1, Math.floor(Number(it.qty || 1)));
      const match = orderItems.find((oi: any) => Number(oi.id) === id);
      if (!match) return null;
      return {
        id,
        name: String(match.name || ''),
        qty: Math.min(requestedQty, Number(match.qty || 1)),
        price: Number(match.price || 0),
      };
    })
    .filter(Boolean);

  if (sanitisedItems.length === 0) {
    return NextResponse.json({ error: 'None of the selected items are on this order' }, { status: 400 });
  }

  // Create the return-request via admin API. Lifecycle hook fires the
  // customer + admin emails after create.
  try {
    const res = await fetch(`${STRAPI_URL}/api/return-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ADMIN_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          order: order.documentId,
          items: sanitisedItems,
          reason,
          notes,
          status: 'requested',
        },
      }),
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error('[returns] create failed:', res.status, txt);
      return NextResponse.json({ error: `Could not submit return: ${res.status}` }, { status: 502 });
    }
    const json = await res.json();
    return NextResponse.json({ ok: true, return_request: json.data });
  } catch (err: any) {
    console.error('[returns] network error:', err?.message);
    return NextResponse.json({ error: 'Network error. Please try again.' }, { status: 502 });
  }
}
