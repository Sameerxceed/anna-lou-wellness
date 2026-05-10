import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
export const metadata: Metadata = { title: 'Emotional Support Jewellery', description: 'Story-first pieces. Moonstone, Clear Quartz, and more. Jewellery with meaning.' };
export default function ESJPage() {
  return <SubPage kicker="Shop" kickerColour="#5DCAA5" title="Emotional Support Jewellery" parentLabel="Shop" parentHref="/shop"
    paragraphs={[
      'Story-first pieces designed to hold you in hard moments. Each piece has a meaning and a purpose \u2014 chosen not just for beauty but for what it does.',
      'Moonstone for when you need to remember what is underneath the noise. Clear Quartz for the days your mind is doing too much. Rose Quartz for self-love. Amethyst for calm. Black Tourmaline for grounding and protection.',
      'The ESJ range began because clients kept asking: what can I wear that will remind me of the work we did together? Something I can touch when things get loud. Something that anchors me.',
      'Every crystal is hand-selected. Every piece is made in the UK. The story behind each stone is included with your order.',
    ]}
    cta={{ label: 'Browse ESJ collection', href: '/shop' }}
  />;
}
