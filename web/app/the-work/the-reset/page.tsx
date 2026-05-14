import { Metadata } from 'next';
import ProgrammePage from '@/components/ProgrammePage';
import { getStockImage } from '@/data/stock-images';

export const metadata: Metadata = {
  title: 'The Reset | 6-Week 1:1 Somatic Coaching Programme',
  description: 'Six weeks of 1:1 somatic coaching with Anna Lou. Nervous-system led, trauma-informed, designed to bring your signal system back online. £1,500.',
  alternates: { canonical: '/the-work/the-reset' },
};

export default function TheResetPage() {
  return (
    <ProgrammePage
      accentColour="#F280AA"
      hero={{ title: 'The Reset.', tagline: 'Six weeks. One-to-one. Signal back online.', image: getStockImage('programmes', 'the-reset') }}
      intro={[
        'Most people arrive at The Reset after trying everything else. The therapy. The journalling. The courses. The spiritual work. Getting all the way to the insight, and then hitting the same wall.',
        'The Reset is six weeks, 1:1, working directly with your inner guidance system. Not the story. Not the intellectual understanding of the pattern. The actual place the pattern lives, in the body, in the automatic responses that fire before your conscious mind catches up.',
        'Most of us spend years trying to fight the current. The Reset is the work of learning to stop gripping. Because when you stop gripping you realise the river was always guiding you. Your inner guidance system was never broken. It was waiting for you to stop overriding it.',
        'Week one: baseline. Where are you arriving from? What is your inner world doing right now? What does safety feel like in your body, and how long since you genuinely felt it? This is the diagnostic that determines what the next five weeks need to do.',
        'By week three something usually shifts. A decision becomes clear. A pattern stops activating the same response. Your inner guidance system comes back online and you realise it has been trying to speak to you for a very long time.',
      ]}
      sections={[
        {
          label: 'What\'s included',
          body: [
            'Six 1:1 sessions, weekly, 60 minutes each',
            'Voxer support between sessions, Tuesday to Thursday',
            'Starting audit of your inner world',
            'Tools that fit your actual life',
            'A clear close at week six. Many clients roll into Signal. Many do not need to.',
          ],
        },
      ]}
      pricing={{
        label: 'Investment',
        body: '£1,500. Paid in full at booking, or two instalments of £750 across the six weeks. If you are not sure, book a free fifteen-minute discovery call. We will know quickly.',
      }}
      cta={{ label: 'Book a discovery call', href: '/contact' }}
    />
  );
}
