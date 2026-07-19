import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
import { getGenericPageBySlug, genericPageProps } from '@/lib/generic-page';

export const metadata: Metadata = {
  title: 'Ways to Work With Me',
  description: 'Overview of all coaching programmes. The Signal Method, 1:1 sessions, and group work.',
};

export default async function WaysPage() {
  const cms = await getGenericPageBySlug('the-work-ways-to-work-with-me');
  const props = genericPageProps(cms, {
    title: 'Ways to Work With Me',
    kicker: 'Work with Anna',
    kickerColour: '#F280AA',
    parentLabel: 'Work with Anna',
    parentHref: '/the-work',
    stockCategory: 'programmes',
    stockSeed: 'ways-to-work',
    paragraphs: [
      'The Signal Method™ is the umbrella for all the coaching work here. It is a somatic framework Anna developed from fifteen years of personal practice, clinical training (ICF, CPD, TRE®), and working with hundreds of women.',
      'Underneath it sit the programmes, each designed for a different stage of the journey. Whether you are just beginning to notice the patterns, or you are ready to rewire them completely, there is a way in.',
      'The Reset (6 weeks, £1,500) — The starting point. Identify and begin releasing the patterns running your life.',
      'Signal (12 weeks, £3,000) — The deep dive. For women ready to rewire at a deeper level.',
      'Signal & Build (12 weeks, £3,000) — Signal plus business coaching. For founders whose nervous system is affecting their business.',
      'One Day Intensive (enquire) — A full day on the houseboat. Immersive, concentrated work.',
      'The Signal Collective (by application) — Ongoing mastermind for women who have completed a programme and want continued support.',
      'Not sure which is right? Book a free 15-minute 1 to 1 chat.',
    ],
    cta: { label: 'Book a 15-minute 1 to 1 chat', href: '/contact' },
  });
  return <SubPage {...props} />;
}
