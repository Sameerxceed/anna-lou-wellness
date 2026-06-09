import { NextRequest, NextResponse } from 'next/server';
import { fetchOrderByNumber, fetchLatestReturnRequest } from '@/lib/strapi-admin';
import { sendFromTemplate } from '@/lib/email';

/**
 * Internal webhook called by Strapi lifecycle hooks when an order or return-
 * request transitions to a state that should trigger a customer/admin email.
 *
 * Auth: shared secret in `x-order-event-secret` header. Set ORDER_EVENT_SECRET
 * to the same value in BOTH Coolify env (web + cms apps).
 *
 * Body:
 *   {
 *     template_key: 'order_shipped' | 'order_completed' | ... ,
 *     order_number: 'ALW-XXXXXXXX',
 *     return_request_id?: string,
 *     previous_status?: string,
 *     new_status?: string,
 *   }
 *
 * The actual email subject/body is loaded from the Email Template collection
 * in Strapi (Anna can edit). Placeholders like {{order_number}} are merged
 * with the live order data fetched here.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ORDER_EVENT_SECRET = process.env.ORDER_EVENT_SECRET;

export async function POST(req: NextRequest) {
  if (!ORDER_EVENT_SECRET) {
    return NextResponse.json({ error: 'ORDER_EVENT_SECRET not configured' }, { status: 500 });
  }
  const headerSecret = req.headers.get('x-order-event-secret') || '';
  if (headerSecret !== ORDER_EVENT_SECRET) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  let body: any;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }); }

  const templateKey = String(body?.template_key || '').trim();
  const orderNumber = String(body?.order_number || '').trim();
  if (!templateKey || !orderNumber) {
    return NextResponse.json({ error: 'template_key and order_number required' }, { status: 400 });
  }

  let order;
  try {
    order = await fetchOrderByNumber(orderNumber);
  } catch (err: any) {
    console.error('[order-event] fetchOrderByNumber failed:', err?.message);
    return NextResponse.json({ error: 'failed to fetch order' }, { status: 502 });
  }
  if (!order) {
    return NextResponse.json({ error: `order ${orderNumber} not found` }, { status: 404 });
  }

  // Pull the latest return request only when the template needs it.
  let returnRequest = null;
  if (templateKey.startsWith('return_') || templateKey === 'admin_return_requested') {
    try {
      returnRequest = await fetchLatestReturnRequest(orderNumber);
    } catch (err: any) {
      console.warn('[order-event] fetchLatestReturnRequest failed:', err?.message);
    }
  }

  const result = await sendFromTemplate(templateKey, { order, returnRequest });
  return NextResponse.json({ ok: result.ok, error: result.error });
}
