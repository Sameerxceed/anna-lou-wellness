'use strict';

/**
 * Shipping Rate Calculator
 *
 * Determines available shipping methods based on:
 * - Customer's country
 * - Cart weight
 * - Cart total (for free shipping thresholds)
 */

module.exports = ({ strapi }) => ({

  /**
   * Get available shipping methods for a given country
   * @param {string} countryCode - ISO country code
   * @param {number} cartWeight - Total weight in grams
   * @param {number} cartTotal - Cart subtotal
   * @param {boolean} freeShippingCoupon - If a free-shipping coupon is applied
   * @returns {Array<{ id, name, rate, estimatedDays, isFree }>}
   */
  async getAvailableShippingMethods(countryCode, cartWeight = 0, cartTotal = 0, freeShippingCoupon = false) {
    if (!countryCode) return [];

    // Find shipping zone that includes this country
    const zones = await strapi.documents('api::shipping-zone.shipping-zone').findMany({
      filters: { is_active: true },
      populate: ['shipping_methods'],
    });

    const matchingZone = zones.find(zone => {
      const countries = zone.countries || [];
      return countries.includes(countryCode.toUpperCase());
    });

    if (!matchingZone) return [];

    const methods = (matchingZone.shipping_methods || []).filter(m => m.is_active);
    const result = [];

    for (const method of methods) {
      // Weight-based: check if cart weight falls within range
      if (method.type === 'weight_based') {
        const minW = method.min_weight || 0;
        const maxW = method.max_weight || Infinity;
        if (cartWeight < minW || cartWeight > maxW) continue;
      }

      let rate = parseFloat(method.rate) || 0;
      let isFree = false;

      // Free above threshold
      if (method.type === 'free_above_threshold' && method.free_threshold) {
        if (cartTotal >= parseFloat(method.free_threshold)) {
          rate = 0;
          isFree = true;
        }
      }

      // Weight-based rate calculation
      if (method.type === 'weight_based' && cartWeight > 0) {
        rate = Math.round((cartWeight / 1000) * rate * 100) / 100; // rate per kg
      }

      // Free shipping coupon override
      if (freeShippingCoupon) {
        rate = 0;
        isFree = true;
      }

      result.push({
        id: method.documentId || method.id,
        name: method.name,
        rate: Math.round(rate * 100) / 100,
        estimatedDays: method.estimated_days || '',
        isFree,
        type: method.type,
      });
    }

    // Sort: free first, then by rate ascending
    result.sort((a, b) => {
      if (a.isFree && !b.isFree) return -1;
      if (!a.isFree && b.isFree) return 1;
      return a.rate - b.rate;
    });

    return result;
  },

  /**
   * Calculate shipping cost for a specific method
   */
  async getShippingCost(methodId, cartWeight = 0, cartTotal = 0, freeShippingCoupon = false) {
    const method = await strapi.documents('api::shipping-method.shipping-method').findOne({
      documentId: methodId,
    });

    if (!method || !method.is_active) return null;

    let rate = parseFloat(method.rate) || 0;

    if (method.type === 'free_above_threshold' && method.free_threshold) {
      if (cartTotal >= parseFloat(method.free_threshold)) rate = 0;
    }

    if (method.type === 'weight_based' && cartWeight > 0) {
      rate = Math.round((cartWeight / 1000) * rate * 100) / 100;
    }

    if (freeShippingCoupon) rate = 0;

    return {
      name: method.name,
      rate: Math.round(rate * 100) / 100,
      estimatedDays: method.estimated_days,
    };
  },
});
