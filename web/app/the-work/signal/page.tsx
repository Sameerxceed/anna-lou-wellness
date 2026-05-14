import { Metadata } from 'next';
import ProgrammePage from '@/components/ProgrammePage';

export const metadata: Metadata = {
  title: 'Signal | 12-Week 1:1 Somatic Coaching | Trauma-Informed',
  description: 'Twelve weeks of 1:1 somatic coaching with Anna Lou. The deeper container for women rebuilding the relationship with their own inner guidance system. £3,000.',
  alternates: { canonical: '/the-work/signal' },
};

export default function SignalPage() {
  return (
    <ProgrammePage
      accentColour="#6E3A5A"
      hero={{ title: 'Signal.', tagline: 'Twelve weeks. One-to-one. The deeper container.' }}
      intro={[
        'Twelve weeks is enough time for something to genuinely change. Not the surface, the pattern underneath it. The automatic response that has been running your decisions, your relationships, and your relationship to yourself without your full permission.',
        'Signal is the full twelve-week somatic coaching programme. Inner world rewire, pattern release, belief repatterning, rebuilding from the inside out. Weekly sessions, integration support throughout. Dormant parts of yourself switch back online. What felt fixed becomes fluid.',
      ]}
      sections={[
        {
          label: 'The arc',
          body: [
            'Week one: a full audit of your inner world',
            'Weeks two to five: working on the parts that need attention. Somatic enquiry, IFS, Brainspotting, Flash EMDR, breathwork, pendulum where it fits.',
            'Week six: midpoint review',
            'Weeks seven to eleven: deeper integration',
            'Week twelve: closing integration',
          ],
        },
        {
          label: 'What\'s included',
          body: [
            'Twelve 1:1 sessions, weekly, 60 minutes each',
            'Voxer support Tuesday to Thursday',
            'Personalised Signal Method workbook',
            'Lifetime access to recordings',
            'Optional in-person session at the Hampton studio',
          ],
        },
      ]}
      pricing={{
        label: 'Investment',
        body: '£3,000. Paid in full, or three instalments of £1,000.',
      }}
      cta={{ label: 'Book a discovery call', href: '/contact' }}
    />
  );
}
