/**
 * BlocksRenderer — renders Strapi v5 blocks JSON into semantic HTML.
 *
 * Shape reference: each block is
 *   { type: 'paragraph' | 'heading' | 'list' | 'quote' | 'image' | 'code',
 *     level?: 1|2|3|4|5|6,   (heading only)
 *     format?: 'ordered' | 'unordered',   (list only)
 *     image?: { url, alternativeText, width, height },   (image only)
 *     children: TextNode[] | Block[] }
 * A TextNode is { type: 'text', text: string, bold?, italic?, underline?,
 *   strikethrough?, code? } or { type: 'link', url, children: TextNode[] }.
 *
 * We accept two things:
 *   1. Real blocks JSON (array of block objects) — modern editor output.
 *   2. Plain-text fallback string — for the tiny window BEFORE the
 *      migration seed runs on the CMS, and for any legacy article that
 *      slipped through. Rendered as one paragraph per double-newline.
 */

import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Block = any;

type Props = {
  content: Block[] | string | null | undefined;
};

function renderInline(children: Block[] | undefined, keyPrefix = 'i'): React.ReactNode[] {
  if (!Array.isArray(children)) return [];
  return children.map((c, i) => {
    const key = `${keyPrefix}-${i}`;
    if (c?.type === 'link') {
      return (
        <a key={key} href={c.url} target={c.url?.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
          {renderInline(c.children, `${key}c`)}
        </a>
      );
    }
    // Default: text node
    let node: React.ReactNode = c?.text ?? '';
    if (c?.code) node = <code key={key}>{node}</code>;
    if (c?.strikethrough) node = <s>{node}</s>;
    if (c?.underline) node = <u>{node}</u>;
    if (c?.italic) node = <em>{node}</em>;
    if (c?.bold) node = <strong>{node}</strong>;
    return <React.Fragment key={key}>{node}</React.Fragment>;
  });
}

function renderBlock(block: Block, index: number): React.ReactNode {
  if (!block || typeof block !== 'object') return null;
  const key = `b-${index}`;
  const inline = () => renderInline(block.children, key);

  switch (block.type) {
    case 'heading': {
      const level = Math.min(6, Math.max(1, Number(block.level) || 2));
      const Tag = (`h${level}`) as keyof React.JSX.IntrinsicElements;
      return <Tag key={key}>{inline()}</Tag>;
    }
    case 'list': {
      const ListTag = block.format === 'ordered' ? 'ol' : 'ul';
      const items = Array.isArray(block.children) ? block.children : [];
      return (
        <ListTag key={key}>
          {items.map((li: Block, i: number) => (
            <li key={`${key}-${i}`}>{renderInline(li?.children, `${key}-${i}c`)}</li>
          ))}
        </ListTag>
      );
    }
    case 'quote':
      return <blockquote key={key}>{inline()}</blockquote>;
    case 'code':
      return (
        <pre key={key}>
          <code>{inline()}</code>
        </pre>
      );
    case 'image': {
      const img = block.image || {};
      const src = img.url;
      if (!src) return null;
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={key}
          src={src}
          alt={img.alternativeText || ''}
          loading="lazy"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      );
    }
    case 'paragraph':
    default:
      return <p key={key}>{inline()}</p>;
  }
}

