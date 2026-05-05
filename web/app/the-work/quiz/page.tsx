import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
export const metadata: Metadata = { title: 'What Do You Need Right Now?', description: 'Interactive quiz to find the right coaching programme for you.' };
export default function QuizPage() { return <SubPage kicker="The Work" kickerColour="#F280AA" title="What Do You Need Right Now?" parentLabel="The Work" parentHref="/the-work" description="An interactive quiz that routes you to the right 1:1 session based on where you are right now. This will be built as a multi-step interactive component when the CMS is connected." />; }
