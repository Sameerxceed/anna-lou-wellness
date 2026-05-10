import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
export const metadata: Metadata = { title: 'The Returning Circle', description: 'Every Tuesday at The Hare and the Moon, Twickenham. Donation-based. No agenda except being in the room together.' };
export default function CirclePage() {
  return <SubPage kicker="Community" kickerColour="#231F20" title="The Returning Circle" parentLabel="Community" parentHref="/community"
    paragraphs={[
      'Every Tuesday evening I hold a circle at The Hare and the Moon in Twickenham. Donation-based. Open to everyone. No booking required.',
      'What it is: a room. People who are honest. No advice. No fixing. No cross-talk. Just being in the presence of other humans who are willing to say what\'s actually going on.',
      'What it is not: therapy, a support group, a workshop, or anything with a curriculum. There is no programme. There is no progression. You come when you need to. You stop when you\'re done.',
      'Most people who come for the first time look nervous. By the end of the evening something in them has settled. Not because anything dramatic happened. Because they were in a room where they didn\'t have to perform. That sounds like nothing. It\'s actually everything.',
      'Connection is biological. Your nervous system needs co-regulation. It needs other regulated humans. That\'s not self-help language. That\'s neuroscience.',
    ]}
    details={[
      { label: 'When', value: 'Every Tuesday evening' },
      { label: 'Where', value: 'The Hare and the Moon, Twickenham' },
      { label: 'Cost', value: 'Donation-based' },
      { label: 'Booking', value: 'Not required — just come' },
    ]}
  />;
}
