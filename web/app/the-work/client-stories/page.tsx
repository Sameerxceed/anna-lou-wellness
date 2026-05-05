import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
export const metadata: Metadata = { title: 'Client Stories', description: 'What happens when you come home to yourself. Real stories from real clients.' };
export default function ClientStoriesPage() { return <SubPage kicker="The Work" kickerColour="#F280AA" title="Client Stories" parentLabel="The Work" parentHref="/the-work" description="Editorial layout, not a testimonial wall. Real stories from real clients about what happens when you come home to yourself. Each story is a full editorial piece, not a quote card." />; }
