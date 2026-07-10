/**
 * Trim an article body to a paywall-preview length.
 *
 * Accepts EITHER the legacy plain-text string OR the modern Strapi blocks
 * array (v5 blocks field). Returns the same shape it was given so the
 * caller can hand the result to BlocksRenderer without branching.
 *
 * Strategy:
 * - Keep first N paragraph-shaped blocks OR first ~maxWords, whichever ends first
 * - Always end on a complete paragraph (no mid-sentence cut)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BlocksBody = any[];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BlockNode = any;

function paragraphWordCount(block: BlockNode): number {
  if (!block) return 0;
  const walk = (nodes: BlockNode[]): string =>
    nodes
      .map((n) => (typeof n?.text === 'string' ? n.text : Array.isArray(n?.children) ? walk(n.children) : ''))
      .join(' ');
  return walk(Array.isArray(block.children) ? block.children : [])
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function previewBody(
  body: string | BlocksBody | null | undefined,
  opts: { maxParagraphs?: number; maxWords?: number } = {},
): string | BlocksBody {
  const maxParagraphs = opts.maxParagraphs ?? 4;
  const maxWords = opts.maxWords ?? 180;

  // Legacy string path.
  if (typeof body === 'string') {
    if (!body) return '';
    const paragraphs = body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
    const kept: string[] = [];
    let wordCount = 0;
    for (const p of paragraphs.slice(0, maxParagraphs)) {
      const w = p.split(/\s+/).length;
      if (kept.length === 0 || wordCount + w <= maxWords) {
        kept.push(p);
        wordCount += w;
      } else {
        break;
      }
    }
    return kept.join('\n\n');
  }

  // Blocks path.
  if (!Array.isArray(body) || body.length === 0) return [];
  const kept: BlocksBody = [];
  let wordCount = 0;
  let paragraphsSeen = 0;
  for (const block of body) {
    if (paragraphsSeen >= maxParagraphs) break;
    const w = paragraphWordCount(block);
    if (kept.length === 0 || wordCount + w <= maxWords) {
      kept.push(block);
      wordCount += w;
      paragraphsSeen++;
    } else {
      break;
    }
  }
  return kept;
}