// Parse inline markdown ([text](url), **bold**, *italic*, single \n as <br>)
// into JSX. Deliberately narrow: only the syntax Anna actually uses in the
// Strapi richtext editor. Output is JSX so unmatched patterns just render as
// text — no dangerouslySetInnerHTML, no XSS surface.
//
// Precedence: links first (they can contain formatted text? we keep it flat),
// then **bold**, then *italic*. We tokenise sequentially with regex.
function parseInlineMarkdown(text: string, keyPrefix = 'md'): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Split on \n so we can insert <br /> between soft-broken lines within a paragraph.
  const lines = text.split('\n');
  lines.forEach((line, li) => {
    // Regex captures links first, then bold, then italic. Order matters —
    // we try longer/greedier patterns before shorter overlapping ones.
    const pattern = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_/g;
    let lastIndex = 0;
    let m: RegExpExecArray | null;
    let idx = 0;
    while ((m = pattern.exec(line)) !== null) {
      if (m.index > lastIndex) {
        nodes.push(line.slice(lastIndex, m.index));
      }
      const key = `${keyPrefix}-${li}-${idx++}`;
      if (m[1] && m[2]) {
        // Link
        const url = m[2];
        const external = /^https?:\/\//i.test(url);
        nodes.push(
          <a key={key} href={url} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
            {m[1]}
          </a>
        );
      } else if (m[3] || m[4]) {
        nodes.push(<strong key={key}>{m[3] || m[4]}</strong>);
      } else if (m[5] || m[6]) {
        nodes.push(<em key={key}>{m[5] || m[6]}</em>);
      }
      lastIndex = m.index + m[0].length;
    }
    if (lastIndex < line.length) {
      nodes.push(line.slice(lastIndex));
    }
    // Soft line break between lines within a paragraph (but not after the last line).
    if (li < lines.length - 1) {
      nodes.push(<br key={`${keyPrefix}-${li}-br`} />);
    }
  });
  return nodes;
}

export default function BlocksRenderer({ content }: Props) {
  // Markdown-source path — Strapi richtext stores content as a markdown
  // string. Split into paragraphs on blank lines, parse inline markdown
  // (links, bold, italic, soft breaks) within each. Anna types [text](url)
  // in the editor and it renders as a real hyperlink.
  if (typeof content === 'string') {
    const paragraphs = content.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
    return (
      <>
        {paragraphs.map((p, i) => {
          // Handle a couple of block-level markdown patterns too:
          //   ## Heading → <h2>
          //   - list item / * list item → <ul><li>
          //   > quote → <blockquote>
          const headingMatch = /^(#{1,6})\s+(.+)$/.exec(p);
          if (headingMatch && !p.includes('\n')) {
            const level = Math.min(6, headingMatch[1].length);
            const Tag = (`h${level}`) as keyof React.JSX.IntrinsicElements;
            return <Tag key={i}>{parseInlineMarkdown(headingMatch[2], `h${i}`)}</Tag>;
          }
          const lines = p.split('\n');
          const isList = lines.every((l) => /^\s*[-*]\s+/.test(l));
          if (isList && lines.length > 0) {
            return (
              <ul key={i}>
                {lines.map((l, j) => (
                  <li key={j}>{parseInlineMarkdown(l.replace(/^\s*[-*]\s+/, ''), `l${i}-${j}`)}</li>
                ))}
              </ul>
            );
          }
          const isOrdered = lines.every((l) => /^\s*\d+\.\s+/.test(l));
          if (isOrdered && lines.length > 0) {
            return (
              <ol key={i}>
                {lines.map((l, j) => (
                  <li key={j}>{parseInlineMarkdown(l.replace(/^\s*\d+\.\s+/, ''), `ol${i}-${j}`)}</li>
                ))}
              </ol>
            );
          }
          if (lines.every((l) => l.startsWith('>'))) {
            const stripped = lines.map((l) => l.replace(/^>\s?/, '')).join('\n');
            return <blockquote key={i}>{parseInlineMarkdown(stripped, `q${i}`)}</blockquote>;
          }
          return <p key={i}>{parseInlineMarkdown(p, `p${i}`)}</p>;
        })}
      </>
    );
  }
  if (!Array.isArray(content) || content.length === 0) return null;
  return <>{content.map((b, i) => renderBlock(b, i))}</>;
}

/**
 * Extract plain text from a blocks tree — used by SEO preview cards,
 * excerpt generation, and the auto-SEO Claude prompt.
 */
export function blocksToPlainText(content: Block[] | string | null | undefined): string {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  const walk = (nodes: Block[]): string =>
    nodes
      .map((n) => {
        if (!n) return '';
        if (typeof n.text === 'string') return n.text;
        if (Array.isArray(n.children)) return walk(n.children);
        return '';
      })
      .join('');
  return content
    .map((b) => walk(Array.isArray(b?.children) ? b.children : []))
    .filter(Boolean)
    .join('\n\n')
    .trim();
}
