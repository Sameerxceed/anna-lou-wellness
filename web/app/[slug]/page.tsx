import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchAPI, mediaUrl } from '@/lib/strapi';

/**
 * Catch-all standalone-page route.
 *
 * Resolves any URL like /mission, /cookies, /about-anywhere by looking
 * up the slug in the `generic-page` (Strapi: "Pages · Standalone")
 * collection. Anna creates an entry with slug `mission` → page lives
 * at /mission with no code change. Footer links + nav can point to
 * the same slug.
 *
 * Next.js route precedence: explicit folder/page.tsx wins over this
 * dynamic [slug]/page.tsx. So /about, /shop, /contact etc. still hit
 * their dedicated pages — this only catches the leftovers.
 *
 * If no generic-page exists for the slug, falls back to the 404 page
 * (so a typoed footer href is loud, not silent).
 */

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Strapi 5 "blocks" editor stores content as an array of block nodes.
// Each block has a `type` ('paragraph' | 'heading' | 'list' | 'quote' | 'code' | 'image')
// and `children`. Text leaves carry inline marks (bold, italic, underline, etc.).
type BlocksLeaf = { type: 'text'; text: string; bold?: boolean; italic?: boolean; underline?: boolean; strikethrough?: boolean; code?: boolean };
type BlocksLink = { type: 'link'; url: string; children: BlocksLeaf[] };
type BlocksChild = BlocksLeaf | BlocksLink;
type BlocksNode =
  | { type: 'paragraph'; children: BlocksChild[] }
  | { type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; children: BlocksChild[] }
  | { type: 'list'; format: 'ordered' | 'unordered'; children: { type: 'list-item'; children: BlocksChild[] }[] }
  | { type: 'quote'; children: BlocksChild[] }
  | { type: 'code'; children: BlocksLeaf[] }
  | { type: 'image'; image: { url: string; alternativeText?: string } };

interface GenericPageData {
  title: string;
  slug: string;
  kicker: string;
  kickerColour: string;
  tagline: string;
  heroImage: string;
  intro: BlocksNode[] | string;
  ctaLabel: string;
  ctaUrl: string;
  seoTitle: string;
  seoDescription: string;
}

