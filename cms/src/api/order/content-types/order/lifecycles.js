'use strict';

/**
 * Order lifecycle — fires transactional emails on status transitions.
 *
 * Strategy:
 *  - beforeUpdate: fetch the current row, stash the OLD status on event.state
 *    (Strapi v5 doesn't include the prior state in the event by default).
 *  - afterUpdate: compare old vs new status. If changed, dispatch a webhook
 *    to the Next.js side (/api/order-event) which loads the email template
 *    from Strapi, merges placeholders, and sends via Resend.
 *
 * The webhook is fire-and-forget — we never let an email failure block the
 * Strapi update transaction. Auth via ORDER_EVENT_SECRET shared between
 * Strapi and Next.js (set in Coolify env on both apps).
 */

async function dispatchOrderEvent(strapi, payload) {
  const url = process.env.PUBLIC_SITE_URL || process.env.WEB_PUBLIC_URL;
  const secret = process.env.ORDER_EVENT_SECRET;
  if (!url || !secret) {
    strapi.log.info('[order lifecycle] PUBLIC_SITE_URL or ORDER_EVENT_SECRET not set — email skipped');
    return;
  }
  try {
    const res = await fetch(`${url}/api/order-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-order-event-secret': secret,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      strapi.log.warn(`[order lifecycle] webhook ${res.status}: ${body.slice(0, 200)}`);
    }
  } catch (err) {
    strapi.log.warn(`[order lifecycle] webhook failed: ${err.message}`);
  }
}

const TRANSITION_EMAILS = {
  shipped: 'order_shipped',
  completed: 'order_completed',
  cancelled: 'order_cancelled',
  refunded: 'order_refunded',
};

module.exports = {
  async beforeUpdate(event) {
    const { params } = event;
    try {
      const where = params.where || {};
      if (!where.id && !where.documentId) return;
      const existing = await strapi.db.query('api::order.order').findOne({ where });
      if (existing) {
        event.state = event.state || {};
        event.state.previousStatus = existing.status;
      }
    } catch (err) {
      strapi.log.debug(`[order lifecycle] beforeUpdate snapshot failed: ${err.message}`);
    }
  },

  async afterUpdate(event) {
    const { result, state } = event;
    const previousStatus = state?.previousStatus;
    const newStatus = result?.status;
    if (!previousStatus || !newStatus || previousStatus === newStatus) return;

    const templateKey = TRANSITION_EMAILS[newStatus];
    if (!templateKey) return; // pending / paid changes aren't triggered here

    // Don't wait — never block the admin save on an email round-trip.
    dispatchOrderEvent(strapi, {
      template_key: templateKey,
      order_number: result.order_number,
      previous_status: previousStatus,
      new_status: newStatus,
    }).catch(() => {});
  },
};
