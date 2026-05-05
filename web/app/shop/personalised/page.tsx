import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
export const metadata: Metadata = { title: 'Personalised Pieces', description: 'Engraved and personalised jewellery. Names, dates, and words that matter.' };
export default function PersonalisedPage() { return <SubPage kicker="Shop" kickerColour="#5DCAA5" title="Personalised Pieces" parentLabel="Shop" parentHref="/shop" description="The word you keep coming back to, worn close to your throat. Names, dates, and words that matter, hand-engraved on pieces designed to last." />; }
