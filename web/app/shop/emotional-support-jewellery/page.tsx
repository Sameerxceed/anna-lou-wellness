import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
import { getSubPage } from '@/lib/cms';

const fallback = {
  kicker: 'Shop',
  kickerColour: '#5DCAA5',
  title: 'Emotional Support Jewellery',
  parentLabel: 'Shop',
  parentHref: '/shop',
  paragraphs: [
    'Story-first pieces designed to hold you in hard moments. Each piece has a meaning and a purpose, chosen not just for beauty but for what it does.',
    'Moonstone for when you need to remember what is underneath the noise. Clear Quartz for the days your mind is doing too much. Rose Quartz for self-love. Amethyst for calm. Black Tourmaline for grounding and protection.',
    'The ESJ range began because clients kept asking: what can I wear that will remind me of the work we did together? Something I can touch when things get loud. Something that anchors me.',
    'Every crystal is hand-selected. Every piece is made in the UK. The story behind each stone is included with your order.',
  ],
  ctaLabel: 'Browse ESJ collection',
  ctaUrl: '/shop',
};

export async function generateMetadata(): Promise<Metadata> {
  const page = await getSubPage('/shop-esj-page', fallback);
  return {
    title: page.title,
    description: page.paragraphs[0] ?? '',
  };
}

export default async function ESJPage() {
  const page = await getSubPage('/shop-esj-page', fallback);
  return (
    <SubPage
      kicker={page.kicker}
      kickerColour={page.kickerColour}
      title={page.title}
      parentLabel={page.parentLabel}
      parentHref={page.parentHref}
      paragraphs={page.paragraphs}
      cta={{ label: page.ctaLabel, href: page.ctaUrl }}
    />
  );
}
