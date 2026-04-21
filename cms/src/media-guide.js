'use strict';

/**
 * Media Upload Guide — field descriptions shown in the admin panel.
 *
 * Sets help text under each media field so editors know the
 * recommended dimensions, aspect ratio, format, and file size.
 *
 * Strapi auto-generates responsive breakpoints (thumbnail 245px,
 * small 500px, medium 750px, large 1200px, xlarge 1920px), but
 * uploading at the recommended size ensures the best quality.
 */

// ── Descriptions for every media field ──────────────────────────
// Keyed by content-type UID → field name → description text.

const singleTypes = {
  'api::homepage.homepage': {
    hero_video:
      'MP4 video, 1920×1080px (16:9 landscape). Max 25 MB. Plays as full-screen background on the homepage. Keep under 15 seconds for fast loading.',
    hero_poster:
      'JPEG, 1920×1080px (16:9 landscape). Max 2 MB. Shows while the video loads and on mobile devices where video is skipped.',
    intro_image:
      'JPEG or PNG, 800×1067px (3:4 portrait). Max 2 MB. Appears beside the intro text on the homepage.',
  },

  'api::cottage.cottage': {
    gallery:
      'JPEG, 1200×900px each (4:3 landscape). Max 2 MB each. Shown in a 3-column grid with lightbox. Upload 6–12 images.',
  },

  'api::contact-page.contact-page': {
    // No media fields
  },

  'api::site-settings.site-settings': {
    logo:
      'PNG with transparent background, ~200px wide. Max 500 KB. Used in the header navigation.',
    logo_dark:
      'PNG with transparent background, ~200px wide. Max 500 KB. Used on dark backgrounds (footer).',
    favicon:
      'PNG, 512×512px (square). Max 200 KB. Browser tab icon — will be auto-resized.',
    og_default_image:
      'JPEG, 1200×630px (roughly 2:1). Max 1 MB. Default image for social media link previews (Facebook, Twitter, WhatsApp).',
  },
};

const collectionTypes = {
  'api::garden.garden': {
    card_image:
      'JPEG, 600×750px (4:5 portrait). Max 2 MB. Main image shown on the Gardens listing page.',
    gallery:
      'JPEG, 800×800px or larger (1:1 square). Max 2 MB each. Shown in a 2-column grid with lightbox. Upload 4–10 images per garden.',
  },

  'api::product.product': {
    images:
      'JPEG or PNG, 1200×1200px (1:1 square). Max 2 MB each. First image is the main shop thumbnail. Upload 1–5 images.',
  },

  'api::bloom-month.bloom-month': {
    photos:
      'JPEG, 1200×900px (4:3 landscape). Max 2 MB each. Seasonal photos for this month. Upload 1–4 images.',
  },

  'api::event.event': {
    image:
      'JPEG, 1600×900px (16:9 landscape). Max 2 MB. Used as the event banner/hero image.',
  },

  'api::wedding-venue.wedding-venue': {
    image:
      'JPEG, 1600×900px (16:9 landscape). Max 2 MB. Showcases this ceremony location.',
  },

  'api::team-member.team-member': {
    portrait:
      'JPEG, 400×533px (3:4 portrait). Max 1 MB. Head-and-shoulders photo works best.',
  },

  'api::visit-option.visit-option': {
    image:
      'JPEG, 1600×900px (16:9 landscape). Max 2 MB. Represents this visit experience.',
  },
};

// ── Apply descriptions to content-manager configuration ─────────

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
    strapi.log.info(`Media upload descriptions set for ${updated} content types`);
  }
}

module.exports = setMediaDescriptions;
