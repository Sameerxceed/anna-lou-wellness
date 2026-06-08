/**
 * PageSections — renders a Strapi Dynamic Zone of `sections.*` components
 * into HTML, with per-section style options applied.
 *
 * One renderer per supported section component. Unknown components fall
 * through to a tiny placeholder so Anna sees something instead of a blank
 * page if a new component is registered before its renderer ships.
 *
 * Style options come from `shared.section-style` and cover:
 *   - background_colour (hex)
 *   - text_colour (hex)
 *   - accent_colour (hex)
 *   - padding ('tight' | 'normal' | 'spacious')
 *   - alignment ('left' | 'center' | 'right')
 *   - max_width ('narrow' | 'medium' | 'wide' | 'full')
 *   - background_image (media)
 *   - background_image_overlay (0-80)
 *
 * Image-rich sections have their own first-class image fields (image,
 * image_left/right, hero image, etc.) — bg image is a separate, optional
 * layer behind the text.
 */

import Link from 'next/link';
import { mediaUrl } from '@/lib/strapi';

// ─── Types ────────────────────────────────────────────────────────────────

type Style = {
  background_colour?: string;
  text_colour?: string;
  accent_colour?: string;
  padding?: 'tight' | 'normal' | 'spacious';
  alignment?: 'left' | 'center' | 'right';
  max_width?: 'narrow' | 'medium' | 'wide' | 'full';
  background_image?: { url?: string } | null;
  background_image_overlay?: number;
};

type MediaShape = { url?: string; alternativeText?: string; name?: string } | null | undefined;

type Section = {
  __component: string;
  id: number | string;
  [key: string]: unknown;
};

// ─── Style helpers ────────────────────────────────────────────────────────

const PADDING_REM = { tight: '1.5rem', normal: '3.5rem', spacious: '5.5rem' } as const;
const MAX_WIDTH_PX = { narrow: '720px', medium: '960px', wide: '1200px', full: '100%' } as const;
const DEFAULTS = {
  background_colour: 'transparent',
  text_colour: '#231F20',
  accent_colour: '#6E3A5A',
  padding: 'normal' as const,
  alignment: 'left' as const,
  max_width: 'medium' as const,
};

function styleFromBlock(style: Style | undefined): {
  outer: React.CSSProperties;
  inner: React.CSSProperties;
  accent: string;
  bgImageUrl: string | null;
  overlayOpacity: number;
} {
  const s = style || {};
  const padding = PADDING_REM[(s.padding || DEFAULTS.padding)];
  const bgImageUrl = mediaUrl(s.background_image as MediaShape) || null;
  const overlayOpacity = Math.max(0, Math.min(80, (s.background_image_overlay ?? 0))) / 100;
  return {
    outer: {
      backgroundColor: s.background_colour || DEFAULTS.background_colour,
      color: s.text_colour || DEFAULTS.text_colour,
      paddingTop: padding,
      paddingBottom: padding,
      paddingLeft: '1.2rem',
      paddingRight: '1.2rem',
      position: 'relative',
      overflow: 'hidden',
    },
    inner: {
      maxWidth: MAX_WIDTH_PX[(s.max_width || DEFAULTS.max_width)],
      margin: '0 auto',
      textAlign: s.alignment || DEFAULTS.alignment,
      position: 'relative',
      zIndex: 1,
    },
    accent: s.accent_colour || DEFAULTS.accent_colour,
    bgImageUrl,
    overlayOpacity,
  };
}

