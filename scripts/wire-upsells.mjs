/**
 * One-shot script: wires <UpsellBlockForSingleton /> into a list of
 * Next.js page.tsx files.
 *
 * For each (path, endpoint) pair:
 *   1. Inserts `import UpsellBlockForSingleton from '@/components/UpsellBlockForSingleton';`
 *      after the LAST existing import line — only if missing.
 *   2. Inserts `<UpsellBlockForSingleton endpoint="..." />` immediately
 *      before the page's outermost closing fragment `</>` — only if
 *      no UpsellBlock(...ForSingleton)? is already present.
 *
 * Skips files that already have the component. Logs every action.
 *
 * Run from repo root:
 *   node scripts/wire-upsells.mjs
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\//, ''), '..');

const PAGES = [
  ['web/app/about/page.tsx', '/about-page'],
  ['web/app/contact/page.tsx', '/contact-page'],
  ['web/app/community/page.tsx', '/community-page'],
  ['web/app/reset-letters/page.tsx', '/reset-letters-page'],
  ['web/app/experiences/page.tsx', '/experiences-landing-page'],
  ['web/app/the-work/page.tsx', '/work-with-anna-page'],
  ['web/app/the-work/sessions/page.tsx', '/sessions-hub-page'],
  ['web/app/community/membership/page.tsx', '/membership-page'],
  ['web/app/free/nervous-system-decoder/page.tsx', '/decoder-page'],
  ['web/app/testimonials/page.tsx', '/testimonials-page'],
  ['web/app/shop/page.tsx', '/shop-page'],
  ['web/app/community/the-returning-circle/page.tsx', '/community-event-page'],
];

const IMPORT_LINE = "import UpsellBlockForSingleton from '@/components/UpsellBlockForSingleton';";

function wire(file, endpoint) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) return { file, action: 'missing' };
  let src = fs.readFileSync(full, 'utf8');
  if (src.includes('UpsellBlock')) return { file, action: 'already has UpsellBlock' };

  // 1. Add import. Find last import line and insert after it.
  const importRe = /^import .+;$/gm;
  let lastImportEnd = 0;
  let m;
  while ((m = importRe.exec(src)) !== null) {
    lastImportEnd = m.index + m[0].length;
  }
  if (lastImportEnd === 0) return { file, action: 'no imports found' };
  src = src.slice(0, lastImportEnd) + '\n' + IMPORT_LINE + src.slice(lastImportEnd);

  // 2. Add JSX. Find the outermost closing fragment `</>` followed by `);`.
  // Match the LAST occurrence so we hit the page's outer return.
  const closingRe = /\n(\s*)<\/>(\s*\n\s*\);)/g;
  const matches = [...src.matchAll(closingRe)];
  if (matches.length === 0) return { file, action: 'no </> closing found' };
  const last = matches[matches.length - 1];
  const indent = last[1];
  const insertion = `\n${indent}<UpsellBlockForSingleton endpoint="${endpoint}" />\n${indent}</>${last[2]}`;
  src = src.slice(0, last.index) + insertion + src.slice(last.index + last[0].length);

  fs.writeFileSync(full, src, 'utf8');
  return { file, action: 'wired', endpoint };
}

const results = PAGES.map(([f, e]) => wire(f, e));
for (const r of results) {
  console.log(`${r.action.padEnd(28)} ${r.file}${r.endpoint ? ' -> ' + r.endpoint : ''}`);
}
