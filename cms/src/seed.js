'use strict';

/**
 * Seed Database — Anna Lou Wellness
 * Runs once on first boot when database is empty.
 * Seeds product categories, site settings, and e-commerce infrastructure.
 * All other content (products, blog posts, coaching, etc.) is created via the CMS admin panel.
 */

async function seedDatabase(strapi) {
  // Check if already seeded
  const shippingZones = await strapi.documents('api::shipping-zone.shipping-zone').findMany({ limit: 1 });
  if (shippingZones.length > 0) {
    strapi.log.info('Content already exists — skipping seed');
    return;
  }

  strapi.log.info('Seeding Anna Lou Wellness database...');

  // ═══ PRODUCT CATEGORIES ═══
  const categories = [
    { name: 'Crystals', slug: 'crystals', sort_order: 1 },
    { name: 'Crystal Jewellery', slug: 'crystal-jewellery', sort_order: 2 },
    { name: 'Emotional Support Jewellery', slug: 'esj', sort_order: 3 },
    { name: 'Digital Downloads', slug: 'digital', sort_order: 4 },
    { name: 'Gifts', slug: 'gifts', sort_order: 5 },
  ];
  for (const cat of categories) {
    await strapi.documents('api::product-category.product-category').create({
      data: cat, status: 'published',
    });
  }

  // ═══ HOMEPAGE (Single Type) ═══
  await strapi.documents('api::homepage.homepage').create({
    data: {
      hero_title: 'Beautifully Whole',
      hero_subtitle: 'Anna Lou Wellness',
      hero_tagline: 'Coaching, healing, and transformation for women ready\nto step into a more aligned version of themselves.',
      cta_primary_text: 'Work With Me',
      cta_primary_link: '/coaching',
      cta_secondary_text: 'Shop',
      cta_secondary_link: '/shop',
      intro_label: 'Reset Stories',
      intro_heading: 'Come back\nto yourself',
      intro_body: 'Anna Lou Wellness is a platform for women ready to step into a more aligned, elevated version of themselves. Through coaching, healing, editorial content, and symbolic products, every element supports a unified journey of transformation.',
      intro_quote: 'Your reset starts here.\nBeautifully Whole.',
    },
    status: 'published',
  });

  // ═══ CONTACT PAGE (Single Type) ═══
  await strapi.documents('api::contact-page.contact-page').create({
    data: {
      email: 'hello@annalouwellness.com',
      phone: '',
      address: 'London, UK',
      map_latitude: 51.45,
      map_longitude: -0.33,
      parking_info: '',
      directions: '',
    },
    status: 'published',
  });

  // ═══ SITE SETTINGS (Single Type) ═══
  await strapi.documents('api::site-settings.site-settings').create({
    data: {
      site_name: 'Anna Lou Wellness',
      site_tagline: 'Beautifully Whole',
      seo_description: 'Coaching, healing, and transformation for women ready to step into a more aligned, elevated version of themselves. Beautifully Whole.',
      seo_keywords: 'wellness coaching, somatic healing, trauma release, TRE, coaching for women, Anna Lou Wellness, emotional support jewellery, reset stories',
      instagram_url: 'https://instagram.com/annalouwellness',
      notification_email: 'hello@annalouwellness.com',
      shop_email: 'hello@annalouwellness.com',
      default_currency: 'GBP',
      supported_currencies: ['GBP', 'EUR', 'USD'],
      auto_currency_conversion: false,
      tax_included_in_prices: true,
      low_stock_threshold: 5,
      review_moderation_enabled: true,
      abandoned_cart_email_delay_hours: 24,
      cookie_banner_text: 'We use cookies to improve your experience. By continuing to visit this site, you agree to our use of cookies.',
      footer_copyright: 'Anna Lou Wellness. All rights reserved.',
      maintenance_mode: false,
    },
    status: 'published',
  });

  // ═══ SHIPPING ZONES & METHODS ═══
  const ukZone = await strapi.documents('api::shipping-zone.shipping-zone').create({
    data: { name: 'United Kingdom', countries: ['GB'], is_active: true },
  });
  const euZone = await strapi.documents('api::shipping-zone.shipping-zone').create({
    data: { name: 'EU', countries: ['IE', 'DE', 'FR', 'IT', 'ES', 'PT', 'NL', 'BE', 'AT', 'FI', 'GR', 'LU', 'SE', 'DK'], is_active: true },
  });
  const rowZone = await strapi.documents('api::shipping-zone.shipping-zone').create({
    data: { name: 'Rest of World', countries: ['US', 'CA', 'AU'], is_active: true },
  });

  await strapi.documents('api::shipping-method.shipping-method').create({
    data: { name: 'Standard Delivery', shipping_zone: ukZone.documentId, type: 'free_above_threshold', rate: 3.95, free_threshold: 40.00, estimated_days: '2-4 business days', is_active: true },
  });
  await strapi.documents('api::shipping-method.shipping-method').create({
    data: { name: 'Express Delivery', shipping_zone: ukZone.documentId, type: 'flat_rate', rate: 6.95, estimated_days: '1-2 business days', is_active: true },
  });
  await strapi.documents('api::shipping-method.shipping-method').create({
    data: { name: 'Standard Delivery', shipping_zone: euZone.documentId, type: 'flat_rate', rate: 9.95, estimated_days: '5-7 business days', is_active: true },
  });
  await strapi.documents('api::shipping-method.shipping-method').create({
    data: { name: 'Standard Delivery', shipping_zone: rowZone.documentId, type: 'flat_rate', rate: 14.95, estimated_days: '7-14 business days', is_active: true },
  });

  // ═══ TAX RULES ═══
  await strapi.documents('api::tax-rule.tax-rule').create({
    data: { name: 'UK VAT', country_code: 'GB', rate: 20.0, is_inclusive: true, applies_to_shipping: false, is_active: true },
  });
  await strapi.documents('api::tax-rule.tax-rule').create({
    data: { name: 'EU VAT (Standard)', country_code: 'DE', rate: 19.0, is_inclusive: true, applies_to_shipping: false, is_active: true },
  });

  // ═══ COUPONS ═══
  await strapi.documents('api::coupon.coupon').create({
    data: { code: 'WELCOME10', type: 'percentage', value: 10, min_order_amount: 20, max_uses: 0, times_used: 0, is_active: true },
  });
  await strapi.documents('api::coupon.coupon').create({
    data: { code: 'FREESHIP', type: 'free_shipping', value: 0, min_order_amount: 0, max_uses: 0, times_used: 0, is_active: true },
  });
  await strapi.documents('api::coupon.coupon').create({
    data: { code: 'ANNALOU20', type: 'fixed_amount', value: 20, min_order_amount: 50, max_uses: 100, times_used: 0, is_active: true },
  });

  // ═══ CURRENCY RATES ═══
  await strapi.documents('api::currency-rate.currency-rate').create({
    data: { base_currency: 'GBP', target_currency: 'EUR', rate: 1.16, last_updated: new Date().toISOString() },
  });
  await strapi.documents('api::currency-rate.currency-rate').create({
    data: { base_currency: 'GBP', target_currency: 'USD', rate: 1.27, last_updated: new Date().toISOString() },
  });

  strapi.log.info('Anna Lou Wellness database seeded successfully!');
}

module.exports = seedDatabase;
