import { Fragment } from 'react';

/**
 * Render an assistant message with markdown-style links rendered as
 * real anchors.
 *
 * AskAnna's system prompt instructs Claude to use markdown link syntax
 * (`[text](url)`) when quoting URLs returned by the search_* tools.
 * Without this helper the chat surfaces would emit `[label](url)` as
 * raw text — the brackets and parens would be visible.
 *
 * Robust to:
 *   - whitespace between `]` and `(` (Claude occasionally inserts a
 *     line break when the link is long — happens mid-stream)
 *   - leading/trailing whitespace inside the URL parens
 *   - the regex's `lastIndex` state — fresh regex per call instead of
 *     a module-level const, so concurrent React renders don't collide
 *   - non-link content (just emits paragraphs of text)
 *
 * Deliberately small — no markdown library, no HTML evaluation. Only
 * links are linkified; bold/italic/lists pass through as plain text.
 */

interface Props {
  content: string;
  paragraphClassName?: string;
  linkColour?: string;
}

export function RenderedMessage({ content, paragraphClassName, linkColour }: Props) {
  if (!content) return null;
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      {paragraphs.map((para, pIdx) => (
        <p key={pIdx} className={paragraphClassName}>
          {renderInline(para, linkColour)}
        </p>
      ))}
    </>
  );
}

function renderInline(text: string, linkColour?: string): React.ReactNode[] {
  // Fresh regex per call — `lastIndex` state on a shared global regex
  // can get out-of-sync under React concurrent rendering and silently
  // skip matches. New instance = clean slate.
  //
  // Tolerates whitespace (incl. newline) between `]` and `(`, and
  // around the URL itself. Matches absolute http(s) URLs and root-
  // relative paths starting with `/`.
  const linkRe = /\[([^\]]+?)\]\s*\(\s*(https?:\/\/[^\s)]+|\/[^\s)]*)\s*\)/g;
  const out: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRe.exec(text)) !== null) {
    const [whole, label, href] = match;
    const start = match.index;
    if (start > lastIdx) {
      out.push(<Fragment key={`t-${lastIdx}`}>{text.slice(lastIdx, start)}</Fragment>);
    }
    const isExternal = href.startsWith('http');
    out.push(
      <a
        key={`l-${start}`}
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noreferrer' : undefined}
        style={{
          color: linkColour || 'inherit',
          textDecoration: 'underline',
          fontWeight: 500,
        }}
      >
        {label}
      </a>,
    );
    lastIdx = start + whole.length;
  }
  if (lastIdx < text.length) {
    out.push(<Fragment key={`t-${lastIdx}`}>{text.slice(lastIdx)}</Fragment>);
  }
  // If no links matched, return the original text as a single node so
  // React doesn't render an empty array (which would look like nothing).
  return out.length > 0 ? out : [<Fragment key="raw">{text}</Fragment>];
}
