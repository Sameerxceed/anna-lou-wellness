import { Metadata } from 'next';
import ProgrammePage from '@/components/ProgrammePage';
import { getStockImage } from '@/data/stock-images';

export const metadata: Metadata = {
  title: 'Signal & Build | 12-Week 1:1 Coaching for Founders',
  description: 'Twelve weeks of 1:1 coaching for founders and leaders. The inner work and the business strategy held together. £3,000.',
  alternates: { canonical: '/the-work/signal-and-build' },
};

export default function SignalAndBuildPage() {
  return (
    <ProgrammePage
      accentColour="#FAA21B"
      hero={{ title: 'Signal & Build.', tagline: 'Twelve weeks. The inner work and the business, held together.', image: getStockImage('work-and-money', 'signal-and-build') }}
      intro={[
        'Signal & Build is Signal with a second track: heart-led business strategy using the Signal Method. For founders, coaches, and leaders who want to regulate their inner world and build from that place. You leave with a rewired inner guidance system and a business direction that comes from your own signal, not from fear, not from what you think you should do.',
      ]}
      sections={[
        {
          label: 'What\'s included',
          body: [
            'Everything in Signal: twelve 1:1 sessions, Voxer support, full inner-world audit',
            'Business strategy sessions interleaved with the inner work — pricing, positioning, capacity, decision-making, team, founder energy',
            'Drawn from twenty years building Anna Lou of London across Harrods, Selfridges, Liberty, Harvey Nichols, Isetan and Henri Bendel',
            'Voxer access widened to include in-the-moment business questions: a pricing decision, a hire, a difficult email',
          ],
        },
        {
          label: 'Who it\'s for',
          body: 'The founder who has built something real and is now navigating the next chapter of it. The one who knows her capacity is the actual constraint, not her strategy. The one who wants the somatic work and the business work in the same room.',
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
