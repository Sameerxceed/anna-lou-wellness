'use strict';

async function dispatchOrderEvent(strapi, payload) {
  const url = process.env.PUBLIC_SITE_URL || process.env.WEB_PUBLIC_URL;
  const secret = process.env.ORDER_EVENT_SECRET;
  if (!url || !secret) {
    strapi.log.info('[return-request lifecycle] PUBLIC_SITE_URL or ORDER_EVENT_SECRET not set — email skipped');
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
      strapi.log.warn(`[return-request lifecycle] webhook ${res.status}: ${body.slice(0, 200)}`);
    }
  } catch (err) {
    strapi.log.warn(`[return-request lifecycle] webhook failed: ${err.message}`);
  }
}

async function resolveOrderNumber(strapi, returnRequest) {
  if (!returnRequest) return null;
  // Relation may be populated already; otherwise refetch.
  if (returnRequest.order?.order_number) return returnRequest.order.order_number;
  try {
    const docId = returnRequest.documentId || returnRequest.id;
    if (!docId) return null;
    const full = await strapi.documents('api::return-request.return-request').findOne({
      documentId: returnRequest.documentId,
      populate: ['order'],
    });
    return full?.order?.order_number || null;
  } catch {
    return null;
  }
}

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    const orderNumber = await resolveOrderNumber(strapi, result);
    if (!orderNumber) return;

    // Customer + admin both notified that a return was requested.
    dispatchOrderEvent(strapi, {
      template_key: 'return_requested_customer',
      order_number: orderNumber,
      return_request_id: result.documentId || String(result.id),
    }).catch(() => {});

    dispatchOrderEvent(strapi, {
      template_key: 'admin_return_requested',
      order_number: orderNumber,
      return_request_id: result.documentId || String(result.id),
    }).catch(() => {});
  },

  async beforeUpdate(event) {
    const { params } = event;
    try {
      const where = params.where || {};
      if (!where.id && !where.documentId) return;
      const existing = await strapi.db.query('api::return-request.return-request').findOne({ where });
      if (existing) {
        event.state = event.state || {};
        event.state.previousStatus = existing.status;
      }
    } catch (err) {
      strapi.log.debug(`[return-request lifecycle] beforeUpdate snapshot failed: ${err.message}`);
    }
  },

  async afterUpdate(event) {
    const { result, state } = event;
    const previousStatus = state?.previousStatus;
    const newStatus = result?.status;
    if (!previousStatus || !newStatus || previousStatus === newStatus) return;
    if (newStatus !== 'approved') return; // only the approval transition fires an email

    const orderNumber = await resolveOrderNumber(strapi, result);
    if (!orderNumber) return;

    dispatchOrderEvent(strapi, {
      template_key: 'return_approved',
      order_number: orderNumber,
      return_request_id: result.documentId || String(result.id),
    }).catch(() => {});
  },
};
