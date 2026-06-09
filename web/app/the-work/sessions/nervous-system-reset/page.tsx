import { Metadata } from 'next';
import ResetSessionPage from '@/components/ResetSessionPage';
import { getStockImage } from '@/data/stock-images';
import { getProgrammeBySlug } from '@/lib/programme';
import { mediaUrl } from '@/lib/strapi';

export const metadata: Metadata = {
  title: 'Nervous System Reset | 1:1 Coaching Session',
  description: 'Ninety minutes with Anna Lou. £200. Trauma-informed, somatic. For the woman whose signal system is scrambled and needs bringing back online.',
  alternates: { canonical: '/the-work/sessions/nervous-system-reset' },
};

export default async function NervousSystemResetPage() {
  const cms = await getProgrammeBySlug('nervous-system-reset');
  return (
    <ResetSessionPage
      name={cms?.title || 'Nervous System Reset'}
      tagline={cms?.tagline || 'For the woman whose signal system is scrambled and needs bringing back online.'}
      opening={cms?.intro || 'Nervous System Reset is for the woman whose body has been holding the line for a long time and has started to lose the signal. We do not talk it out. We work with what is happening in the body, gently and slowly, and we bring the signal back online.'}
      accentColour={cms?.accentColour || '#7BAFDD'}
      image={mediaUrl(cms?.heroImage as { url?: string } | undefined) || getStockImage('programmes', 'nervous-system-reset')}
      bookingUrl={cms?.ctaUrl || undefined}
      bookingLabel={cms?.ctaLabel ? `${cms.ctaLabel} →` : undefined}
    />
  );
}
