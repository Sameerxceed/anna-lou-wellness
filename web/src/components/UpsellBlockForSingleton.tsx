/**
 * UpsellBlockForSingleton — server-rendered convenience wrapper around
 * UpsellBlock.
 *
 * Pass the singleton's Strapi REST path (e.g. '/about-page') and it
 * fetches the upsells field via the same helper used by the existing
 * page loaders, then renders UpsellBlock with the result.
 *
 * Why this wrapper exists: every page that already has a typed loader
 * (getAboutPage, getCommunityPage, etc.) would otherwise need to:
 *   1. Have its TypeScript interface extended with `upsells: UpsellRef[]`
 *   2. Have its loader call getUpsellsForSingleton + merge
 *   3. Have its page.tsx thread `cms.upsells` through to the JSX
 * That's 3 edits per page. With this wrapper it's 1 line per page:
 *
 *   <UpsellBlockForSingleton endpoint="/about-page" />
 *
 * Returns null when no upsells set so it's safe to drop in anywhere.
 */

import UpsellBlock, { type UpsellItem } from './UpsellBlock';
import { getUpsellsForSingleton } from '@/lib/cms';

interface Props {
  endpoint: string;
  title?: string;
  kicker?: string;
}

export default async function UpsellBlockForSingleton({ endpoint, title = 'Where next.', kicker = 'Continue exploring' }: Props) {
  const upsells = await getUpsellsForSingleton(endpoint);
  if (!upsells || upsells.length === 0) return null;
  return <UpsellBlock items={upsells as unknown as UpsellItem[]} title={title} kicker={kicker} />;
}
