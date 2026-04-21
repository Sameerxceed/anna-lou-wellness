'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::order.order', ({ strapi }) => ({

  /**
   * Enhanced order creation with full commerce pipeline:
   * 1. Validate cart items + stock
   * 2. Validate & apply coupon discount
   * 3. Calculate tax based on shipping country
   * 4. Calculate shipping based on zone + method + weight
   * 5. Apply multi-currency conversion if needed
   * 6. Generate order with all pricing fields
   * 7. Reduce stock
   * 8. Mark cart as converted
   * 9. Increment coupon usage
   * 10. Send order confirmation email
   */
  async create(ctx) {
    const { data } = ctx.request.body;

    // Auto-generate order number
    const prefix = process.env.ORDER_PREFIX || 'ORD';
    data.order_number = `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const items = data.items || [];
    if (items.length === 0) return ctx.badRequest('Order must have at least one item');

    // ─── 1. Validate stock & collect product data ───
    const enrichedItems = [];
    let totalWeight = 0;

    for (const item of items) {
      const product = await strapi.documents('api::product.product').findOne({
        documentId: item.product_id,
        populate: ['variants'],
      });
      if (!product) return ctx.badRequest(`Product ${item.product_id} not found`);

      let stock = product.stock || 0;
      let price = parseFloat(product.price);
      let itemName = product.name;
      let variantLabel = null;

      // Variant handling
      if (item.variant_id) {
        const variant = (product.variants || []).find(
          v => (v.documentId || v.id) === item.variant_id
        );
        if (!variant) return ctx.badRequest(`Variant ${item.variant_id} not found`);
        stock = variant.stock || 0;
        if (variant.price_override != null) price = parseFloat(variant.price_override);
        variantLabel = variant.variant_label;
        totalWeight += (variant.weight_grams || product.weight_grams || 0) * item.qty;
      } else {
        totalWeight += (product.weight_grams || 0) * item.qty;
      }

      if (stock < item.qty) {
        return ctx.badRequest(`Insufficient stock for ${product.name}${variantLabel ? ` (${variantLabel})` : ''}`);
      }

      enrichedItems.push({
        product_id: item.product_id,
        variant_id: item.variant_id || null,
        name: itemName,
        variant_label: variantLabel,
        qty: item.qty,
        price,
        category_id: product.category?.documentId || null,
        tax_class: product.tax_class || 'standard',
      });
    }

    // ─── 2. Calculate subtotal ───
    const subtotal = enrichedItems.reduce((s, i) => s + i.price * i.qty, 0);

    // ─── 3. Validate coupon ───
    let discount = 0;
    let freeShipping = false;
    let couponDocumentId = null;

    if (data.coupon_code) {
      const couponResult = await strapi.service('api::coupon.coupon-validation')
        .validateCoupon(data.coupon_code, enrichedItems, subtotal);

      if (!couponResult.valid) return ctx.badRequest(couponResult.message);

      discount = couponResult.discount;
      freeShipping = couponResult.freeShipping || false;
      couponDocumentId = couponResult.coupon?.documentId;
    }

    // ─── 4. Calculate tax ───
    const countryCode = data.shipping_country || 'IE';
    const taxResult = await strapi.service('api::tax-rule.tax-calculator')
      .calculateTax(enrichedItems, countryCode);

    // ─── 5. Calculate shipping ───
    let shippingCost = 0;
    let shippingMethodName = data.shipping_method || '';

    if (data.shipping_method_id) {
      const shippingResult = await strapi.service('api::shipping-zone.shipping-calculator')
        .getShippingCost(data.shipping_method_id, totalWeight, subtotal, freeShipping);
      if (shippingResult) {
        shippingCost = shippingResult.rate;
        shippingMethodName = shippingResult.name;
      }
    } else if (data.shipping_cost != null) {
      shippingCost = parseFloat(data.shipping_cost) || 0;
    }

    // ─── 6. Multi-currency conversion ───
    const defaultCurrency = 'EUR';
    const orderCurrency = data.currency || defaultCurrency;
    let exchangeRate = 1.0;

    if (orderCurrency !== defaultCurrency) {
      const siteSettings = await strapi.documents('api::site-settings.site-settings').findMany({ limit: 1 });
      const settings = siteSettings[0];

      if (settings?.auto_currency_conversion) {
        const rate = await strapi.service('global::currency')
          .getRate(defaultCurrency, orderCurrency);
        if (rate) exchangeRate = rate;
      }
    }

    // ─── 7. Calculate total ───
    const taxOnTop = taxResult.isInclusive ? 0 : taxResult.totalTax;
    const total = Math.round((subtotal - discount + shippingCost + taxOnTop) * 100) / 100;

    // ─── 8. Build order data ───
    data.items = enrichedItems;
    data.subtotal = Math.round(subtotal * 100) / 100;
    data.discount_amount = Math.round(discount * 100) / 100;
    data.tax_amount = Math.round(taxResult.totalTax * 100) / 100;
    data.tax_breakdown = taxResult.breakdown;
    data.shipping_cost = Math.round(shippingCost * 100) / 100;
    data.shipping_method = shippingMethodName;
    data.total = Math.max(0, total);
    data.currency = orderCurrency;
    data.exchange_rate = exchangeRate;
    data.status = data.status || 'pending';

    // ─── 9. Create order ───
    const result = await super.create(ctx);

    // ─── 10. Post-order processing (async, non-blocking) ───
    setImmediate(async () => {
      try {
        // Reduce stock
        for (const item of enrichedItems) {
          if (item.variant_id) {
            const variant = await strapi.documents('api::product-variant.product-variant').findOne({
              documentId: item.variant_id,
            });
            if (variant) {
              await strapi.documents('api::product-variant.product-variant').update({
                documentId: item.variant_id,
                data: { stock: Math.max(0, (variant.stock || 0) - item.qty) },
              });
            }
          } else {
            const product = await strapi.documents('api::product.product').findOne({
              documentId: item.product_id,
            });
            if (product) {
              await strapi.documents('api::product.product').update({
                documentId: item.product_id,
                data: { stock: Math.max(0, (product.stock || 0) - item.qty) },
              });
            }
          }
        }

        // Increment coupon usage
        if (couponDocumentId) {
          await strapi.service('api::coupon.coupon-validation')
            .incrementUsage(couponDocumentId);
        }

        // Mark cart as converted
        if (data.cart_id) {
          await strapi.service('api::cart.cart-manager').markConverted(data.cart_id);
        }

        // Send notification email
        const notifyEmail = process.env.NOTIFICATION_EMAIL;
        if (notifyEmail) {
          await strapi.plugins['email']?.services.email.send({
            to: notifyEmail,
            subject: `New Order: ${data.order_number}`,
            text: `New order from ${data.customer_name} (${data.customer_email})\nTotal: ${data.currency} ${data.total}\nPayment: ${data.payment_method}\nItems: ${enrichedItems.map(i => `${i.name} x${i.qty}`).join(', ')}`,
          });
        }

        // Customer confirmation email
        if (data.customer_email) {
          await strapi.plugins['email']?.services.email.send({
            to: data.customer_email,
            subject: `Order Confirmed: ${data.order_number}`,
            text: `Thank you for your order!\n\nOrder: ${data.order_number}\nTotal: ${data.currency} ${data.total}\n\nWe'll notify you when your order ships.`,
          });
        }
      } catch (err) {
        strapi.log.warn('Post-order processing error:', err.message);
      }
    });

    return result;
  },

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