function BgLayer({ url, overlay }: { url: string | null; overlay: number }) {
  if (!url) return null;
  return (
    <>
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `url('${url}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {overlay > 0 && (
        <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 0, background: `rgba(0,0,0,${overlay})` }} />
      )}
    </>
  );
}

// Minimal markdown for plain text body fields: paragraphs (blank line),
// **bold**, *italic*, [text](url). Keeps the renderer self-contained.
function paragraphs(text: string | undefined): string[] {
  if (!text) return [];
  return text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}
function inlineMarkdown(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

// ─── Individual section renderers ─────────────────────────────────────────

function Hero({ section }: { section: Section }) {
  const s = styleFromBlock(section.style as Style | undefined);
  const imgUrl = mediaUrl(section.image as MediaShape);
  return (
    <section style={s.outer}>
      <BgLayer url={imgUrl || s.bgImageUrl} overlay={imgUrl ? Math.max(s.overlayOpacity, 0.25) : s.overlayOpacity} />
      <div style={s.inner}>
        <h1 style={{ fontFamily: 'EB Garamond, Georgia, serif', fontWeight: 400, fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', lineHeight: 1.1, marginBottom: '1rem', color: imgUrl ? '#fff' : undefined }}>{section.title as string}</h1>
        {section.subtitle != null && (section.subtitle as string).trim() && (
          <p style={{ fontFamily: 'EB Garamond, Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(1.05rem, 2vw, 1.35rem)', maxWidth: 640, margin: s.inner.textAlign === 'center' ? '0 auto 1.5rem' : '0 0 1.5rem', color: imgUrl ? 'rgba(255,255,255,0.92)' : '#3D3D3A' }}>{section.subtitle as string}</p>
        )}
        {(section.cta_text || section.cta_secondary_text) && (
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', justifyContent: s.inner.textAlign === 'center' ? 'center' : 'flex-start', marginTop: '1.2rem' }}>
            {section.cta_text != null && (section.cta_text as string).trim() && (
              <Link href={(section.cta_link as string) || '#'} style={{ display: 'inline-block', padding: '0.85rem 1.6rem', background: s.accent, color: '#fff', textDecoration: 'none', borderRadius: 4, fontFamily: 'Mulish, sans-serif', fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 }}>{section.cta_text as string}</Link>
            )}
            {section.cta_secondary_text != null && (section.cta_secondary_text as string).trim() && (
              <Link href={(section.cta_secondary_link as string) || '#'} style={{ display: 'inline-block', padding: '0.85rem 1.6rem', background: 'transparent', color: imgUrl ? '#fff' : s.accent, textDecoration: 'none', borderRadius: 4, border: `1px solid ${imgUrl ? '#fff' : s.accent}`, fontFamily: 'Mulish, sans-serif', fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 }}>{section.cta_secondary_text as string}</Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function TextBlock({ section }: { section: Section }) {
  const s = styleFromBlock(section.style as Style | undefined);
  const heading = section.heading as string | undefined;
  // text-block.body is richtext (markdown string in Strapi v5). Render with minimal inline parser.
  const body = (section.body as string) || '';
  return (
    <section style={s.outer}>
      <BgLayer url={s.bgImageUrl} overlay={s.overlayOpacity} />
      <div style={s.inner}>
        {heading && <h2 style={{ fontFamily: 'Work Sans, sans-serif', fontWeight: 400, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', marginBottom: '1rem', color: 'inherit' }}>{heading}</h2>}
        <div style={{ fontFamily: 'EB Garamond, Georgia, serif', fontSize: '1.05rem', lineHeight: 1.85, color: 'inherit' }}>
          {paragraphs(body).map((p, i) => (
            <p key={i} style={{ marginBottom: '1rem' }} dangerouslySetInnerHTML={{ __html: inlineMarkdown(p) }} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ImageTextSplit({ section }: { section: Section }) {
  const s = styleFromBlock(section.style as Style | undefined);
  const img = mediaUrl(section.image as MediaShape);
  const caption = section.image_caption as string | undefined;
  const position = (section.image_position as 'left' | 'right') || 'right';
  return (
    <section style={s.outer}>
      <BgLayer url={s.bgImageUrl} overlay={s.overlayOpacity} />
      <div style={{ ...s.inner, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2.5rem', alignItems: 'center' }} className="page-image-text-split">
        <div style={{ order: position === 'left' ? 1 : 2 }}>
          {img && <img src={img} alt={(section.image_caption as string) || (section.heading as string) || ''} style={{ width: '100%', height: 'auto', borderRadius: 8, display: 'block' }} />}
          {caption && <p style={{ fontFamily: 'EB Garamond, Georgia, serif', fontStyle: 'italic', fontSize: '0.85rem', color: '#8C8880', marginTop: '0.6rem', textAlign: 'center' }}>{caption}</p>}
        </div>
        <div style={{ order: position === 'left' ? 2 : 1 }}>
          {section.eyebrow != null && (section.eyebrow as string).trim() && (
            <p style={{ fontFamily: 'Mulish, sans-serif', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: s.accent, marginBottom: '0.6rem' }}>{section.eyebrow as string}</p>
          )}
          {section.heading != null && (section.heading as string).trim() && (
            <h2 style={{ fontFamily: 'EB Garamond, Georgia, serif', fontWeight: 400, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', lineHeight: 1.25, marginBottom: '1rem', color: 'inherit' }}>{section.heading as string}</h2>
          )}
          <div style={{ fontFamily: 'EB Garamond, Georgia, serif', fontSize: '1.05rem', lineHeight: 1.85 }}>
            {paragraphs(section.body as string).map((p, i) => (
              <p key={i} style={{ marginBottom: '1rem' }} dangerouslySetInnerHTML={{ __html: inlineMarkdown(p) }} />
            ))}
          </div>
          {section.cta_label != null && (section.cta_label as string).trim() && (
            <Link href={(section.cta_url as string) || '#'} style={{ display: 'inline-block', marginTop: '0.6rem', padding: '0.75rem 1.4rem', background: s.accent, color: '#fff', textDecoration: 'none', borderRadius: 4, fontFamily: 'Mulish, sans-serif', fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 }}>{section.cta_label as string}</Link>
          )}
        </div>
      </div>
    </section>
  );
}

function FullBleedImage({ section }: { section: Section }) {
  const img = mediaUrl(section.image as MediaShape);
  if (!img) return null;
  const heights = { short: '40vh', medium: '60vh', tall: '80vh', fullscreen: '100vh' } as const;
  const minHeight = heights[(section.min_height as keyof typeof heights) || 'medium'];
  const overlay = Math.max(0, Math.min(80, (section.overlay_darken as number) ?? 0)) / 100;
  const text = section.overlay_text_colour as string || '#F5F3EF';
  const position = section.overlay_position as string || 'center';
  const justifyMap: Record<string, string> = {
    'top-left': 'flex-start', 'top-center': 'center', 'top-right': 'flex-end',
    'center': 'center',
    'bottom-left': 'flex-start', 'bottom-center': 'center', 'bottom-right': 'flex-end',
  };
  const alignMap: Record<string, string> = {
    'top-left': 'flex-start', 'top-center': 'flex-start', 'top-right': 'flex-start',
    'center': 'center',
    'bottom-left': 'flex-end', 'bottom-center': 'flex-end', 'bottom-right': 'flex-end',
  };
  const textAlignMap: Record<string, 'left' | 'center' | 'right'> = {
    'top-left': 'left', 'top-center': 'center', 'top-right': 'right',
    'center': 'center',
    'bottom-left': 'left', 'bottom-center': 'center', 'bottom-right': 'right',
  };
  return (
    <section style={{ position: 'relative', minHeight, display: 'flex', alignItems: alignMap[position], justifyContent: justifyMap[position], overflow: 'hidden' }}>
      <img src={img} alt={(section.overlay_heading as string) || ''} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
      {overlay > 0 && <div aria-hidden style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${overlay})`, zIndex: 0 }} />}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, padding: '3rem 2rem', color: text, textAlign: textAlignMap[position] }}>
        {section.overlay_eyebrow != null && (section.overlay_eyebrow as string).trim() && (
          <p style={{ fontFamily: 'Mulish, sans-serif', fontSize: '0.65rem', letterSpacing: '0.32em', textTransform: 'uppercase', marginBottom: '0.8rem' }}>{section.overlay_eyebrow as string}</p>
        )}
        {section.overlay_heading != null && (section.overlay_heading as string).trim() && (
          <h2 style={{ fontFamily: 'EB Garamond, Georgia, serif', fontWeight: 400, fontSize: 'clamp(2rem, 5vw, 3.4rem)', lineHeight: 1.15 }}>{section.overlay_heading as string}</h2>
        )}
        {section.overlay_body != null && (section.overlay_body as string).trim() && (
          <p style={{ fontFamily: 'EB Garamond, Georgia, serif', fontStyle: 'italic', fontSize: '1.1rem', marginTop: '1rem', maxWidth: 580, marginLeft: textAlignMap[position] === 'center' ? 'auto' : 0, marginRight: textAlignMap[position] === 'center' ? 'auto' : 0 }}>{section.overlay_body as string}</p>
        )}
      </div>
      {section.caption != null && (section.caption as string).trim() && (
        <p style={{ position: 'absolute', bottom: 8, left: 12, color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem', fontFamily: 'Mulish, sans-serif', letterSpacing: '0.1em' }}>{section.caption as string}</p>
      )}
    </section>
  );
}

