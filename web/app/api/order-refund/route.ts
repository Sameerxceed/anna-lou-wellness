import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import {
  fetchOrderByNumber,
  stampOrderRefund,
} from '@/lib/strapi-admin';
import { sendFromTemplate } from '@/lib/email';

/**
 * Internal endpoint called by Strapi lifecycle hooks when an order should be
 * refunded. Fires the Stripe refund (if the order was paid by card) then
 * sends the customer email via the order_refunded template.
 *
 * Idempotent: if stripe_refund_id is already stamped, Stripe call is skipped
 * (we still send the email, in case it failed the first time).
 *
 * Body:
 *   {
 *     order_number: 'ALW-XXXXXXXX',
 *     reason?: 'requested_by_customer' | 'duplicate' | 'fraudulent',
 *     amount?: number,   // explicit refund amount in £. Optional — falls
 *                        // back to order.refund_amount then order.total.
 *     trigger?: 'status_change' | 'return_request',
 *   }
 *
 * Auth: ORDER_EVENT_SECRET header (same secret as /api/order-event).
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ORDER_EVENT_SECRET = process.env.ORDER_EVENT_SECRET;

export async function POST(req: NextRequest) {
  if (!ORDER_EVENT_SECRET) {
    return NextResponse.json({ error: 'ORDER_EVENT_SECRET not configured' }, { status: 500 });
  }
  if ((req.headers.get('x-order-event-secret') || '') !== ORDER_EVENT_SECRET) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const orderNumber = String(body?.order_number || '').trim();
  if (!orderNumber) {
    return NextResponse.json({ error: 'order_number required' }, { status: 400 });
  }

  const reason = ['duplicate', 'fraudulent', 'requested_by_customer'].includes(body?.reason)
    ? body.reason
    : 'requested_by_customer';

  let order: any;
  try {
    order = await fetchOrderByNumber(orderNumber);
  } catch (err: any) {
    console.error('[order-refund] fetchOrderByNumber failed:', err?.message);
    return NextResponse.json({ error: 'failed to fetch order' }, { status: 502 });
  }
  if (!order) {
    return NextResponse.json({ error: `order ${orderNumber} not found` }, { status: 404 });
  }

  // Resolve refund amount in pence. Priority: explicit body.amount, then
  // order.refund_amount (Anna may have filled it before changing status), then
  // order.total (full refund).
  const explicitAmount = Number(body?.amount);
  const fallbackAmount = Number(order.refund_amount) || Number(order.total) || 0;
  const refundAmount = Number.isFinite(explicitAmount) && explicitAmount > 0 ? explicitAmount : fallbackAmount;
  const refundPence = Math.round(refundAmount * 100);

  if (refundPence <= 0) {
    return NextResponse.json({ error: 'refund amount must be positive' }, { status: 400 });
  }

  let stripeRefundId: string | null = order.stripe_refund_id || null;
  let stripeStatus: string | null = null;
  let stripeSkipped: 'already_refunded' | 'bank_transfer' | 'no_payment_intent' | null = null;

  // Stripe refund branch — skip cleanly for non-card orders or when already refunded.
  if (stripeRefundId) {
    stripeSkipped = 'already_refunded';
    console.info(`[order-refund] ${orderNumber} already refunded (${stripeRefundId}) — skipping Stripe call`);
  } else if (order.payment_method !== 'stripe') {
    stripeSkipped = 'bank_transfer';
    console.info(`[order-refund] ${orderNumber} is a ${order.payment_method} order — manual refund required, no Stripe call`);
  } else if (!order.stripe_payment_id) {
    stripeSkipped = 'no_payment_intent';
    console.warn(`[order-refund] ${orderNumber} has no stripe_payment_id — cannot refund automatically`);
  } else {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: order.stripe_payment_id,
        amount: refundPence,
        reason,
        metadata: {
          order_number: orderNumber,
          triggered_by: body?.trigger || 'status_change',
        },
      });
      stripeRefundId = refund.id;
      stripeStatus = refund.status;
      console.info(`[order-refund] ${orderNumber} Stripe refund created: ${refund.id} (${refund.status})`);

      try {
        await stampOrderRefund(order.documentId, {
          stripe_refund_id: refund.id,
          refund_amount: refundAmount,
        });
      } catch (err: any) {
        console.error(`[order-refund] ${orderNumber} stampOrderRefund failed after Stripe success:`, err?.message);
      }
    } catch (err: any) {
      const msg = err?.message || 'unknown error';
      console.error(`[order-refund] ${orderNumber} Stripe refund FAILED:`, msg);

      // Notify admin — Anna needs to follow up manually.
      sendFromTemplate('admin_new_order', {
        order: {
          ...order,
          order_number: orderNumber,
          customer_name: `[REFUND FAILED] ${order.customer_name}`,
          shipping_address: `Stripe refund call failed: ${msg.slice(0, 240)}. Original address:\n${order.shipping_address || ''}`,
        },
      }).catch(() => {});

      return NextResponse.json({
        ok: false,
        error: `Stripe refund failed: ${msg}`,
        order_number: orderNumber,
      }, { status: 502 });
    }
  }

  // Email policy:
  // - If this call actually created the Stripe refund (or this is the first
  //   refund attempt for a non-Stripe order) → send the customer email.
  // - If stripe_refund_id was already stamped BEFORE this call (i.e. the
  //   refund happened earlier and we're now being re-triggered by a
  //   downstream status flip), skip the email so the customer doesn't get
  //   a duplicate.
  const isFreshRefund = stripeSkipped !== 'already_refunded';
  let emailResult: { ok: boolean; error?: string } = { ok: false, error: 'skipped_duplicate' };
  if (isFreshRefund) {
    const orderForEmail = {
      ...order,
      refund_amount: refundAmount,
    };
    emailResult = await sendFromTemplate('order_refunded', { order: orderForEmail });
  } else {
    console.info(`[order-refund] ${orderNumber} email skipped — refund was already sent`);
  }

  return NextResponse.json({
    ok: true,
    order_number: orderNumber,
    refund_amount: refundAmount,
    stripe_refund_id: stripeRefundId,
    stripe_status: stripeStatus,
    stripe_skipped: stripeSkipped,
    email_sent: emailResult.ok,
    email_error: emailResult.error,
  });
}
