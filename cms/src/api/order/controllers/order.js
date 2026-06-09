'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::order.order', ({ strapi }) => ({

  // Order creation is owned by the Next.js /api/checkout route. It validates
  // cart items + stock against Strapi, applies coupons via /api/coupon/validate,
  // computes shipping/gift-wrap, and POSTs the final order here. Strapi just
  // persists it — no re-computation, currency conversion, or tax engine. Anna's
  // shop is GBP-only, retail-priced.

  /**
   * Update order status
   */
  async updateStatus(ctx) {
    const { id } = ctx.params;
    const { status } = ctx.request.body;
    const valid = ['pending', 'paid', 'shipped', 'completed', 'cancelled', 'refunded'];
    if (!valid.includes(status)) return ctx.badRequest('Invalid status');

    const order = await strapi.documents('api::order.order').update({
      documentId: id,
      data: { status },
    });
    return { data: order };
  },

  /**
   * Dashboard stats
   */
  async dashboard(ctx) {
    const orders = await strapi.documents('api::order.order').findMany({
      filters: { status: { $in: ['paid', 'shipped', 'completed'] } },
    });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today - 7 * 86400000);
    const monthAgo = new Date(today - 30 * 86400000);

    const sum = (arr) => arr.reduce((s, o) => s + (parseFloat(o.total) || 0), 0);
    const todayO = orders.filter(o => new Date(o.createdAt) >= today);
    const weekO = orders.filter(o => new Date(o.createdAt) >= weekAgo);
    const monthO = orders.filter(o => new Date(o.createdAt) >= monthAgo);

    const pendingOrders = await strapi.documents('api::order.order').findMany({
      filters: { status: 'pending' },
    });

    return {
      today: { revenue: sum(todayO), orders: todayO.length },
      week: { revenue: sum(weekO), orders: weekO.length },
      month: { revenue: sum(monthO), orders: monthO.length },
      allTime: { revenue: sum(orders), orders: orders.length },
      pending: pendingOrders.length,
    };
  },

  /**
   * Export orders as CSV
   */
  async exportCsv(ctx) {
    const { status, from, to } = ctx.query;
    const filters = {};
    if (status) filters.status = status;
    if (from || to) {
      filters.createdAt = {};
      if (from) filters.createdAt.$gte = from;
      if (to) filters.createdAt.$lte = to;
    }

    const orders = await strapi.documents('api::order.order').findMany({
      filters,
      sort: { createdAt: 'desc' },
    });

    const header = 'Order Number,Date,Customer,Email,Items,Subtotal,Discount,Tax,Shipping,Total,Currency,Status,Payment\n';
    const rows = orders.map(o => {
      const items = (o.items || []).map(i => `${i.name} x${i.qty}`).join('; ');
      return `${o.order_number},${new Date(o.createdAt).toISOString().split('T')[0]},"${o.customer_name}",${o.customer_email},"${items}",${o.subtotal},${o.discount_amount},${o.tax_amount},${o.shipping_cost},${o.total},${o.currency},${o.status},${o.payment_method}`;
    }).join('\n');

    ctx.set('Content-Type', 'text/csv');
    ctx.set('Content-Disposition', `attachment; filename=orders-${new Date().toISOString().split('T')[0]}.csv`);
    ctx.body = header + rows;
  },

  /**
   * Customer initiates a return request
   */
  async requestReturn(ctx) {
    const { orderId, items, reason, notes } = ctx.request.body;

    const order = await strapi.documents('api::order.order').findOne({
      documentId: orderId,
    });

    if (!order) return ctx.badRequest('Order not found');
    if (!['paid', 'shipped', 'completed'].includes(order.status)) {
      return ctx.badRequest('Returns only available for paid/shipped/completed orders');
    }

    const returnRequest = await strapi.documents('api::return-request.return-request').create({
      data: {
        order: orderId,
        customer: order.customer?.documentId || null,
        items: items || [],
        status: 'requested',
        reason: reason || 'other',
        notes: notes || '',
      },
    });

    return { data: returnRequest };
  },
}));
