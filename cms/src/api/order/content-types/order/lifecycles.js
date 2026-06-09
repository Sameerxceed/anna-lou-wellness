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

async function dispatchToWeb(strapi, path, payload) {
  const url = process.env.PUBLIC_SITE_URL || process.env.WEB_PUBLIC_URL;
  const secret = process.env.ORDER_EVENT_SECRET;
  if (!url || !secret) {
    strapi.log.info(`[order lifecycle] PUBLIC_SITE_URL or ORDER_EVENT_SECRET not set — ${path} skipped`);
    return;
  }
  try {
    const res = await fetch(`${url}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-order-event-secret': secret,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      strapi.log.warn(`[order lifecycle] ${path} ${res.status}: ${body.slice(0, 200)}`);
    }
  } catch (err) {
    strapi.log.warn(`[order lifecycle] ${path} failed: ${err.message}`);
  }
}

// Status transitions that send an email but DO NOT trigger a Stripe refund.
// Refunds are handled separately via /api/order-refund (Stripe + email together).
const EMAIL_ONLY_TRANSITIONS = {
  shipped: 'order_shipped',
  completed: 'order_completed',
  cancelled: 'order_cancelled',
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

    // Refund branch — fire Stripe refund (if applicable) AND customer email.
    if (newStatus === 'refunded') {
      dispatchToWeb(strapi, '/api/order-refund', {
        order_number: result.order_number,
        reason: 'requested_by_customer',
        trigger: 'status_change',
      }).catch(() => {});
      return;
    }

    // Email-only branch — shipped / completed / cancelled.
    const templateKey = EMAIL_ONLY_TRANSITIONS[newStatus];
    if (!templateKey) return;

    dispatchToWeb(strapi, '/api/order-event', {
      template_key: templateKey,
      order_number: result.order_number,
      previous_status: previousStatus,
      new_status: newStatus,
    }).catch(() => {});
  },
};
