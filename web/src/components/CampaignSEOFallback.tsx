import { extractTextFromHtml } from '@/lib/extract-text';

/**
 * CampaignSEOFallback — renders a server-side plain-text copy of a
 * Custom HTML Landing's body so crawlers (Googlebot, GPTBot, ClaudeBot,
 * PerplexityBot, etc.) can read the content.
 *
 * Why: CampaignFrame hosts the raw HTML in a sandbox iframe (srcDoc).
 * Browsers render it beautifully, but crawlers do not step inside
 * iframes. Before this component, Big Exhale, Feral and Free and
 * Reset Letters were effectively a title + a hero line to anything
 * reading the HTML directly.
 *
 * The content here is IDENTICAL to what is in the iframe — just a
 * second rendering. Google's own guidance says this is fine: 'If the
 * iframe content is critical, provide it as text in the main page too.'
 *
 * Visually hidden with the standard screen-reader pattern (not
 * display:none, which some crawlers skip). The block sits in the
 * normal document flow, zero height, zero width, clipped. Perfectly
 * readable to any HTML parser.
 */
interface Props {
  rawHtml: string;
  heading: string;
}

export default function CampaignSEOFallback({ rawHtml, heading }: Props) {
  const { text, headings } = extractTextFromHtml(rawHtml);
  if (!text) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'normal',
        border: 0,
      }}
    >
      <h2>{heading}</h2>
      {headings.length > 0 && (
        <ul>
          {headings.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      )}
      {text.split('\n').map((line, i) => (
        <p key={i}>{line}</p>
      ))}
    </div>
  );
}