function ImagePair({ section }: { section: Section }) {
  const s = styleFromBlock(section.style as Style | undefined);
  const left = mediaUrl(section.image_left as MediaShape);
  const right = mediaUrl(section.image_right as MediaShape);
  return (
    <section style={s.outer}>
      <BgLayer url={s.bgImageUrl} overlay={s.overlayOpacity} />
      <div style={s.inner}>
        {section.heading != null && (section.heading as string).trim() && (
          <h2 style={{ fontFamily: 'Work Sans, sans-serif', fontWeight: 400, fontSize: 'clamp(1.4rem, 3vw, 2rem)', marginBottom: '1.2rem', textAlign: 'center' }}>{section.heading as string}</h2>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem' }} className="page-image-pair">
          <figure style={{ margin: 0 }}>
            {left && <img src={left} alt={(section.caption_left as string) || ''} style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 6 }} />}
            {section.caption_left != null && (section.caption_left as string).trim() && (
              <figcaption style={{ fontFamily: 'EB Garamond, Georgia, serif', fontStyle: 'italic', fontSize: '0.85rem', color: '#8C8880', marginTop: '0.5rem', textAlign: 'center' }}>{section.caption_left as string}</figcaption>
            )}
          </figure>
          <figure style={{ margin: 0 }}>
            {right && <img src={right} alt={(section.caption_right as string) || ''} style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 6 }} />}
            {section.caption_right != null && (section.caption_right as string).trim() && (
              <figcaption style={{ fontFamily: 'EB Garamond, Georgia, serif', fontStyle: 'italic', fontSize: '0.85rem', color: '#8C8880', marginTop: '0.5rem', textAlign: 'center' }}>{section.caption_right as string}</figcaption>
            )}
          </figure>
        </div>
      </div>
    </section>
  );
}

