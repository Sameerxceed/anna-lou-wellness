'use strict';

/**
 * Tax Calculation Service
 *
 * Calculates taxes based on shipping country and product tax classes.
 * Supports inclusive (price includes tax) and exclusive (tax added on top) modes.
 */

module.exports = ({ strapi }) => ({

  /**
   * Calculate tax for an order
   * @param {Array} items - Array of { product_id, qty, price, tax_class }
   * @param {string} countryCode - ISO country code (e.g. "IE", "GB")
   * @param {string} [region] - Optional sub-region
   * @returns {{ totalTax: number, breakdown: Array<{ name, rate, amount }>, isInclusive: boolean }}
   */
  async calculateTax(items, countryCode, region = null) {
    if (!countryCode) {
      return { totalTax: 0, breakdown: [], isInclusive: true };
    }

    // Find matching tax rules for the country
    const filters = {
      country_code: countryCode.toUpperCase(),
      is_active: true,
    };
    if (region) {
      filters.region = region;
    }

    const taxRules = await strapi.documents('api::tax-rule.tax-rule').findMany({
      filters,
      sort: { rate: 'desc' },
    });

    if (taxRules.length === 0) {
      return { totalTax: 0, breakdown: [], isInclusive: true };
    }

    // Use the first matching rule (highest priority)
    const rule = taxRules[0];
    const rate = parseFloat(rule.rate) / 100;
    const isInclusive = rule.is_inclusive;

    // Calculate tax per item
    let totalTax = 0;
    const breakdown = [];

    for (const item of items) {
      const itemTotal = parseFloat(item.price) * item.qty;
      const taxClass = item.tax_class || 'standard';

      // Zero-rated items have no tax
      if (taxClass === 'zero') continue;

      // Reduced rate items get half the standard rate (simplified)
      const effectiveRate = taxClass === 'reduced' ? rate * 0.5 : rate;

      let taxAmount;
      if (isInclusive) {
        // Tax is already included in the price: extract it
        taxAmount = itemTotal - (itemTotal / (1 + effectiveRate));
      } else {
        // Tax is added on top of the price
        taxAmount = itemTotal * effectiveRate;
      }

      taxAmount = Math.round(taxAmount * 100) / 100;
      totalTax += taxAmount;
    }

    totalTax = Math.round(totalTax * 100) / 100;

    breakdown.push({
      name: rule.name,
      rate: parseFloat(rule.rate),
      amount: totalTax,
      isInclusive,
    });

    return { totalTax, breakdown, isInclusive };
  },

  /**
   * Calculate tax on shipping cost
   */
  async calculateShippingTax(shippingCost, countryCode) {
    if (!shippingCost || shippingCost <= 0) return 0;

    const taxRules = await strapi.documents('api::tax-rule.tax-rule').findMany({
      filters: {
        country_code: countryCode.toUpperCase(),
        applies_to_shipping: true,
        is_active: true,
      },
      limit: 1,
    });

    if (taxRules.length === 0) return 0;

    const rule = taxRules[0];
    const rate = parseFloat(rule.rate) / 100;

    if (rule.is_inclusive) {
      return Math.round((shippingCost - shippingCost / (1 + rate)) * 100) / 100;
    }
    return Math.round(shippingCost * rate * 100) / 100;
  },
});
