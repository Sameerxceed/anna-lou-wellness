import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
export const metadata: Metadata = { title: 'Ways to Work With Me', description: 'Overview of all coaching programmes. The Signal Method, 1:1 sessions, and group work.' };
export default function WaysPage() { return <SubPage kicker="The Work" kickerColour="#F280AA" title="Ways to Work With Me" parentLabel="The Work" parentHref="/the-work" description="The Signal Method is the umbrella for all the coaching work here. Underneath it sit the programmes, each designed for a different stage of the journey. Whether you are just beginning to notice the patterns, or you are ready to rewire them completely, there is a way in." />; }
