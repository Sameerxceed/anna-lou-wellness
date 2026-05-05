import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
export const metadata: Metadata = { title: 'Corporate Wellbeing', description: 'Bespoke wellbeing formats for teams and organisations.' };
export default function CorporatePage() { return <SubPage kicker="Experiences" kickerColour="#7BAFDD" title="Corporate Wellbeing" parentLabel="Experiences" parentHref="/experiences" description="Bespoke formats for teams and organisations. Workshops, keynotes, and ongoing wellbeing programmes tailored to your workplace. The Signal Method adapted for corporate environments." />; }
