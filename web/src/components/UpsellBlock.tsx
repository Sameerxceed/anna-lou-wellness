/**
 * UpsellBlock — renders the "Show next" cards Anna controls per-page
 * (the 8 Jun mapping: Decoder -> REGULATED + Reset Room, REGULATED ->
 * Reset Room + Workshops, etc.).
 *
 * Reads from the `upsells` repeatable on Programme / Experience / Page.
 * If empty, renders nothing — that's how Corporate Workshops shows no
 * upsell block at all (Anna leaves the field empty).
 */

import Link from 'next/link';
import { mediaUrl } from '@/lib/strapi';

export type UpsellItem = {
  label: string;
  link: string;
  eyebrow?: string;
  blurb?: string;
  image?: { url?: string } | null;
};

const styles = `
.alw-upsells { background: #F5F3EF; padding: 3rem 1.2rem; }
.alw-upsells-inner { max-width: 1100px; margin: 0 auto; }
.alw-upsells-kicker { font-family: Mulish, sans-serif; font-weight: 600; font-size: 0.65rem; letter-spacing: 0.25em; text-transform: uppercase; color: #6E3A5A; text-align: center; margin-bottom: 0.4rem; }
.alw-upsells-title { font-family: 'EB Garamond', Georgia, serif; font-weight: 400; font-size: clamp(1.4rem, 3vw, 1.9rem); color: #231F20; text-align: center; margin-bottom: 1.8rem; }
.alw-upsell-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; max-width: 980px; margin: 0 auto; }
.alw-upsell-card { background: #fff; border: 1px solid rgba(0,0,0,0.06); border-radius: 6px; overflow: hidden; text-decoration: none; color: inherit; display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s; }
.alw-upsell-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
.alw-upsell-img { aspect-ratio: 16 / 10; background-size: cover; background-position: center; background-color: #EDE8DF; }
.alw-upsell-body { padding: 1.1rem 1.2rem 1.3rem; flex: 1; display: flex; flex-direction: column; }
.alw-upsell-eyebrow { font-family: Mulish, sans-serif; font-weight: 600; font-size: 0.55rem; letter-spacing: 0.22em; text-transform: uppercase; color: #8C8880; margin-bottom: 0.4rem; }
.alw-upsell-label { font-family: 'EB Garamond', Georgia, serif; font-weight: 500; font-size: 1.15rem; color: #231F20; line-height: 1.25; margin-bottom: 0.45rem; }
.alw-upsell-blurb { font-family: 'EB Garamond', Georgia, serif; font-size: 0.95rem; line-height: 1.55; color: #3D3D3A; flex: 1; }
.alw-upsell-arrow { font-family: Mulish, sans-serif; font-weight: 600; font-size: 0.65rem; letter-spacing: 0.18em; text-transform: uppercase; color: #6E3A5A; margin-top: 0.9rem; display: inline-flex; align-items: center; gap: 0.3rem; }
.alw-upsell-card:hover .alw-upsell-arrow { color: #231F20; }
`;

function isExternal(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export default function UpsellBlock({
  items,
  title = 'Where next.',
  kicker = 'Continue your journey',
}: {
  items: UpsellItem[] | undefined | null;
  title?: string;
  kicker?: string;
}) {
  const list = Array.isArray(items) ? items.filter((i) => i && i.label && i.link) : [];
  if (list.length === 0) return null;
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <section className="alw-upsells">
        <div className="alw-upsells-inner">
          <p className="alw-upsells-kicker">{kicker}</p>
          <h2 className="alw-upsells-title">{title}</h2>
          <div className="alw-upsell-grid">
            {list.map((item, i) => {
              const imgUrl = mediaUrl(item.image);
              const Tag = (isExternal(item.link) ? 'a' : Link) as React.ElementType;
              const linkProps = isExternal(item.link)
                ? { href: item.link, target: '_blank', rel: 'noopener' }
                : { href: item.link };
              return (
                <Tag key={i} className="alw-upsell-card" {...linkProps}>
                  {imgUrl && <div className="alw-upsell-img" style={{ backgroundImage: `url('${imgUrl}')` }} />}
                  <div className="alw-upsell-body">
                    {item.eyebrow && <p className="alw-upsell-eyebrow">{item.eyebrow}</p>}
                    <p className="alw-upsell-label">{item.label}</p>
                    {item.blurb && <p className="alw-upsell-blurb">{item.blurb}</p>}
                    <span className="alw-upsell-arrow">Read more &rarr;</span>
                  </div>
                </Tag>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
