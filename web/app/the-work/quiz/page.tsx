import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
export const metadata: Metadata = { title: 'What Do You Need Right Now?', description: 'Find the right coaching programme for you. Nervous System Decoder quiz.' };
export default function QuizPage() {
  return <SubPage kicker="The Work" kickerColour="#F280AA" title="What Do You Need Right Now?" parentLabel="The Work" parentHref="/the-work"
    paragraphs={[
      'Not sure where to start? This quiz helps you identify what your nervous system needs right now and routes you to the right programme.',
      'It is not a diagnostic tool. It is a starting point \u2014 a way to cut through the noise and find the door that is already open for you.',
      'The Nervous System Decoder takes less than three minutes. At the end, you will receive a personalised recommendation based on where you are right now: The Reset (6 weeks), Signal (12 weeks), Signal & Build (12 weeks + business), or the One Day Intensive.',
      'The interactive quiz is coming soon. In the meantime, book a free 15-minute discovery call and Anna will help you find the right fit.',
    ]}
    cta={{ label: 'Book a free discovery call', href: '/contact' }}
  />;
}
