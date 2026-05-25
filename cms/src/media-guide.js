'use strict';

/**
 * Media Upload Guide — field descriptions shown in the admin panel.
 *
 * Sets the small help text under each media field on the edit form so
 * Anna sees the recommended dimensions / aspect ratio / file size right
 * where she'd otherwise have to guess.
 *
 * Strapi auto-generates responsive breakpoints (thumbnail / small /
 * medium / large / xlarge) on every upload, AND every consuming component
 * uses `object-fit: cover` or `object-fit: contain` so oversized or
 * wrong-aspect uploads still render — but uploading at the recommended
 * size gives the best visual result and the fastest load.
 *
 * Format: "[purpose]. Best size: [W]×[H] ([ratio]). Max 2 MB. [notes]"
 *
 * Standard sizes used across the site:
 *   Portrait 4:5 (1200×1500) — most hero / portrait blocks
 *   Landscape 16:9 (1600×900) — article heroes, wide banners, retreats
 *   Square 1:1 (1200×1200) — product photos, headshots, social cards
 *   Portrait 3:4 (1200×1600) — Anna's portrait blocks, tall hero
 */

// ── Singletons ────────────────────────────────────────────────────
const singleTypes = {
  'api::homepage.homepage': {
    heroImage:
      'Hero photo on the right of the homepage opening section. Best size: 1200×1500 (portrait 4:5), JPEG or PNG, max 2 MB. Atmospheric, golden hour, Anna on Taggs Island works well.',
    workImage:
      'Photo on the right of the Work with Anna section. Best size: 1200×1500 (portrait 4:5), max 2 MB. Coaching session vibe — houseboat, soft light.',
    communityImage:
      'Photo on the left of the Community section. Best size: 1600×1200 (landscape 4:3), max 2 MB. Circle gathering, warm, real.',
    portraitImage:
      'Portrait photo on the left of the Anna intro section. Best size: 1200×1500 (portrait 4:5), max 2 MB. Head-and-shoulders or three-quarter shot of Anna.',
  },
  'api::site-settings.site-settings': {
    logo:
      'Site logo (light background). PNG with transparent background, ~600px wide. Max 500 KB. Shows in the top nav.',
    favicon:
      'Browser tab icon. PNG, 512×512 (square). Max 200 KB. Auto-resized for all tab sizes.',
    og_default_image:
      'Default social-media preview image (Facebook, WhatsApp, Twitter, LinkedIn). JPEG, 1200×630 (roughly 2:1). Max 1 MB. Used when a specific page doesn\'t have its own.',
  },
  'api::about-page.about-page': {
    portrait:
      'Anna\'s portrait photo on the About page. Best size: 1200×1500 (portrait 4:5), max 2 MB. The hero image of the section.',
  },
  'api::community-page.community-page': {
    circle_image:
      'Photo for The Returning Circle section. Best size: 1200×1500 (portrait 4:5), max 2 MB. Circle gathering, candles, warm.',
    reset_room_image:
      'Photo for The Reset Room section. Best size: 1200×1500 (portrait 4:5), max 2 MB. Intimate, somatic-practice setting.',
  },
  'api::work-with-anna-page.work-with-anna-page': {
    hero_image:
      'Hero photo on the /the-work page. Best size: 1200×1500 (portrait 4:5), max 2 MB. Coaching or somatic-work setting.',
  },
  'api::shop-page.shop-page': {
    hero_image:
      'Hero photo on the /shop page. Best size: 1600×900 (landscape 16:9), max 2 MB. Wide banner across the top.',
  },
  'api::reset-stories-page.reset-stories-page': {
    hero_image:
      'Optional hero photo at the top of the Reset Stories section page. Best size: 1600×900 (landscape 16:9), max 2 MB. Leave blank to use the default editorial layout.',
  },
  'api::life-page.life-page': {
    hero_image:
      'Optional hero photo at the top of the Life section page. Best size: 1600×900 (landscape 16:9), max 2 MB.',
  },
  'api::love-and-relationships-page.love-and-relationships-page': {
    hero_image:
      'Optional hero photo at the top of the Love & Relationships section page. Best size: 1600×900 (landscape 16:9), max 2 MB.',
  },
  'api::work-and-money-page.work-and-money-page': {
    hero_image:
      'Optional hero photo at the top of the Work & Money section page. Best size: 1600×900 (landscape 16:9), max 2 MB.',
  },
};

