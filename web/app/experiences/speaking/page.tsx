import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
export const metadata: Metadata = { title: 'Speaking', description: 'Anna speaks on somatic coaching, the founder journey, and nervous system regulation.' };
export default function SpeakingPage() { return <SubPage kicker="Experiences" kickerColour="#7BAFDD" title="Speaking" parentLabel="Experiences" parentHref="/experiences" description="Anna speaks on somatic coaching, the founder journey, nervous system regulation, and building a business from the body up. Available for conferences, panels, podcasts, and private events." />; }
