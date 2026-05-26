'use strict';

/**
 * Seed friendly field labels in Strapi Content Manager configuration.
 *
 * Without this, Strapi v5 displays raw camelCase field names in the admin
 * edit form (e.g. "heroKicker" instead of "Hero kicker"). Anna saw this
 * on the Homepage edit screen on 21 May and the fix is to programmatically
 * write the Content Manager configuration metadata that drives those labels.
 *
 * What this does:
 *   1. Walk every api::* content type that has a stored configuration
 *   2. For each field, derive a friendly label (camelCase → Title Case)
 *      with common acronyms (CTA, URL, SEO, FAQ) upper-cased
 *   3. Copy the schema `description` into the edit-view description so the
 *      helpful hint text shows up under each field
 *
 * Safety:
 *   - Only overwrites labels that are still raw (label === field name) so
 *     anything Anna has manually customized in "Configure the view" is preserved.
 *   - Skips content types that don't yet have a configuration record (Strapi
 *     creates those the first time a content type is opened in admin).
 *   - Entire seed wrapped in try/catch in src/index.js so a bug here can't
 *     prevent CMS boot.
 *   - Honours SKIP_FIELD_LABEL_SEED=true env var as a kill-switch.
 *
 * --- Xceed pattern ---
 * Drop this script into any Strapi project, list your content type UIDs in
 * TARGETS (or rely on auto-discovery), and the admin form labels improve
 * immediately. No manual "Configure the view" work needed per content type.
 */

// Acronyms that should be UPPERCASED in labels. The transform lower-cases
// every segment by default; segments that match a key here get replaced
// with the value. Keep keys lowercase, values in their preferred casing.
const SPECIAL_TERMS = {
  cta: 'CTA',
  url: 'URL',
  uri: 'URI',
  seo: 'SEO',
  faq: 'FAQ',
  id: 'ID',
  api: 'API',
  ui: 'UI',
  ux: 'UX',
  utm: 'UTM',
  alw: 'ALW',
  alol: 'ALOL',
  uk: 'UK',
  usa: 'USA',
  ip: 'IP',
  sms: 'SMS',
  vat: 'VAT',
};

