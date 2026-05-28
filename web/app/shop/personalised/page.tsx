import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
import { getSubPage } from '@/lib/cms';

const fallback = {
  kicker: 'Shop',
  kickerColour: '#5DCAA5',
  title: 'Personalised Pieces',
  parentLabel: 'Shop',
  parentHref: '/shop',
  paragraphs: [
    'The word you keep coming back to, worn close to your throat. Names, dates, and words that matter, hand-engraved on pieces designed to last.',
    'Personalised jewellery has been at the heart of Anna Lou of London since the beginning. From the Portobello Road stall to Harrods, the principle has never changed: a piece of jewellery should mean something.',
    'Every personalised piece is made to order in the Design Lab on Taggs Island. Allow 5 to 7 working days for production. UK delivery is free on orders over £50.',
    'For bespoke commissions or custom designs, please get in touch directly.',
  ],
  ctaLabel: 'Browse personalised',
  ctaUrl: '/shop',
  inspirationLabel: 'Looking for inspiration? Read how to choose your word',
  inspirationUrl: '/life/style-and-beauty',
};

export async function generateMetadata(): Promise<Metadata> {
  const page = await getSubPage('/shop-personalised-page', fallback);
  return {
    title: page.title,
    description: page.paragraphs[0] ?? '',
  };
}

export default async function PersonalisedPage() {
  const page = await getSubPage('/shop-personalised-page', fallback);
  return (
    <SubPage
      kicker={page.kicker}
      kickerColour={page.kickerColour}
      title={page.title}
      parentLabel={page.parentLabel}
      parentHref={page.parentHref}
      paragraphs={page.paragraphs}
      cta={{ label: page.ctaLabel, href: page.ctaUrl }}
      inspirationLink={
        page.inspirationLabel && page.inspirationUrl
          ? { label: page.inspirationLabel, href: page.inspirationUrl }
          : undefined
      }
    />
  );
}
