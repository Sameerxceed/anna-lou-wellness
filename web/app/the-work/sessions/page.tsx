import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
export const metadata: Metadata = { title: '1:1 Sessions', description: 'Reset Sessions, Founder Reset, Signal programmes. 1:1 coaching with Anna.' };
export default function SessionsPage() {
  return <SubPage kicker="The Work" kickerColour="#F280AA" title="1:1 Sessions" parentLabel="The Work" parentHref="/the-work"
    paragraphs={[
      'The Reset is the starting point. Six weeks of 1:1 somatic coaching designed to identify and begin releasing the patterns that are running your life. Not talking therapy. Body-based, nervous-system work that gets underneath the stories.',
      'Signal is the twelve-week deep dive. For women who have done some initial work and are ready to rewire at a deeper level. We work with the Signal Method\u2122 \u2014 a framework Anna developed from fifteen years of personal practice and clinical training.',
      'Signal & Build adds business coaching to the Signal programme. For founders and entrepreneurs who know their nervous system is affecting their business decisions.',
      'The One Day Intensive is a full day on the houseboat. For women who want immersive, concentrated work without the multi-week commitment.',
      'All sessions are available in person on Taggs Island or online via Zoom. Both are equally effective \u2014 the modalities used work in both settings.',
    ]}
    details={[
      { label: 'The Reset', value: '6 weeks \u00B7 \u00A31,500' },
      { label: 'Signal', value: '12 weeks \u00B7 \u00A33,000' },
      { label: 'Signal & Build', value: '12 weeks \u00B7 \u00A33,000' },
      { label: 'One Day Intensive', value: '1 day \u00B7 Enquire' },
      { label: 'The Signal Collective', value: 'Ongoing \u00B7 By application' },
    ]}
    cta={{ label: 'Book a free discovery call', href: '/contact' }}
  />;
}
