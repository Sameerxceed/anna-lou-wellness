'use strict';

/**
 * Cart Manager Service
 *
 * Server-side cart management for:
 * - Guest carts (session_id based)
 * - Authenticated carts (customer relation)
 * - Stock validation
 * - Coupon application
 * - Total calculation with tax + shipping
 */

module.exports = ({ strapi }) => ({

  /**
   * Get or create a cart for a session/customer
   */
  async getOrCreateCart(sessionId, customerId = null) {
    let carts;

    if (customerId) {
      carts = await strapi.documents('api::cart.cart').findMany({
        filters: { customer: customerId, is_converted: false },
        populate: ['customer'],
        limit: 1,
      });
    }

    if ((!carts || carts.length === 0) && sessionId) {
      carts = await strapi.documents('api::cart.cart').findMany({
        filters: { session_id: sessionId, is_converted: false },
        limit: 1,
      });
    }

    if (carts && carts.length > 0) {
      // Update last_active
      await strapi.documents('api::cart.cart').update({
        documentId: carts[0].documentId,
        data: { last_active: new Date().toISOString() },
      });
      return carts[0];
    }

    // Create new cart
    const data = {
      session_id: sessionId,
      items: [],
      last_active: new Date().toISOString(),
      is_converted: false,
      recovery_email_sent: false,
    };
    if (customerId) data.customer = customerId;

    return await strapi.documents('api::cart.cart').create({ data });
  },

  /**
   * Add item to cart (with stock validation)
   */
  async addItem(cartDocumentId, productId, variantId = null, qty = 1) {
    const cart = await strapi.documents('api::cart.cart').findOne({
      documentId: cartDocumentId,
    });
    if (!cart) throw new Error('Cart not found');

    // Validate product exists and has stock
    const product = await strapi.documents('api::product.product').findOne({
      documentId: productId,
      populate: ['variants'],
    });
    if (!product) throw new Error('Product not found');

    let availableStock = product.stock || 0;
    let price = parseFloat(product.price);
    let itemName = product.name;

    // If variant specified, use variant stock/price
    if (variantId) {
      const variant = (product.variants || []).find(
        v => (v.documentId || v.id) === variantId
      );
      if (!variant) throw new Error('Variant not found');
      availableStock = variant.stock || 0;
      if (variant.price_override != null) price = parseFloat(variant.price_override);
      itemName = `${product.name} — ${variant.variant_label}`;
    }

    const items = cart.items || [];
    const existingIndex = items.findIndex(
      i => i.product_id === productId && i.variant_id === variantId
    );

    const currentQty = existingIndex >= 0 ? items[existingIndex].qty : 0;
    const newQty = currentQty + qty;

    if (newQty > availableStock) {
      throw new Error(`Only ${availableStock} available (${currentQty} already in cart)`);
    }

    if (existingIndex >= 0) {
      items[existingIndex].qty = newQty;
      items[existingIndex].price = price;
    } else {
      items.push({
        product_id: productId,
        variant_id: variantId,
        name: itemName,
        qty,
        price,
        category_id: product.category?.documentId || null,
        tax_class: product.tax_class || 'standard',
      });
    }

    return await strapi.documents('api::cart.cart').update({
      documentId: cartDocumentId,
      data: { items, last_active: new Date().toISOString() },
    });
  },

  /**
   * Remove item from cart
   */
  async removeItem(cartDocumentId, productId, variantId = null) {
    const cart = await strapi.documents('api::cart.cart').findOne({
      documentId: cartDocumentId,
    });
    if (!cart) throw new Error('Cart not found');

    const items = (cart.items || []).filter(
      i => !(i.product_id === productId && i.variant_id === variantId)
    );

    return await strapi.documents('api::cart.cart').update({
      documentId: cartDocumentId,
      data: { items, last_active: new Date().toISOString() },
    });
  },

  /**
   * Update item quantity
   */
  async updateItemQty(cartDocumentId, productId, variantId, qty) {
    if (qty <= 0) return this.removeItem(cartDocumentId, productId, variantId);

    const cart = await strapi.documents('api::cart.cart').findOne({
      documentId: cartDocumentId,
    });
    if (!cart) throw new Error('Cart not found');

    const items = cart.items || [];
    const item = items.find(
      i => i.product_id === productId && i.variant_id === variantId
    );
    if (!item) throw new Error('Item not in cart');

    item.qty = qty;

    return await strapi.documents('api::cart.cart').update({
      documentId: cartDocumentId,
      data: { items, last_active: new Date().toISOString() },
    });
  },

  /**
   * Apply coupon to cart
   */
  async applyCoupon(cartDocumentId, code) {
    const cart = await strapi.documents('api::cart.cart').findOne({
      documentId: cartDocumentId,
    });
    if (!cart) throw new Error('Cart not found');

    const items = cart.items || [];
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    const couponService = strapi.service('api::coupon.coupon-validation');
    const result = await couponService.validateCoupon(code, items, subtotal);

    if (result.valid) {
      await strapi.documents('api::cart.cart').update({
        documentId: cartDocumentId,
        data: { coupon_code: code.toUpperCase() },
      });
    }

    return result;
  },

  /**
   * Calculate full cart totals (subtotal + tax + shipping - discount)
   */
  async calculateTotals(cartDocumentId, countryCode, shippingMethodId = null) {
    const cart = await strapi.documents('api::cart.cart').findOne({
      documentId: cartDocumentId,
    });
    if (!cart) throw new Error('Cart not found');

    const items = cart.items || [];
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    // Coupon discount
    let discount = 0;
    let freeShipping = false;
    if (cart.coupon_code) {
      const couponResult = await strapi.service('api::coupon.coupon-validation')
        .validateCoupon(cart.coupon_code, items, subtotal);
      if (couponResult.valid) {
        discount = couponResult.discount;
        freeShipping = couponResult.freeShipping || false;
      }
    }

    // Tax
    const taxResult = await strapi.service('api::tax-rule.tax-calculator')
      .calculateTax(items, countryCode);

    // Shipping
    let shippingCost = 0;
    let shippingName = '';
    if (shippingMethodId) {
      const cartWeight = items.reduce((w, i) => w + ((i.weight_grams || 0) * i.qty), 0);
      const shippingResult = await strapi.service('api::shipping-zone.shipping-calculator')
        .getShippingCost(shippingMethodId, cartWeight, subtotal, freeShipping);
      if (shippingResult) {
        shippingCost = shippingResult.rate;
        shippingName = shippingResult.name;
      }
    }

    const total = Math.round((subtotal - discount + shippingCost +
      (taxResult.isInclusive ? 0 : taxResult.totalTax)) * 100) / 100;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      coupon_code: cart.coupon_code || null,
      tax: taxResult.totalTax,
      tax_breakdown: taxResult.breakdown,
      tax_inclusive: taxResult.isInclusive,
      shipping_cost: Math.round(shippingCost * 100) / 100,
      shipping_method: shippingName,
      total: Math.max(0, total),
      item_count: items.reduce((c, i) => c + i.qty, 0),
    };
  },

  /**
   * Mark cart as converted (after successful order)
   */
  async markConverted(cartDocumentId) {
    await strapi.documents('api::cart.cart').update({
      documentId: cartDocumentId,
      data: { is_converted: true },
    });
  },
});
