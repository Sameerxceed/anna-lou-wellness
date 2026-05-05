import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
export const metadata: Metadata = { title: 'Retreats', description: 'Reset days at Taggs Island, Hampton. Water outside, no agenda, just space to come back to yourself.' };
export default function RetreatPage() { return <SubPage kicker="Experiences" kickerColour="#7BAFDD" title="Retreats" parentLabel="Experiences" parentHref="/experiences" description="A few times a year, a small group comes to Taggs Island, Hampton for a full reset day. Water outside, no agenda, just space to come back to yourself. Each retreat is designed around the Signal Method and guided by Anna." />; }
