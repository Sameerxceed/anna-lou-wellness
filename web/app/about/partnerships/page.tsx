import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
export const metadata: Metadata = { title: 'Work With Me — Partnerships', description: 'Partnership and collaboration enquiries. Brand collaborations, sponsorship, and joint ventures.' };
export default function PartnershipsPage() { return <SubPage kicker="About" kickerColour="#231F20" title="Work With Me" parentLabel="About" parentHref="/about" description="Partnership and collaboration enquiries. Brand collaborations, sponsorship, and joint ventures. If you are interested in working together, get in touch." />; }