// ── Collections ───────────────────────────────────────────────────
const collectionTypes = {
  'api::product.product': {
    images:
      'Product photos. Best size: 1200×1200 (square 1:1), JPEG or PNG, max 2 MB each. Upload 1–5. First image is the main shop thumbnail. Other shapes work too — the product page fits any image inside a square frame without cropping.',
  },
  'api::article.article': {
    hero_image:
      'Hero photo at the top of the article. Best size: 1600×900 (landscape 16:9), max 2 MB. Wide, editorial — sets the tone for the piece.',
  },
  'api::experience.experience': {
    hero_image:
      'Hero photo for the retreat / workshop. Best size: 1600×900 (landscape 16:9), max 2 MB. Used on the listing card AND the detail page. Houseboat, river, golden hour all work.',
  },
  'api::coaching-session.coaching-session': {
    hero_image:
      'Hero photo for the session card and detail page. Best size: 1200×1500 (portrait 4:5), max 2 MB. Coaching, somatic, body-based imagery.',
  },
  'api::programme.programme': {
    heroImage:
      'Hero photo for the programme card and detail page. Best size: 1200×1500 (portrait 4:5), max 2 MB.',
  },
  'api::team-member.team-member': {
    portrait:
      'Team member portrait. Best size: 800×1000 (portrait 4:5), max 1 MB. Head-and-shoulders, soft natural light.',
  },
  'api::testimonial.testimonial': {
    video:
      'Optional short video testimonial. MP4 or MOV, under 90 seconds, max 25 MB. Vertical (9:16) or square (1:1) both work. Leave blank for a text-only review.',
    video_thumbnail:
      'Poster image shown before the video plays. Best size: 800×800 (square 1:1) or 720×1280 (vertical 9:16), JPEG, max 500 KB. Use a still from the video.',
  },
};

// ── Apply descriptions to content-manager configuration ───────────

async function setMediaDescriptions(strapi) {
  const allConfigs = [
    ...Object.entries(singleTypes).map(([uid, fields]) => ({
      uid,
      fields,
      storeKey: `plugin_content_manager_configuration_content_types::${uid}`,
    })),
    ...Object.entries(collectionTypes).map(([uid, fields]) => ({
      uid,
      fields,
      storeKey: `plugin_content_manager_configuration_content_types::${uid}`,
    })),
  ];

  let updated = 0;

  for (const { uid, fields, storeKey } of allConfigs) {
    if (!Object.keys(fields).length) continue;

    try {
      const entry = await strapi.db.query('strapi::core-store').findOne({
        where: { key: storeKey },
      });

      if (!entry || !entry.value) continue;

      const config = typeof entry.value === 'string'
        ? JSON.parse(entry.value)
        : entry.value;

      if (!config.metadatas) continue;

      let changed = false;
      for (const [field, description] of Object.entries(fields)) {
        if (config.metadatas[field]?.edit) {
          if (config.metadatas[field].edit.description !== description) {
            config.metadatas[field].edit.description = description;
            changed = true;
          }
        }
      }

      if (changed) {
        await strapi.db.query('strapi::core-store').update({
          where: { id: entry.id },
          data: { value: JSON.stringify(config) },
        });
        updated++;
      }
    } catch (err) {
      strapi.log.warn(`Could not set media descriptions for ${uid}: ${err.message}`);
    }
  }

  if (updated > 0) {
    strapi.log.info(`[media-guide] Media upload descriptions set for ${updated} content types`);
  }
}

module.exports = setMediaDescriptions;
