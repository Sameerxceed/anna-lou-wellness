import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
export const metadata: Metadata = { title: 'Resource Library', description: 'Guides, tools, workshop replays, and member-only content.' };
export default function ResourcesPage() { return <SubPage kicker="Community" kickerColour="#231F20" title="Resource Library" parentLabel="Community" parentHref="/community" description="Guides, tools, workshop replays, and member-only content. Everything you need for the journey, hosted in one place. Member-only content requires Reset Room membership." />; }
