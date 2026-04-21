'use strict';

/**
 * Coupon Validation Service
 *
 * Validates coupon codes against business rules:
 * - Active status + date range
 * - Max usage limits
 * - Minimum order amount
 * - Applicable products/categories
 */

module.exports = ({ strapi }) => ({

  /**
   * Validate a coupon code against cart context
   * @param {string} code - Coupon code
   * @param {Array} cartItems - Array of { product_id, qty, price, category_id }
   * @param {number} cartTotal - Cart subtotal before discount
   * @returns {{ valid: boolean, coupon?: object, discount: number, message: string }}
   */
  async validateCoupon(code, cartItems = [], cartTotal = 0) {
    if (!code) return { valid: false, discount: 0, message: 'No coupon code provided' };

    const coupons = await strapi.documents('api::coupon.coupon').findMany({
      filters: { code: code.toUpperCase() },
      populate: ['applicable_products', 'applicable_categories'],
      limit: 1,
    });

    const coupon = coupons[0];
    if (!coupon) return { valid: false, discount: 0, message: 'Coupon not found' };

    // Check active
    if (!coupon.is_active) {
      return { valid: false, discount: 0, message: 'This coupon is no longer active' };
    }

    // Check date range
    const now = new Date();
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
      return { valid: false, discount: 0, message: 'This coupon is not yet valid' };
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < now) {
      return { valid: false, discount: 0, message: 'This coupon has expired' };
    }

    // Check usage limits
    if (coupon.max_uses > 0 && coupon.times_used >= coupon.max_uses) {
      return { valid: false, discount: 0, message: 'This coupon has reached its usage limit' };
    }

    // Check minimum order
    if (coupon.min_order_amount && cartTotal < parseFloat(coupon.min_order_amount)) {
      return {
        valid: false, discount: 0,
        message: `Minimum order amount of ${coupon.min_order_amount} required`,
      };
    }

    // Check applicable products/categories
    const applicableProducts = coupon.applicable_products || [];
    const applicableCategories = coupon.applicable_categories || [];

    let eligibleItems = cartItems;
    if (applicableProducts.length > 0 || applicableCategories.length > 0) {
      const productIds = applicableProducts.map(p => p.id || p.documentId);
      const categoryIds = applicableCategories.map(c => c.id || c.documentId);

      eligibleItems = cartItems.filter(item =>
        productIds.includes(item.product_id) ||
        categoryIds.includes(item.category_id)
      );

      if (eligibleItems.length === 0) {
        return { valid: false, discount: 0, message: 'Coupon does not apply to items in your cart' };
      }
    }

    // Calculate discount
    const eligibleTotal = eligibleItems.reduce(
      (sum, item) => sum + (parseFloat(item.price) * item.qty), 0
    );

    let discount = 0;
    switch (coupon.type) {
      case 'percentage':
        discount = Math.round((eligibleTotal * parseFloat(coupon.value) / 100) * 100) / 100;
        break;
      case 'fixed_amount':
        discount = Math.min(parseFloat(coupon.value), cartTotal);
        break;
      case 'free_shipping':
        discount = 0; // Handled separately in shipping calculation
        break;
    }

    return {
      valid: true,
      coupon,
      discount,
      freeShipping: coupon.type === 'free_shipping',
      message: coupon.type === 'free_shipping'
        ? 'Free shipping applied!'
        : `Discount of ${discount.toFixed(2)} applied`,
    };
  },

  /**
   * Increment the times_used counter after successful order
   */
  async incrementUsage(couponDocumentId) {
    const coupon = await strapi.documents('api::coupon.coupon').findOne({
      documentId: couponDocumentId,
    });
    if (coupon) {
      await strapi.documents('api::coupon.coupon').update({
        documentId: couponDocumentId,
        data: { times_used: (coupon.times_used || 0) + 1 },
      });
    }
  },
});
