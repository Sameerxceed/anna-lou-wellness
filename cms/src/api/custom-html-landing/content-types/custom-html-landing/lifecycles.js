'use strict';

/**
 * Custom HTML Landing lifecycle — revalidates /campaigns/{slug} on
 * create / update / delete AND auto-generates SEO title + description
 * from the entry's title + a stripped-text version of raw_html.
 *
 * Text extraction from HTML: raw_html can be a full HTML document with
 * <style>, <script>, and tag markup. We strip everything but the visible
 * body copy before sending to Claude — otherwise Claude tries to
 * "summarise" the markup and returns nonsense.
 */

const { notifyRevalidate } = require('../../../../utils/revalidate');
const autoSeo = require('../../../../utils/auto-seo');

const SEO_FIELDS = {
  nameFields: ['title'],
  bodyFields: ['_seo_extracted_text'],
};

// Cheap HTML → text extractor. Not perfect, but good enough for
// SEO-copy input. Removes <script> + <style> blocks entirely, then
// strips all remaining tags, collapses whitespace, caps to 4000 chars
// (matches the auto-seo cap).
function extractText(html) {
  if (typeof html !== 'string') return '';
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 4000);
}

function pathsFor(entry) {
  const paths = ['/'];
  if (entry?.slug) paths.push(`/campaigns/${entry.slug}`);
  return paths;
}

// Inject a plain-text version of raw_html onto the event.result so
// auto-seo's bodyFields lookup finds real content instead of markup.
function withExtractedText(event) {
  const result = event?.result;
  if (result && typeof result === 'object' && result.raw_html) {
    result._seo_extracted_text = extractText(result.raw_html);
  }
  return event;
}

module.exports = {
  async afterCreate(event) {
    autoSeo.runAfter(withExtractedText(event), 'api::custom-html-landing.custom-html-landing', SEO_FIELDS);
    await notifyRevalidate(strapi, pathsFor(event.result));
  },
  async afterUpdate(event) {
    autoSeo.runAfter(withExtractedText(event), 'api::custom-html-landing.custom-html-landing', SEO_FIELDS);
    await notifyRevalidate(strapi, pathsFor(event.result));
  },
  async afterDelete(event) {
    await notifyRevalidate(strapi, pathsFor(event.result));
  },
};
