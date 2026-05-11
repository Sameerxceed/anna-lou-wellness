/**
 * Seed Vol2 articles — fills empty categories with Anna's content from Vol2 doc
 * Run: node cms/scripts/seed-vol2.js
 */

const fs = require('fs');
const path = require('path');

const STRAPI_URL = process.env.STRAPI_URL || 'http://si0ji9oa9ur0i32dtapo4k0w.217.160.147.201.sslip.io';
const API_TOKEN = process.env.STRAPI_TOKEN || '450ab5b5f933cd11b040324a85a9ae9622f671278bbb087ca24362c231d346abbf718d8c7770e32a141f03c055f03d8a87c4abd05a351fd443655b7f6a4bb270b9397aa4e3514fa3a693d133672c2846753c36cd677f80f3abdbd85ef76fc9fb12ca69c8b59671ec47af41bd7140816982d706160e4a1a1477a778c9af9db299';

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
  return res.json();
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

function estimateReadTime(text) {
  const words = text.split(/\s+/).length;
  const mins = Math.ceil(words / 200);
  return `${mins} min read`;
}

async function findCategoryId(slug) {
  const res = await api(`/article-categories?filters[slug][$eq]=${encodeURIComponent(slug)}`);
  return res.data?.[0]?.id || null;
}

async function findOrCreateArticle(article) {
  const slug = slugify(article.title);
  const existing = await api(`/articles?filters[slug][$eq]=${encodeURIComponent(slug)}`);
  if (existing.data?.length > 0) {
    console.log(`  [skip] ${slug}`);
    return;
  }
  const catId = await findCategoryId(article.suggested_category_slug);
  if (!catId) {
    console.log(`  [warn] no category found for ${article.suggested_category_slug}, skipping ${slug}`);
    return;
  }
  const data = {
    title: article.title,
    slug,
    excerpt: article.excerpt || article.body.split('\n\n')[0].slice(0, 300),
    body: article.body,
    author: 'Anna Lou',
    reading_time: estimateReadTime(article.body),
    is_featured: false,
    is_free: true,
    category: catId,
  };
  const created = await api('/articles', 'POST', { data });
  if (created.data) console.log(`  [created] ${slug}`);
  else console.log(`  [error] ${slug}:`, JSON.stringify(created).slice(0, 200));
}

async function main() {
  console.log('\n=== Seeding Vol2 Articles ===\n');
  const jsonPath = path.join(__dirname, 'vol2-articles.json');
  const articles = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`Loaded ${articles.length} articles from vol2-articles.json\n`);

  for (const article of articles) {
    await findOrCreateArticle(article);
  }

  console.log('\n=== Vol2 Seed Complete ===\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