async function getGenericPage(slug: string): Promise<GenericPageData | null> {
  try {
    const { data } = await fetchAPI('/generic-pages', {
      'populate': '*',
      'filters[slug][$eq]': slug,
      'pagination[limit]': '1',
    });
    if (!Array.isArray(data) || data.length === 0) return null;
    const d = data[0];
    return {
      title: d.title || '',
      slug: d.slug || slug,
      kicker: d.kicker || '',
      kickerColour: d.kickerColour || '#6E3A5A',
      tagline: d.tagline || '',
      heroImage: mediaUrl(d.heroImage),
      intro: d.intro ?? '',
      ctaLabel: d.ctaLabel || '',
      ctaUrl: d.ctaUrl || '',
      seoTitle: d.seoTitle || '',
      seoDescription: d.seoDescription || '',
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getGenericPage(slug);
  if (!page) return { title: 'Page not found' };
  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || page.tagline || '',
    alternates: { canonical: `/${slug}` },
  };
}

export default async function StandalonePage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getGenericPage(slug);
  if (!page) notFound();

  // `intro` is blocks JSON for new entries, plain markdown string for legacy
  // entries created before the schema switch. Render either correctly.
  const bodyHtml = Array.isArray(page.intro)
    ? renderBlocks(page.intro)
    : renderMarkdown(page.intro);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <section className="gp-hero" style={page.heroImage ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.55),rgba(0,0,0,0.55)), url('${page.heroImage}')` } : undefined}>
        <div className="gp-hero-inner">
          {page.kicker && (
            <p className="gp-kicker" style={{ color: page.kickerColour }}>{page.kicker}</p>
          )}
          <h1 className="gp-title">{page.title}</h1>
          {page.tagline && <p className="gp-tagline"><em>{page.tagline}</em></p>}
        </div>
      </section>

      <section className="gp-body">
        <div className="gp-body-inner gp-prose" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
        {page.ctaLabel && page.ctaUrl && (
          <div className="gp-body-inner gp-cta">
            <Link href={page.ctaUrl} className="gp-cta-btn" style={{ background: page.kickerColour, borderColor: page.kickerColour }}>
              {page.ctaLabel} <span>&rarr;</span>
            </Link>
          </div>
        )}
      </section>
    </>
  );
}

/**
 * Render Strapi 5 "blocks" JSON to HTML. The blocks editor produces this
 * structure when Anna pastes from Word / Google Docs / formats via toolbar.
 * Handles paragraphs, headings (h1–h6), bullet + numbered lists, blockquotes,
 * links, and inline marks (bold, italic, underline, strikethrough, code).
 */
function renderBlocks(blocks: BlocksNode[]): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const renderLeaf = (leaf: BlocksLeaf): string => {
    let out = esc(leaf.text || '');
    if (leaf.code) out = `<code>${out}</code>`;
    if (leaf.bold) out = `<strong>${out}</strong>`;
    if (leaf.italic) out = `<em>${out}</em>`;
    if (leaf.underline) out = `<u>${out}</u>`;
    if (leaf.strikethrough) out = `<s>${out}</s>`;
    return out;
  };
  const renderChildren = (children: BlocksChild[]): string =>
    (children || []).map((c) => {
      if ((c as BlocksLink).type === 'link') {
        const link = c as BlocksLink;
        const inner = (link.children || []).map(renderLeaf).join('');
        return `<a href="${esc(link.url)}">${inner}</a>`;
      }
      return renderLeaf(c as BlocksLeaf);
    }).join('');

  return blocks.map((block): string => {
    switch (block.type) {
      case 'heading': {
        const lvl = Math.min(Math.max(block.level || 2, 1), 6);
        const cls = lvl <= 3 ? `gp-h${lvl}` : 'gp-h3';
        return `<h${lvl} class="${cls}">${renderChildren(block.children)}</h${lvl}>`;
      }
      case 'list': {
        const tag = block.format === 'ordered' ? 'ol' : 'ul';
        const items = (block.children || []).map((li) => `<li>${renderChildren(li.children)}</li>`).join('');
        return `<${tag} class="gp-list">${items}</${tag}>`;
      }
      case 'quote':
        return `<blockquote class="gp-quote">${renderChildren(block.children)}</blockquote>`;
      case 'code': {
        const txt = (block.children || []).map((c) => esc(c.text || '')).join('');
        return `<pre class="gp-code"><code>${txt}</code></pre>`;
      }
      case 'image':
        if (!block.image?.url) return '';
        return `<img class="gp-img" src="${esc(block.image.url)}" alt="${esc(block.image.alternativeText || '')}" />`;
      case 'paragraph':
      default:
        return `<p class="gp-paragraph">${renderChildren((block as any).children)}</p>`;
    }
  }).join('\n');
}

/**
 * Legacy markdown renderer for `intro` entries that were saved before the
 * schema switched from richtext to blocks. Kept as a fallback so old data
 * still displays correctly. New entries use renderBlocks above.
 */
function renderMarkdown(raw: string): string {
  if (!raw) return '';
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Inline transforms: applied per line. Order matters — links first, then bold, then italic.
  const inline = (s: string): string =>
    esc(s)
      .replace(/\[([^\]]+)\]\s*\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,!?:;]|$)/g, '$1<em>$2</em>');

  const blocks = raw.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const html: string[] = [];

  for (const block of blocks) {
    const lines = block.split('\n');

    // Headings — single line block starting with 1-3 # plus space
    const h = lines[0].match(/^(#{1,3})\s+(.*)$/);
    if (h && lines.length === 1) {
      const level = h[1].length;
      html.push(`<h${level} class="gp-h${level}">${inline(h[2])}</h${level}>`);
      continue;
    }

    // Blockquote — every line starts with >
    if (lines.every((l) => /^>\s?/.test(l))) {
      const inner = lines.map((l) => inline(l.replace(/^>\s?/, ''))).join('<br />');
      html.push(`<blockquote class="gp-quote">${inner}</blockquote>`);
      continue;
    }

    // Unordered list — every line starts with - or *
    if (lines.every((l) => /^[-*]\s+/.test(l))) {
      const items = lines.map((l) => `<li>${inline(l.replace(/^[-*]\s+/, ''))}</li>`).join('');
      html.push(`<ul class="gp-list">${items}</ul>`);
      continue;
    }

    // Ordered list — every line starts with N.
    if (lines.every((l) => /^\d+\.\s+/.test(l))) {
      const items = lines.map((l) => `<li>${inline(l.replace(/^\d+\.\s+/, ''))}</li>`).join('');
      html.push(`<ol class="gp-list">${items}</ol>`);
      continue;
    }

    // Otherwise — paragraph. Hard line breaks within the block become <br />.
    html.push(`<p class="gp-paragraph">${lines.map(inline).join('<br />')}</p>`);
  }

  return html.join('\n');
}

const pageStyles = `
.gp-hero { background:#F5F3EF; padding:3.5rem 2rem 2.5rem; text-align:center; background-size:cover; background-position:center; color:#231F20; }
.gp-hero[style*="url("] { color:#fff; }
.gp-hero[style*="url("] .gp-title, .gp-hero[style*="url("] .gp-tagline { color:#fff; }
.gp-hero-inner { max-width:880px; margin:0 auto; }
.gp-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.65rem; letter-spacing:0.2em; text-transform:uppercase; margin-bottom:0.5rem; }
.gp-title { font-family:'EB Garamond',Georgia,serif; font-weight:400; font-size:clamp(2.2rem,5vw,3.4rem); line-height:1.2; margin-bottom:0.8rem; text-wrap:balance; }
.gp-tagline { font-family:'EB Garamond',Georgia,serif; font-style:italic; font-size:1.1rem; color:#5D5A52; line-height:1.7; }
.gp-body { background:#fff; padding:2.5rem 2rem 3.5rem; }
.gp-body-inner { max-width:900px; margin:0 auto; }
.gp-prose .gp-paragraph { font-family:'EB Garamond',Georgia,serif; font-size:1.05rem; color:#3D3D3A; line-height:1.9; margin-bottom:1.2rem; }
.gp-prose .gp-paragraph:last-child { margin-bottom:0; }
.gp-prose .gp-h1 { font-family:'EB Garamond',Georgia,serif; font-weight:500; font-size:clamp(1.6rem,3vw,2rem); color:#231F20; line-height:1.3; margin:2rem 0 0.8rem; }
.gp-prose .gp-h2 { font-family:'EB Garamond',Georgia,serif; font-weight:500; font-size:clamp(1.35rem,2.4vw,1.6rem); color:#231F20; line-height:1.3; margin:1.8rem 0 0.7rem; }
.gp-prose .gp-h3 { font-family:Mulish,sans-serif; font-weight:500; font-size:0.75rem; letter-spacing:0.18em; text-transform:uppercase; color:#6E3A5A; margin:1.5rem 0 0.6rem; }
.gp-prose .gp-h1:first-child, .gp-prose .gp-h2:first-child, .gp-prose .gp-h3:first-child { margin-top:0; }
.gp-prose .gp-list { font-family:'EB Garamond',Georgia,serif; font-size:1.05rem; color:#3D3D3A; line-height:1.85; margin:0 0 1.2rem 1.4rem; padding:0; }
.gp-prose .gp-list li { margin-bottom:0.4rem; }
.gp-prose .gp-quote { font-family:'EB Garamond',Georgia,serif; font-style:italic; font-size:1.1rem; color:#3D3D3A; line-height:1.7; border-left:3px solid #6E3A5A; padding:0.6rem 0 0.6rem 1.2rem; margin:1.5rem 0; }
.gp-prose .gp-img { max-width:100%; height:auto; display:block; margin:1.5rem auto; border-radius:6px; }
.gp-prose .gp-code { background:#F5F3EF; padding:1rem; border-radius:6px; overflow-x:auto; font-family:Menlo,Consolas,monospace; font-size:0.9rem; margin:1rem 0; }
.gp-prose u { text-decoration:underline; }
.gp-prose s { text-decoration:line-through; }
.gp-prose code { background:rgba(110,58,90,0.08); padding:0.1rem 0.35rem; border-radius:3px; font-family:Menlo,Consolas,monospace; font-size:0.92em; }
.gp-prose a { color:#6E3A5A; border-bottom:1px solid currentColor; text-decoration:none; }
.gp-prose a:hover { opacity:0.75; }
.gp-prose strong { font-weight:600; color:#231F20; }
.gp-prose em { font-style:italic; }
.gp-cta { text-align:center; margin-top:2rem; }
.gp-cta-btn { color:#fff; font-family:Mulish,sans-serif; font-weight:500; font-size:0.65rem; letter-spacing:0.14em; text-transform:uppercase; padding:0.85rem 2rem; border-radius:3px; border:1px solid; transition:opacity 0.25s; display:inline-flex; align-items:center; gap:0.4rem; text-decoration:none; }
.gp-cta-btn:hover { opacity:0.88; }
@media (max-width:700px) { .gp-hero { padding:2.5rem 1.2rem 1.8rem; } .gp-body { padding:2rem 1.2rem 2.5rem; } }
`;
