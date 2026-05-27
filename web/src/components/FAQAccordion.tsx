import { FAQSchema } from './StructuredData';
import type { FAQ } from '@/lib/cms';

interface FAQAccordionProps {
  faqs: FAQ[];
  kicker?: string;
  title?: string;
  accentColour?: string;
  background?: string;
}

/**
 * Reusable FAQ accordion + JSON-LD schema, dropped in as a sibling section
 * after the main page component. Returns null when there are no FAQs so
 * pages stay clean before Anna populates them in Strapi.
 */
export default function FAQAccordion({
  faqs,
  kicker = 'Questions',
  title = 'Frequently Asked',
  accentColour = '#F280AA',
  background = '#fff',
}: FAQAccordionProps) {
  if (!faqs || faqs.length === 0) return null;
  return (
    <>
      <FAQSchema faqs={faqs} />
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <section className="faq-acc" style={{ background }}>
        <div className="faq-acc-inner">
          <p className="faq-acc-kicker" style={{ color: accentColour }}>{kicker}</p>
          <h2 className="faq-acc-title">{title}</h2>
          <div className="faq-acc-list">
            {faqs.map(faq => (
              <details key={faq.id} className="faq-acc-item">
                <summary className="faq-acc-q" style={{ ['--faq-accent' as string]: accentColour }}>{faq.question}</summary>
                <div className="faq-acc-a" dangerouslySetInnerHTML={{ __html: renderAnswer(faq.answer) }} />
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function renderAnswer(raw: string): string {
  if (!raw) return '';
  const escaped = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const linked = escaped.replace(
    /\[([^\]]+)\]\s*\(([^)]+)\)/g,
    (_m, label, href) => `<a href="${href}">${label}</a>`,
  );
  return linked
    .split(/\n{2,}/)
    .map(p => `<p>${p.replace(/\n/g, '<br />')}</p>`)
    .join('');
}

const styles = `
.faq-acc { padding: 2.5rem 2rem; }
.faq-acc-inner { max-width: 820px; margin: 0 auto; text-align: center; }
.faq-acc-kicker { font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.65rem; letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 0.5rem; }
.faq-acc-title { font-family: 'Work Sans', 'Helvetica Neue', sans-serif; font-weight: 300; font-size: clamp(1.6rem, 3.5vw, 2.2rem); color: #231F20; letter-spacing: 0.03em; margin-bottom: 1.5rem; }
.faq-acc-list { text-align: left; }
.faq-acc-item { border-bottom: 1px solid rgba(0,0,0,0.08); padding: 0.2rem 0; }
.faq-acc-item:last-child { border-bottom: none; }
.faq-acc-q { font-family: 'Work Sans', 'Helvetica Neue', sans-serif; font-weight: 400; font-size: 1rem; color: #231F20; padding: 1rem 0; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
.faq-acc-q::after { content: '+'; color: var(--faq-accent, #F280AA); font-size: 1.4rem; font-weight: 300; line-height: 1; }
.faq-acc-item[open] .faq-acc-q::after { content: '−'; }
.faq-acc-a { font-family: 'EB Garamond', Georgia, serif; font-size: 1rem; color: #3D3D3A; line-height: 1.8; padding: 0 0 1.2rem; }
.faq-acc-a p { margin: 0 0 0.8rem; }
.faq-acc-a p:last-child { margin-bottom: 0; }
.faq-acc-a a { color: #6E3A5A; border-bottom: 1px solid currentColor; text-decoration: none; }
.faq-acc-a a:hover { opacity: 0.75; }
@media (max-width: 640px) { .faq-acc { padding: 2rem 1.2rem; } }
`;
