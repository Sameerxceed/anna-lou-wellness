'use strict';

/**
 * Multi-Currency Service (Global)
 *
 * Converts prices between currencies using stored exchange rates.
 * Detects preferred currency from country code.
 */

module.exports = ({ strapi }) => ({

  /**
   * Convert an amount from one currency to another
   * @param {number} amount
   * @param {string} fromCurrency - e.g. "EUR"
   * @param {string} toCurrency - e.g. "GBP"
   * @returns {number} converted amount (rounded to 2 decimals)
   */
  async convertPrice(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;

    const rate = await this.getRate(fromCurrency, toCurrency);
    if (!rate) return amount; // No conversion available

    return Math.round(amount * rate * 100) / 100;
  },

  /**
   * Get exchange rate between two currencies
   * @returns {number|null}
   */
  async getRate(fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return 1;

    // Try direct lookup
    const directRates = await strapi.documents('api::currency-rate.currency-rate').findMany({
      filters: {
        base_currency: fromCurrency.toUpperCase(),
        target_currency: toCurrency.toUpperCase(),
      },
      limit: 1,
    });

    if (directRates.length > 0) {
      return parseFloat(directRates[0].rate);
    }

    // Try inverse lookup
    const inverseRates = await strapi.documents('api::currency-rate.currency-rate').findMany({
      filters: {
        base_currency: toCurrency.toUpperCase(),
        target_currency: fromCurrency.toUpperCase(),
      },
      limit: 1,
    });

    if (inverseRates.length > 0) {
      return Math.round((1 / parseFloat(inverseRates[0].rate)) * 10000) / 10000;
    }

    return null;
  },

  /**
   * Detect preferred currency from country code
   * @param {string} countryCode - ISO country code
   * @returns {string} currency code
   */
  detectCurrency(countryCode) {
    const currencyMap = {
      // Eurozone
      IE: 'EUR', DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', PT: 'EUR',
      NL: 'EUR', BE: 'EUR', AT: 'EUR', FI: 'EUR', GR: 'EUR', LU: 'EUR',
      // UK
      GB: 'GBP',
      // USD
      US: 'USD',
      // Others
      JP: 'JPY', CA: 'CAD', AU: 'AUD', CH: 'CHF', SE: 'SEK',
      NO: 'NOK', DK: 'DKK', NZ: 'NZD', SG: 'SGD', HK: 'HKD',
      IN: 'INR', CN: 'CNY', KR: 'KRW', BR: 'BRL', MX: 'MXN',
    };

    return currencyMap[(countryCode || '').toUpperCase()] || 'EUR';
  },

  /**
   * Get all supported currencies with their rates
   */
  async getSupportedCurrencies() {
    const siteSettings = await strapi.documents('api::site-settings.site-settings').findMany({ limit: 1 });
    const settings = siteSettings[0];

    if (!settings || !settings.supported_currencies) return ['EUR'];
    return settings.supported_currencies;
  },
});
