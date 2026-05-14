import { Metadata } from 'next';
import ResetSessionPage from '@/components/ResetSessionPage';
import { getStockImage } from '@/data/stock-images';

export const metadata: Metadata = {
  title: 'Founder Reset | 1:1 Coaching Session',
  description: 'Ninety minutes with Anna Lou. £200. Trauma-informed, somatic. For the founder at a sticking point in the business or in herself.',
  alternates: { canonical: '/the-work/sessions/founder-reset' },
};

export default function FounderResetPage() {
  return (
    <ResetSessionPage
      name="Founder Reset"
      tagline="For the founder at a sticking point in the business or in herself."
      opening="Most founder problems are not strategy problems. They are capacity problems wearing strategy clothes. A Founder Reset is the session where we work out which one yours is, and we move it."
      accentColour="#FAA21B"
      image={getStockImage('work-and-money', 'founder-reset')}
    />
  );
}
