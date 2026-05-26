import { Fragment } from 'react';

/**
 * Render an assistant message with markdown-style links rendered as
 * real anchors.
 *
 * AskAnna's system prompt instructs Claude to use markdown link syntax
 * (`[text](url)`) when quoting URLs returned by the search_* tools.
 * The chat surfaces (AskAnnaClient + FloatingAskAnna) used to split on
 * \n and emit plain <p> tags, which left the [text](url) raw on screen.
 *
 * This helper splits paragraphs on blank lines, then within each
 * paragraph walks the text and replaces `[text](url)` with proper
 * anchors. External URLs get target="_blank" + rel="noreferrer".
 *
 * It's deliberately small — no markdown library, no risk of executing
 * untrusted HTML. Only links are linkified; bold/italic/lists pass
 * through as plain text (Claude rarely uses them in this context).
 */

const LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g;

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

function renderInline(text: string, linkColour?: string) {
  const out: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  // Reset regex state per call.
  LINK_RE.lastIndex = 0;
  while ((match = LINK_RE.exec(text)) !== null) {
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
        style={linkColour ? { color: linkColour, textDecoration: 'underline' } : { textDecoration: 'underline' }}
      >
        {label}
      </a>,
    );
    lastIdx = start + whole.length;
  }
  if (lastIdx < text.length) {
    out.push(<Fragment key={`t-${lastIdx}`}>{text.slice(lastIdx)}</Fragment>);
  }
  return out;
}
