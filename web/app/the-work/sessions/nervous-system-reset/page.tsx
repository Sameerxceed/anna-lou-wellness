import { Metadata } from 'next';
import ResetSessionPage from '@/components/ResetSessionPage';
import { getStockImage } from '@/data/stock-images';

export const metadata: Metadata = {
  title: 'Nervous System Reset | 1:1 Coaching Session',
  description: 'Ninety minutes with Anna Lou. £200. Trauma-informed, somatic. For the woman whose signal system is scrambled and needs bringing back online.',
  alternates: { canonical: '/the-work/sessions/nervous-system-reset' },
};

export default function NervousSystemResetPage() {
  return (
    <ResetSessionPage
      name="Nervous System Reset"
      tagline="For the woman whose signal system is scrambled and needs bringing back online."
      opening="Nervous System Reset is for the woman whose body has been holding the line for a long time and has started to lose the signal. We do not talk it out. We work with what is happening in the body, gently and slowly, and we bring the signal back online."
      accentColour="#7BAFDD"
      image={getStockImage('programmes', 'nervous-system-reset')}
    />
  );
}
