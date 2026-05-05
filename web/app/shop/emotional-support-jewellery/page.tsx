import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
export const metadata: Metadata = { title: 'Emotional Support Jewellery', description: 'Story-first pieces. Moonstone, Clear Quartz, and more. Jewellery with meaning.' };
export default function ESJPage() { return <SubPage kicker="Shop" kickerColour="#5DCAA5" title="Emotional Support Jewellery" parentLabel="Shop" parentHref="/shop" description="Story-first pieces designed to hold you in hard moments. Moonstone for when you need to remember what is underneath the noise. Clear Quartz for the days your mind is doing too much. Each piece has a meaning and a purpose." />; }
