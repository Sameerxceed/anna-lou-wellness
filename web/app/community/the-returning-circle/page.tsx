import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
export const metadata: Metadata = { title: 'The Returning Circle', description: 'Every Tuesday at The Hare and the Moon, Twickenham. Donation-based. No agenda except being in the room together.' };
export default function CirclePage() { return <SubPage kicker="Community" kickerColour="#231F20" title="The Returning Circle" parentLabel="Community" parentHref="/community" description="Every Tuesday I hold a circle at The Hare and the Moon, Twickenham. Donation-based. No agenda except being in the room together. Connection is not a concept. It is biological. The Returning Circle runs every week without exception. No waitlist needed. Come on Tuesday." />; }