function ImageWithCaption({ section }: { section: Section }) {
  const s = styleFromBlock(section.style as Style | undefined);
  const img = mediaUrl(section.image as MediaShape);
  const widths = { narrow: '600px', medium: '900px', wide: '1200px', full: '100%' } as const;
  const imageMax = widths[(section.max_image_width as keyof typeof widths) || 'medium'];
  if (!img) return null;
  return (
    <section style={s.outer}>
      <BgLayer url={s.bgImageUrl} overlay={s.overlayOpacity} />
      <div style={{ ...s.inner, textAlign: 'center' }}>
        <figure style={{ margin: '0 auto', maxWidth: imageMax }}>
          <img src={img} alt={(section.caption as string) || ''} style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 6 }} />
          {section.caption != null && (section.caption as string).trim() && (
            <figcaption style={{ fontFamily: 'EB Garamond, Georgia, serif', fontStyle: 'italic', fontSize: '0.9rem', color: '#8C8880', marginTop: '0.8rem' }}>{section.caption as string}</figcaption>
          )}
        </figure>
      </div>
    </section>
  );
}

function Gallery({ section }: { section: Section }) {
  const s = styleFromBlock(section.style as Style | undefined);
  const images = Array.isArray(section.images) ? (section.images as Array<MediaShape>) : [];
  const urls = images.map(mediaUrl).filter(Boolean) as string[];
  return (
    <section style={s.outer}>
      <BgLayer url={s.bgImageUrl} overlay={s.overlayOpacity} />
      <div style={s.inner}>
        {section.heading != null && (section.heading as string).trim() && (
          <h2 style={{ fontFamily: 'Work Sans, sans-serif', fontWeight: 400, fontSize: 'clamp(1.4rem, 3vw, 2rem)', marginBottom: '1.2rem', textAlign: 'center' }}>{section.heading as string}</h2>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.8rem' }}>
          {urls.map((u, i) => (
            <img key={i} src={u} alt="" style={{ width: '100%', aspectRatio: '4 / 5', objectFit: 'cover', borderRadius: 4, display: 'block' }} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBanner({ section }: { section: Section }) {
  const s = styleFromBlock(section.style as Style | undefined);
  return (
    <section style={{ ...s.outer, textAlign: 'center' }}>
      <BgLayer url={s.bgImageUrl} overlay={s.overlayOpacity} />
      <div style={{ ...s.inner, textAlign: 'center' }}>
        {section.heading != null && (section.heading as string).trim() && (
          <h2 style={{ fontFamily: 'EB Garamond, Georgia, serif', fontWeight: 400, fontSize: 'clamp(1.6rem, 4vw, 2.6rem)', lineHeight: 1.2, marginBottom: '0.8rem' }}>{section.heading as string}</h2>
        )}
        {section.subheading != null && (section.subheading as string).trim() && (
          <p style={{ fontFamily: 'EB Garamond, Georgia, serif', fontStyle: 'italic', fontSize: '1.1rem', marginBottom: '1.5rem' }}>{section.subheading as string}</p>
        )}
        {section.cta_text != null && (section.cta_text as string).trim() && (
          <Link href={(section.cta_link as string) || '#'} style={{ display: 'inline-block', padding: '1rem 2rem', background: s.accent, color: '#fff', textDecoration: 'none', borderRadius: 4, fontFamily: 'Mulish, sans-serif', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>{section.cta_text as string}</Link>
        )}
      </div>
    </section>
  );
}

function CustomHtml({ section }: { section: Section }) {
  const s = styleFromBlock(section.style as Style | undefined);
  const html = (section.html as string) || '';
  return (
    <section style={s.outer}>
      <BgLayer url={s.bgImageUrl} overlay={s.overlayOpacity} />
      <div style={s.inner} dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}

function Embed({ section }: { section: Section }) {
  const s = styleFromBlock(section.style as Style | undefined);
  const url = (section.url as string) || '';
  // YouTube / Vimeo / generic iframe support
  const ytId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  const isVimeo = /vimeo\.com\/(\d+)/.test(url);
  return (
    <section style={s.outer}>
      <BgLayer url={s.bgImageUrl} overlay={s.overlayOpacity} />
      <div style={s.inner}>
        {section.heading != null && (section.heading as string).trim() && (
          <h2 style={{ fontFamily: 'Work Sans, sans-serif', fontWeight: 400, fontSize: 'clamp(1.4rem, 3vw, 2rem)', marginBottom: '1rem', textAlign: 'center' }}>{section.heading as string}</h2>
        )}
        {ytId ? (
          <div style={{ aspectRatio: '16 / 9', maxWidth: 900, margin: '0 auto' }}>
            <iframe src={`https://www.youtube-nocookie.com/embed/${ytId[1]}`} style={{ width: '100%', height: '100%', border: 0 }} allowFullScreen loading="lazy" />
          </div>
        ) : isVimeo ? (
          <div style={{ aspectRatio: '16 / 9', maxWidth: 900, margin: '0 auto' }}>
            <iframe src={url} style={{ width: '100%', height: '100%', border: 0 }} allowFullScreen loading="lazy" />
          </div>
        ) : url ? (
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <iframe src={url} style={{ width: '100%', minHeight: 400, border: 0 }} loading="lazy" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Fallback({ section }: { section: Section }) {
  // Quiet fallback: don't crash if a component doesn't yet have a renderer.
  // Surfaces nothing in production. Useful during development.
  if (process.env.NODE_ENV !== 'production') {
    return (
      <section style={{ padding: '1rem', background: '#FFE9E0', color: '#231F20', fontFamily: 'monospace', fontSize: '0.8rem' }}>
        Section <strong>{section.__component}</strong> has no renderer yet.
      </section>
    );
  }
  return null;
}

// ─── Main export ──────────────────────────────────────────────────────────

const RENDERERS: Record<string, React.FC<{ section: Section }>> = {
  'sections.hero': Hero,
  'sections.text-block': TextBlock,
  'sections.image-text-split': ImageTextSplit,
  'sections.full-bleed-image': FullBleedImage,
  'sections.image-pair': ImagePair,
  'sections.image-with-caption': ImageWithCaption,
  'sections.gallery': Gallery,
  'sections.cta-banner': CtaBanner,
  'sections.custom-html': CustomHtml,
  'sections.embed': Embed,
};

const responsiveStyles = `
@media (max-width: 760px) {
  .page-image-text-split { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
  .page-image-text-split > div:first-child { order: 1 !important; }
  .page-image-text-split > div:last-child { order: 2 !important; }
  .page-image-pair { grid-template-columns: 1fr !important; gap: 1rem !important; }
}
`;

export default function PageSections({ sections }: { sections: Section[] }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: responsiveStyles }} />
      {sections.map((section, i) => {
        const Renderer = RENDERERS[section.__component] || Fallback;
        return <Renderer key={`${section.__component}-${section.id ?? i}`} section={section} />;
      })}
    </>
  );
}
