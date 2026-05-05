import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
export const metadata: Metadata = { title: '1:1 Sessions', description: 'Reset Sessions, Founder Reset, Dating Reset, Nervous System Reset. 1:1 coaching with Anna.' };
export default function SessionsPage() { return <SubPage kicker="The Work" kickerColour="#F280AA" title="1:1 Sessions" parentLabel="The Work" parentHref="/the-work" description="Four ways to begin. 1:1 Reset Sessions, Founder Reset, Dating Reset, and Nervous System Reset. Each session type has its own page with booking flow. Pricing is shown on these individual session pages." />; }
