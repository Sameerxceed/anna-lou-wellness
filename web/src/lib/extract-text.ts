/**
 * Strip tags from raw HTML and return a clean plain-text + heading-list
 * representation suitable for an SEO fallback block.
 *
 * Context: Custom HTML Landing pages (Big Exhale, Feral and Free, Reset
 * Letters) are rendered inside a sandboxed iframe (srcDoc). The iframe
 * body is NOT part of the parent page's DOM, so search engines and AI
 * crawlers only see the hero line and a bare iframe tag. Everything
 * useful (dates, price, inclusions, body copy) is invisible to them.
 *
 * The fix: at render time, strip the raw HTML to its visible text, emit
 * it in a hidden-but-crawlable block on the parent page. Not cloaking —
 * same content, just a second rendering so robots can read it.
 */

const BLOCK_TAGS = new Set([
  'p', 'div', 'section', 'article', 'header', 'footer', 'main',
  'nav', 'aside', 'blockquote', 'li', 'tr', 'td', 'th', 'br',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
]);

interface ExtractedText {
  text: string;
  headings: string[];
}

export function extractTextFromHtml(raw: string): ExtractedText {
  if (!raw) return { text: '', headings: [] };

  const headings: string[] = [];
  // Capture heading content before stripping tags so we can emit them
  // explicitly (crawlers weight headings heavily).
  const headingRe = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = headingRe.exec(raw)) !== null) {
    const text = m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (text) headings.push(text);
  }

  let out = raw;
  out = out.replace(/<!--[\s\S]*?-->/g, '');
  out = out.replace(/<(script|style|noscript|template)[\s\S]*?<\/\1>/gi, '');

  out = out.replace(/<(\/?)(\w+)[^>]*>/g, (_full, close: string, tag: string) => {
    const t = tag.toLowerCase();
    if (BLOCK_TAGS.has(t)) return close ? '\n' : '\n';
    return '';
  });

  const decoded = out
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_m, n) => String.fromCharCode(Number(n)))
    .replace(/&[a-z]+;/gi, ' ');

  const text = decoded
    .split(/\n+/)
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');

  return { text, headings };
}