// camelCase / snake_case / digit-suffix → friendly Title Case.
//   heroKicker          → "Hero kicker"
//   heroCtaPrimaryLabel → "Hero CTA primary label"
//   mediaTile1Url       → "Media tile 1 URL"
//   issue_no_one        → "Issue no one"
const friendlyLabel = (fieldName) => {
  const cleaned = fieldName
    .replace(/_/g, ' ')
    .replace(/([A-Z]+)/g, ' $1')
    .replace(/([0-9]+)/g, ' $1 ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  const titled = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return titled
    .split(' ')
    .map((w) => SPECIAL_TERMS[w] || w)
    .join(' ');
};

/**
 * Per-page explicit label overrides.
 *
 * Auto-generated labels (heroImage → "Hero image", workImage → "Work image")
 * are fine when there's one of each. But singletons with several image
 * fields confuse editors: on the Homepage, "Hero image" and "Work image"
 * and "Community image" don't tell Anna which is FIRST on the page vs
 * which is LAST. She has to scroll, find the photo, swap, repeat.
 *
 * This map gives the most-edited content types per-field labels that
 * include the page position + section name. Editors see:
 *   "Image 1 — Hero (top of page, right side)"
 *   "Image 2 — Work with Anna section"
 * instead of:
 *   "Hero image"
 *   "Work image"
 *
 * Add a content type here only if its auto-label feels ambiguous to
 * editors. For singletons with one image it isn't worth the maintenance.
 *
 * Key = content type UID, value = { fieldName: 'Explicit label' }.
 */
const EXPLICIT_LABELS = {
  'api::homepage.homepage': {
    heroImage: 'Image 1 — Hero (top of page, right side)',
    workImage: 'Image 2 — Work with Anna section',
    communityImage: 'Image 3 — Community section (left side)',
    portraitImage: 'Image 4 — About Anna portrait',
  },
  'api::reset-room-page.reset-room-page': {
    heroImage: 'Image 1 — Reset Room hero (top of page)',
  },
  'api::about-page.about-page': {
    portrait: 'Image 1 — Anna portrait (hero of About page)',
  },
  'api::community-page.community-page': {
    circle_image: 'Image 1 — Returning Circle section',
    reset_room_image: 'Image 2 — Reset Room section',
  },
  'api::work-with-anna-page.work-with-anna-page': {
    hero_image: 'Image 1 — Hero (top of /the-work page)',
  },
  'api::shop-page.shop-page': {
    hero_image: 'Image 1 — Hero (top of /shop page, wide banner)',
  },
  'api::reset-stories-page.reset-stories-page': {
    hero_image: 'Image 1 — Hero (top of Reset Stories section page, optional)',
  },
  'api::life-page.life-page': {
    hero_image: 'Image 1 — Hero (top of Life section page, optional)',
  },
  'api::love-and-relationships-page.love-and-relationships-page': {
    hero_image: 'Image 1 — Hero (top of Love & Relationships section, optional)',
  },
  'api::work-and-money-page.work-and-money-page': {
    hero_image: 'Image 1 — Hero (top of Work & Money section, optional)',
  },
  'api::site-settings.site-settings': {
    logo: 'Image 1 — Site logo (appears in top nav)',
    favicon: 'Image 2 — Browser tab icon (favicon)',
    og_default_image: 'Image 3 — Default social-share image (Facebook/WhatsApp/Twitter)',
  },
};

// Internal Strapi fields we never relabel.
const SKIP_FIELDS = new Set([
  'id',
  'documentId',
  'createdAt',
  'updatedAt',
  'publishedAt',
  'createdBy',
  'updatedBy',
  'locale',
  'localizations',
]);

// Pick the best "title-like" field on a content type / component so each
// instance in a repeatable list shows by its actual name (e.g. menu item
// "Reset Stories") instead of "nav.menu-item #1".
//
// Strapi calls this the "mainField" — it's read from settings.mainField
// in the Content Manager configuration.
//
// Priority order matches what real-world schemas tend to call their title:
//   label  → menu items, buttons, sub-links
//   title  → articles, programmes, generic content
//   name   → products, people, categories
//   heading → hero sections, blocks
// Fallback: first string attribute on the schema.
const TITLE_FIELD_PRIORITY = ['label', 'title', 'name', 'displayName', 'heading'];
const pickMainField = (attributes) => {
  for (const field of TITLE_FIELD_PRIORITY) {
    const attr = attributes[field];
    if (attr && (attr.type === 'string' || attr.type === 'uid')) {
      return field;
    }
  }
  for (const [field, attr] of Object.entries(attributes)) {
    if (attr && (attr.type === 'string' || attr.type === 'uid')) {
      return field;
    }
  }
  return null;
};

module.exports = async (strapi) => {
  if (process.env.SKIP_FIELD_LABEL_SEED === 'true') {
    strapi.log.info('[seed-field-labels] skipped (SKIP_FIELD_LABEL_SEED=true)');
    return;
  }

  // Walk one configuration record (content type or component) and apply
  // friendly labels to its fields + pick a sensible mainField so the entry
  // is identifiable in repeatable lists. Returns status of what changed.
  // `uid` is the content type identifier — used to look up explicit labels.
  const applyLabelsTo = async (storeKey, attributes, uid = null) => {
    const store = strapi.store({
      type: 'plugin',
      name: 'content_manager',
      key: storeKey,
    });
    const existing = await store.get();
    if (!existing || typeof existing !== 'object') {
      // No config yet — Strapi creates one on first admin open of this type.
      return { status: 'no-config' };
    }

    const metadatas = { ...(existing.metadatas || {}) };
    let changed = false;
    const explicit = (uid && EXPLICIT_LABELS[uid]) || {};

    for (const [field, attr] of Object.entries(attributes)) {
      if (SKIP_FIELDS.has(field)) continue;

      // Prefer an explicit override; fall back to the auto-derived label.
      const friendly = explicit[field] || friendlyLabel(field);
      const schemaDescription = (attr && attr.description) || '';
      const current = metadatas[field] || {};
      const currentEdit = current.edit || {};
      const currentList = current.list || {};

      // Overwrite if:
      //   - label is missing
      //   - label is still the raw field name (auto-generated default)
      //   - label is the prior auto-derived friendly label AND an explicit
      //     override now exists (lets us upgrade old labels to explicit ones
      //     without trashing labels Anna manually customised via Configure
      //     the view).
      const autoFriendly = friendlyLabel(field);
      const hasExplicit = Boolean(explicit[field]);
      const editLabelIsRaw =
        !currentEdit.label ||
        currentEdit.label === field ||
        (hasExplicit && currentEdit.label === autoFriendly);
      const listLabelIsRaw =
        !currentList.label ||
        currentList.label === field ||
        (hasExplicit && currentList.label === autoFriendly);
      // Ensure schema description shows up as helper text under the field.
      const descNeedsCopy =
        schemaDescription && currentEdit.description !== schemaDescription;

      if (editLabelIsRaw || listLabelIsRaw || descNeedsCopy) {
        metadatas[field] = {
          edit: {
            ...currentEdit,
            label: editLabelIsRaw ? friendly : currentEdit.label,
            description: schemaDescription || currentEdit.description || '',
            placeholder: currentEdit.placeholder || '',
            visible: currentEdit.visible !== false,
            editable: currentEdit.editable !== false,
          },
          list: {
            ...currentList,
            label: listLabelIsRaw ? friendly : currentList.label,
            searchable: currentList.searchable !== false,
            sortable: currentList.sortable !== false,
          },
        };
        changed = true;
      }
    }

    // Ensure each repeatable list entry shows by its actual title.
    // For components especially — without this, "Reset Stories" / "Life"
    // / "Love & Rels" all show as "nav.menu-item #1, #2, #3" in admin.
    const existingSettings = existing.settings || {};
    const desiredMainField = pickMainField(attributes);
    const mainFieldIsRaw =
      !existingSettings.mainField || existingSettings.mainField === 'id';
    let nextSettings = existingSettings;
    if (desiredMainField && mainFieldIsRaw) {
      nextSettings = { ...existingSettings, mainField: desiredMainField };
      changed = true;
    }

    if (changed) {
      await store.set({
        value: { ...existing, metadatas, settings: nextSettings },
      });
      return { status: 'updated', mainField: nextSettings.mainField };
    }
    return { status: 'unchanged' };
  };

  let touched = 0;
  let skipped = 0;
  let failed = 0;

  // 1. Content types (api::*) — Homepage, Navigation, Footer, landing pages,
  //    Article, Product, Order, etc.
  const contentTypeUids = Object.keys(strapi.contentTypes || {}).filter((uid) =>
    uid.startsWith('api::'),
  );
  for (const uid of contentTypeUids) {
    try {
      const ct = strapi.contentTypes[uid];
      if (!ct || !ct.attributes) {
        skipped++;
        continue;
      }
      const result = await applyLabelsTo(
        `configuration_content_types::${uid}`,
        ct.attributes,
        uid,
      );
      if (result.status === 'updated') {
        touched++;
        const tail = result.mainField ? ` (mainField=${result.mainField})` : '';
        strapi.log.info(`[seed-field-labels] applied → ${uid}${tail}`);
      } else {
        skipped++;
      }
    } catch (err) {
      failed++;
      strapi.log.warn(`[seed-field-labels] failed for ${uid}: ${err.message}`);
    }
  }

  // 2. Components (nav.menu-item, nav.child-link, about.press-logo, etc.)
  //    Each is rendered nested inside its parent's edit form. Without a
  //    mainField each instance in a repeatable list shows as a generic
  //    "nav.menu-item #1" — with mainField=label it shows as "Reset Stories".
  const componentUids = Object.keys(strapi.components || {});
  for (const uid of componentUids) {
    try {
      const cmp = strapi.components[uid];
      if (!cmp || !cmp.attributes) {
        skipped++;
        continue;
      }
      const result = await applyLabelsTo(
        `configuration_components::${uid}`,
        cmp.attributes,
      );
      if (result.status === 'updated') {
        touched++;
        const tail = result.mainField ? ` (mainField=${result.mainField})` : '';
        strapi.log.info(`[seed-field-labels] applied → component ${uid}${tail}`);
      } else {
        skipped++;
      }
    } catch (err) {
      failed++;
      strapi.log.warn(`[seed-field-labels] failed for component ${uid}: ${err.message}`);
    }
  }

  strapi.log.info(
    `[seed-field-labels] done: ${touched} updated, ${skipped} skipped, ${failed} errored ` +
      `(of ${contentTypeUids.length} content types + ${componentUids.length} components)`,
  );
};
