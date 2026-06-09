'use client';

/**
 * One-page visual grid of every Experience entry. Image-first cards
 * (Chris Corsini style) with client-side filter pills at the top so
 * visitors can see everything in one scroll instead of clicking through
 * 4 sub-pages. Anna's 5 Jun feedback: "the workshops and retreats page
 * we need to make easy to scroll through and show what options we have".
 *
 * Uses existing Experience data from CMS — no schema change needed.
 * Filters live in React state (no URL params) because the page is short
 * enough that deep-linking to a filtered view isn't a strong need.
 */

import { useMemo, useState } from 'react';
import { isCalendlyUrl, openCalendlyPopup } from './BookingButton';
import Link from 'next/link';
import { getStockImage } from '@/data/stock-images';

type ExperienceType = 'retreat' | 'workshop' | 'corporate' | 'speaking';

export type ExperienceCard = {
  id: number;
  name: string;
  slug: string;
  type: ExperienceType;
  date: string;
  location: string;
  priceLabel: string;
  heroImage: string;
  bookingUrl: string;
};

const TYPE_META: Record<ExperienceType, { label: string; href: string; colour: string }> = {
  retreat: { label: 'Retreat', href: '/experiences/retreats', colour: '#7BAFDD' },
  workshop: { label: 'Workshop', href: '/experiences/workshops', colour: '#F280AA' },
  corporate: { label: 'Corporate', href: '/experiences/corporate-wellbeing', colour: '#5DCAA5' },
  speaking: { label: 'Speaking', href: '/experiences/speaking', colour: '#FAA21B' },
};

const FILTERS: Array<{ key: 'all' | ExperienceType; label: string; colour?: string }> = [
  { key: 'all', label: 'All' },
  { key: 'retreat', label: 'Retreats', colour: TYPE_META.retreat.colour },
  { key: 'workshop', label: 'Workshops', colour: TYPE_META.workshop.colour },
  { key: 'corporate', label: 'Corporate', colour: TYPE_META.corporate.colour },
  { key: 'speaking', label: 'Speaking', colour: TYPE_META.speaking.colour },
];

function formatDate(iso: string): string {
  if (!iso) return '';
  // Accept Strapi date strings 'YYYY-MM-DD' or 'YYYY-MM-DDT...' or plain 'September 2026'.
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso;
  try {
    const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function ExperiencesGrid({ items }: { items: ExperienceCard[] }) {
  const [filter, setFilter] = useState<'all' | ExperienceType>('all');

  const filtered = useMemo(
    () => (filter === 'all' ? items : items.filter((i) => i.type === filter)),
    [filter, items],
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: gridStyles }} />

      <div className="xg-filterbar">
        <div className="xg-filterbar-inner">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`xg-pill${active ? ' xg-pill-active' : ''}`}
                style={active && f.colour ? { background: f.colour, borderColor: f.colour, color: '#fff' } : undefined}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <section className="xg-grid-wrap">
        <div className="xg-grid">
          {filtered.length === 0 && (
            <p className="xg-empty">No upcoming items in this category. Check back soon or join the mailing list to be notified first.</p>
          )}
          {filtered.map((item) => {
            const meta = TYPE_META[item.type];
            const img = item.heroImage || getStockImage('experiences', item.slug);
            const href = item.bookingUrl || meta.href;
            const isExternal = /^https?:\/\//i.test(href);
            const useCalendly = isCalendlyUrl(href);
            const cardProps: Record<string, any> = useCalendly
              ? {
                  href,
                  onClick: async (e: React.MouseEvent) => {
                    e.preventDefault();
                    const opened = await openCalendlyPopup(href);
                    if (!opened) window.open(href, '_blank', 'noopener,noreferrer');
                  },
                }
              : isExternal
                ? { href, target: '_blank' as const, rel: 'noopener' }
                : { href };
            const Tag = (isExternal || useCalendly ? 'a' : Link) as React.ElementType;
            return (
              <Tag key={item.id} className="xg-card" {...cardProps}>
                <div className="xg-card-img" style={{ backgroundImage: `url('${img}')` }}>
                  <span className="xg-card-pill" style={{ background: meta.colour }}>{meta.label}</span>
                </div>
                <div className="xg-card-body">
                  <h3 className="xg-card-name">{item.name}</h3>
                  {(item.date || item.location) && (
                    <p className="xg-card-meta">
                      {item.date && <span>{formatDate(item.date)}</span>}
                      {item.date && item.location && <span className="xg-card-dot"> · </span>}
                      {item.location && <span>{item.location}</span>}
                    </p>
                  )}
                  {item.priceLabel && <p className="xg-card-price">{item.priceLabel}</p>}
                  <span className="xg-card-arrow">View &rarr;</span>
                </div>
              </Tag>
            );
          })}
        </div>
      </section>
    </>
  );
}

