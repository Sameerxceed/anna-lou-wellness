import { Metadata } from 'next';
import ResetSessionPage from '@/components/ResetSessionPage';
import { getStockImage } from '@/data/stock-images';
import { getProgrammeBySlug } from '@/lib/programme';
import { mediaUrl } from '@/lib/strapi';

export const metadata: Metadata = {
  title: 'Dating Reset | 1:1 Coaching Session',
  description: 'Ninety minutes with Anna Lou. £200. Trauma-informed, somatic. For the woman noticing the same pattern showing up again.',
  alternates: { canonical: '/the-work/sessions/dating-reset' },
};

export default async function DatingResetPage() {
  const cms = await getProgrammeBySlug('dating-reset');
  return (
    <ResetSessionPage
      name={cms?.title || 'Dating Reset'}
      tagline={cms?.tagline || 'For the woman noticing the same pattern showing up again.'}
      opening={cms?.intro || 'Dating Reset is for the woman who has noticed the same pattern showing up again and is ready to ask why. We do not do dating tips. We do the underneath. The patterns, the attachment shape, the unfinished business with the version of love you grew up with.'}
      accentColour={cms?.accentColour || '#F280AA'}
      image={mediaUrl(cms?.heroImage as { url?: string } | undefined) || getStockImage('love-and-relationships', 'dating-reset')}
    />
  );
}
