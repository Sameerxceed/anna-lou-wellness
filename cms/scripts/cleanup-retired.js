/**
 * Cleanup retired Sparkle / Crystal Clear / kids+teen content from Strapi
 * Per ALW_SERVICES_FINAL_Sameer.docx (12 May 2026):
 *   - Sparkle naming retired entirely
 *   - Crystal Clear Collective retired
 *   - Crystal Vortex retired
 *   - Personalised Jewellery Mentorship → moved to annalouoflondon.com
 *   - Crystal Wellbeing Gatherings (teens) → moved to annalouoflondon.com
 *   - Crystal Magic Party (kids) → moved to annalouoflondon.com
 *
 * Run: node cms/scripts/cleanup-retired.js
 */

const STRAPI_URL = process.env.STRAPI_URL || 'https://cms.annalouwellness.com';
const API_TOKEN = process.env.STRAPI_TOKEN || '450ab5b5f933cd11b040324a85a9ae9622f671278bbb087ca24362c231d346abbf718d8c7770e32a141f03c055f03d8a87c4abd05a351fd443655b7f6a4bb270b9397aa4e3514fa3a693d133672c2846753c36cd677f80f3abdbd85ef76fc9fb12ca69c8b59671ec47af41bd7140816982d706160e4a1a1477a778c9af9db299';

// Slugs to remove (matched in seed-content.js) — products
const RETIRED_PRODUCT_SLUGS = [
  'sparkle-mastery-programme',
  'level-up-and-sparkle',
  'level-up-and-sparkle-corporate-mini-retreat',
  'crystal-wellbeing-gatherings-teens',
  'crystal-magic-party',
  'personalised-jewellery-business-mentorship',
];

// Slugs to remove — experiences/workshops
const RETIRED_EXPERIENCE_SLUGS = [
  'crystal-clear-business-vortex',
  'free-crystal-healing',
  'corporate-level-up-sparkle',
];

async function api(endpoint, method = 'GET', body = null) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_TOKEN}`,
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${STRAPI_URL}/api${endpoint}`, opts);
  const text = await res.text();
  try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
  catch { return { ok: res.ok, status: res.status, data: text }; }
}

async function deleteByDocumentId(collection, documentId, label) {
  const r = await api(`/${collection}/${documentId}`, 'DELETE');
  if (r.ok) console.log(`  [deleted] ${label}`);
  else console.log(`  [error] ${label}: ${r.status} ${JSON.stringify(r.data).slice(0,150)}`);
}

async function findAndDelete(collection, slugs) {
  console.log(`\n--- ${collection} ---`);
  for (const slug of slugs) {
    const r = await api(`/${collection}?filters[slug][$eq]=${encodeURIComponent(slug)}`);
    if (!r.ok || !r.data?.data?.length) {
      console.log(`  [not found] ${slug}`);
      continue;
    }
    for (const item of r.data.data) {
      await deleteByDocumentId(collection, item.documentId, `${slug} (${item.name || item.title})`);
    }
  }
}

async function main() {
  console.log('\n=== Anna Lou Wellness — Retired Content Cleanup ===\n');
  console.log(`Strapi: ${STRAPI_URL}\n`);

  await findAndDelete('products', RETIRED_PRODUCT_SLUGS);
  await findAndDelete('experiences', RETIRED_EXPERIENCE_SLUGS);

  console.log('\n=== Cleanup Complete ===\n');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