const gridStyles = `
.xg-filterbar { background: #fff; border-bottom: 1px solid rgba(0,0,0,0.06); padding: 1.2rem 1.2rem; position: sticky; top: 0; z-index: 5; }
.xg-filterbar-inner { max-width: 1200px; margin: 0 auto; display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; }
.xg-pill { font-family: Mulish, sans-serif; font-weight: 600; font-size: 0.65rem; letter-spacing: 0.18em; text-transform: uppercase; color: #3D3D3A; background: #fff; border: 1px solid rgba(0,0,0,0.18); padding: 0.6rem 1.1rem; border-radius: 999px; cursor: pointer; transition: all 0.2s; }
.xg-pill:hover { border-color: #231F20; color: #231F20; }
.xg-pill-active { color: #fff; }

.xg-grid-wrap { background: #fff; padding: 2rem 1.2rem 4rem; }
.xg-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 1.4rem; }
.xg-empty { grid-column: 1 / -1; font-family: 'EB Garamond', Georgia, serif; font-style: italic; color: #8C8880; text-align: center; padding: 3rem 1rem; font-size: 1rem; }

.xg-card { background: #fff; border-radius: 8px; overflow: hidden; text-decoration: none; color: inherit; display: flex; flex-direction: column; border: 1px solid rgba(0,0,0,0.06); transition: transform 0.2s, box-shadow 0.2s; }
.xg-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,0.08); }
.xg-card-img { aspect-ratio: 4 / 3; background-size: cover; background-position: center; background-color: #EDE8DF; position: relative; }
.xg-card-pill { position: absolute; top: 0.8rem; left: 0.8rem; font-family: Mulish, sans-serif; font-weight: 600; font-size: 0.55rem; letter-spacing: 0.22em; text-transform: uppercase; color: #fff; padding: 0.35rem 0.7rem; border-radius: 999px; }
.xg-card-body { padding: 1.1rem 1.2rem 1.3rem; flex: 1; display: flex; flex-direction: column; }
.xg-card-name { font-family: 'EB Garamond', Georgia, serif; font-weight: 500; font-size: 1.2rem; color: #231F20; line-height: 1.25; margin-bottom: 0.5rem; }
.xg-card-meta { font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.7rem; letter-spacing: 0.08em; color: #6E3A5A; margin-bottom: 0.4rem; }
.xg-card-dot { color: rgba(110, 58, 90, 0.4); }
.xg-card-price { font-family: 'EB Garamond', Georgia, serif; font-style: italic; font-size: 0.95rem; color: #3D3D3A; margin-bottom: 0.8rem; }
.xg-card-arrow { margin-top: auto; font-family: Mulish, sans-serif; font-weight: 600; font-size: 0.65rem; letter-spacing: 0.16em; text-transform: uppercase; color: #6E3A5A; display: inline-flex; align-items: center; gap: 0.3rem; }
.xg-card:hover .xg-card-arrow { color: #231F20; }

@media (max-width: 600px) {
  .xg-filterbar { padding: 0.9rem 0.8rem; }
  .xg-pill { font-size: 0.6rem; padding: 0.5rem 0.85rem; }
  .xg-grid-wrap { padding: 1.2rem 0.8rem 3rem; }
  .xg-grid { gap: 1rem; grid-template-columns: 1fr; }
  .xg-card-name { font-size: 1.15rem; }
}
`;
