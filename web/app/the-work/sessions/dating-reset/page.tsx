import { Metadata } from 'next';
import ResetSessionPage from '@/components/ResetSessionPage';
import { getStockImage } from '@/data/stock-images';

export const metadata: Metadata = {
  title: 'Dating Reset | 1:1 Coaching Session',
  description: 'Ninety minutes with Anna Lou. £200. Trauma-informed, somatic. For the woman noticing the same pattern showing up again.',
  alternates: { canonical: '/the-work/sessions/dating-reset' },
};

export default function DatingResetPage() {
  return (
    <ResetSessionPage
      name="Dating Reset"
      tagline="For the woman noticing the same pattern showing up again."
      opening="Dating Reset is for the woman who has noticed the same pattern showing up again and is ready to ask why. We do not do dating tips. We do the underneath. The patterns, the attachment shape, the unfinished business with the version of love you grew up with."
      accentColour="#F280AA"
      image={getStockImage('love-and-relationships', 'dating-reset')}
    />
  );
}
