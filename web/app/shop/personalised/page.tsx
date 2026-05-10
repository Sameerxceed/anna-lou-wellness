import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
export const metadata: Metadata = { title: 'Personalised Pieces', description: 'Engraved and personalised jewellery. Names, dates, and words that matter.' };
export default function PersonalisedPage() {
  return <SubPage kicker="Shop" kickerColour="#5DCAA5" title="Personalised Pieces" parentLabel="Shop" parentHref="/shop"
    paragraphs={[
      'The word you keep coming back to, worn close to your throat. Names, dates, and words that matter, hand-engraved on pieces designed to last.',
      'Personalised jewellery has been at the heart of Anna Lou of London since the beginning. From the Portobello Road stall to Harrods, the principle has never changed: a piece of jewellery should mean something.',
      'Every personalised piece is made to order in the Design Lab on Taggs Island. Allow 5\u20137 working days for production. UK delivery is free on orders over \u00A350.',
      'For bespoke commissions or custom designs, please get in touch directly.',
    ]}
    cta={{ label: 'Browse personalised', href: '/shop' }}
  />;
}
