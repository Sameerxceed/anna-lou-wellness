import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
import FAQAccordion from '@/components/FAQAccordion';
import { getGenericPageBySlug, genericPageProps } from '@/lib/generic-page';
import { getFAQs } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Resource Library',
  description: 'Guides, tools, workshop replays, free nervous system recalibration, and member-only content.',
};

export default async function ResourcesPage() {
  const [cms, faqs] = await Promise.all([
    getGenericPageBySlug('community-resources'),
    getFAQs({ page: 'resources' }),
  ]);
  const props = genericPageProps(cms, {
    title: 'Resource Library',
    kicker: 'Community',
    kickerColour: '#231F20',
    parentLabel: 'Community',
    parentHref: '/community',
    stockCategory: 'community',
    stockSeed: 'resources',
    paragraphs: [
      'Everything you need for the journey, hosted in one place. Free resources available to everyone, plus member-only content for Reset Room subscribers.',
      'Free resources include the Nervous System Recalibration guide (a practice you can do in minutes), the free eBook on healing from narcissistic and domestic abuse, and the Subconscious Clarity Reset Quiz.',
      'Reset Room members get access to the full library: Signal Method™ workbook, all past workshop recordings, founder reset audio, monthly Signal Check practices, and guided somatic exercises.',
      'New resources are added monthly. If you have attended a paid workshop, your recording will appear here within 48 hours.',
    ],
    cta: { label: 'Join the Reset Room', href: '/community/membership' },
  });
  return (
    <>
      <SubPage {...props} />
      <FAQAccordion faqs={faqs} accentColour="#6E3A5A" background="#F5F3EF" />
    </>
  );
}
