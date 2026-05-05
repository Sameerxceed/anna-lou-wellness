import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
export const metadata: Metadata = { title: 'Events Calendar', description: 'Upcoming retreats, live dates, guest experts, and member-only events.' };
export default function EventsPage() { return <SubPage kicker="Community" kickerColour="#231F20" title="Events Calendar" parentLabel="Community" parentHref="/community" description="Upcoming retreats, live dates calendar, guest experts, and member-only events. All in one place, pulling from one source so it stays consistent across the site." />; }
