/**
 * Trim an article body to a paywall-preview length.
 *
 * Strategy:
 * - Keep first N paragraphs OR first ~maxWords (whichever ends first)
 * - Always end on a complete paragraph (no mid-sentence cut)
 *
 * Returns the preview body. Empty input → empty string.
 */
export function previewBody(body: string, opts: { maxParagraphs?: number; maxWords?: number } = {}): string {
  const maxParagraphs = opts.maxParagraphs ?? 4;
  const maxWords = opts.maxWords ?? 180;

  if (!body) return '';
  const paragraphs = body.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);

  let kept: string[] = [];
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
