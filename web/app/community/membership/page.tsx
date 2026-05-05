import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
export const metadata: Metadata = { title: 'The Reset Room — Membership', description: 'Monthly membership. Live group calls, workshop replays, Signal Method workbook, resource library, and community.' };
export default function MembershipPage() { return <SubPage kicker="Community" kickerColour="#231F20" title="The Reset Room" parentLabel="Community" parentHref="/community" description="Monthly live group calls (90 mins, Zoom), workshop replay library, Signal Method workbook, founder reset audio, full resource library, community space, and early retreat booking. A deeper container for the work. Stripe subscription checkout will be added here." />; }
