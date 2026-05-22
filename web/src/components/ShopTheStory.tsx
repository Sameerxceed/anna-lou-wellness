/**
 * ShopTheStory — magazine-style photo gallery with hover product tags.
 *
 * Anna's PDF item 5.2 (21 May staging review):
 *   "Do not put product links inline in story copy ... The right way to
 *    link products is through photographs with hover tags. The reader
 *    hovers over a photo of me wearing a piece and sees a small tag that
 *    says 'Anna is wearing the [piece name]' which links to the shop.
 *    This is the model many magazines use."
 *
 * Renders below the article body, before related articles. Anna populates
 * the shop_tags repeatable component on the article in CMS. Each entry
 * contributes one photo to this gallery.
 *
 * Sparingly = Anna's call (she adds entries only for genuinely-central
 * products). If shop_tags is empty, this component renders nothing.
 *
 * Click behaviour: if a product is set, the whole photo links to
 * /shop/[product-slug]. If no product is set (Anna just wanted a photo
 * with caption), the photo renders without a link.
 */

import Link from 'next/link';
import type { ArticleShopTag } from '@/lib/cms';

interface Props {
  tags: ArticleShopTag[];
  /** Optional section accent colour for the hover tag bg + section label. */
  accentColour?: string;
  /** Section label shown above the gallery. Defaults to "Shop the story". */
  label?: string;
}

export default function ShopTheStory({ tags, accentColour = '#6E3A5A', label = 'Shop the story' }: Props) {
  if (!tags || tags.length === 0) return null;

  return (
    <section className="sts-section">
      <style dangerouslySetInnerHTML={{ __html: stsStyles(accentColour) }} />
      <p className="sts-label">{label}</p>
      <div className="sts-grid" data-count={tags.length}>
        {tags.map((tag, i) => {
          const href = tag.productSlug ? `/shop/${tag.productSlug}` : null;
          const hoverLabel = tag.productName ? `${tag.captionPrefix} ${tag.productName}` : null;
          const figure = (
            <figure className="sts-figure">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tag.image}
                alt={tag.altText || hoverLabel || 'Photo'}
                className="sts-image"
                loading="lazy"
              />
              {hoverLabel && (
                <figcaption className="sts-caption" aria-label={hoverLabel}>
                  <span className="sts-caption-text">{hoverLabel}</span>
                  {href && <span className="sts-caption-arrow">&rarr;</span>}
                </figcaption>
              )}
            </figure>
          );
          return href ? (
            <Link key={i} href={href} className="sts-tile sts-tile-link">{figure}</Link>
          ) : (
            <div key={i} className="sts-tile">{figure}</div>
          );
        })}
      </div>
    </section>
  );
}

const stsStyles = (accent: string) => `
.sts-section {
  margin: 3rem 0 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(0,0,0,0.06);
}
.sts-label {
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase;
  color: ${accent};
  text-align: center;
  margin-bottom: 1.2rem;
}
.sts-grid {
  display: grid; gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.sts-grid[data-count="1"] { grid-template-columns: minmax(0, 1fr); max-width: 520px; margin: 0 auto; }
.sts-grid[data-count="3"], .sts-grid[data-count="4"] {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
@media (min-width: 900px) {
  .sts-grid[data-count="3"] { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .sts-grid[data-count="4"] { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

.sts-tile {
  position: relative;
  display: block;
  overflow: hidden;
  border-radius: 6px;
  background: #f5f3ef;
}
.sts-tile-link { text-decoration: none; cursor: pointer; }

.sts-figure {
  margin: 0;
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 5;
  overflow: hidden;
}
.sts-image {
  width: 100%; height: 100%;
  object-fit: cover; display: block;
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.sts-tile-link:hover .sts-image { transform: scale(1.04); }

.sts-caption {
  position: absolute;
  left: 0.7rem; bottom: 0.7rem;
  right: 0.7rem;
  display: inline-flex;
  align-items: center; gap: 0.5rem;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(8px);
  padding: 0.5rem 0.8rem;
  border-radius: 999px;
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 0.85rem; font-style: italic;
  color: #231F20;
  opacity: 0; transform: translateY(8px);
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  max-width: calc(100% - 1.4rem);
  pointer-events: none;
}
.sts-tile:hover .sts-caption,
.sts-tile:focus-within .sts-caption {
  opacity: 1; transform: translateY(0);
}
.sts-caption-text {
  flex: 1; min-width: 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.sts-caption-arrow {
  flex-shrink: 0;
  color: ${accent};
  font-style: normal;
  font-weight: 600;
}

/* Touch devices: caption is always visible (no real hover) so users
   on phones/tablets still see the product tag without needing to hover. */
@media (hover: none) {
  .sts-caption { opacity: 1; transform: translateY(0); }
}
`;
