import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
import { getExperienceBySlug, experienceProps } from '@/lib/experience-page';

export const metadata: Metadata = {
  title: 'Workshops',
  description: 'Group sessions on the houseboat, online, and in corporate spaces. Crystal healing, breathwork, and somatic practice.',
};

export default async function WorkshopsPage() {
  const cms = await getExperienceBySlug('workshops');
  const props = experienceProps(cms, {
    title: 'Workshops',
    kicker: 'Experiences',
    kickerColour: '#7BAFDD',
    stockCategory: 'experiences',
    stockSeed: 'workshops-hero',
    paragraphs: [
      'Group sessions held on the houseboat at Taggs Island, online, and in corporate spaces. Every workshop includes either full access or a recording and summary so you can engage at whatever level feels right.',
      'Workshops combine somatic practice, breathwork, and honest conversation in an immersive format designed to help you maintain resilience.',
      'Surrendering and Raising Your Vibration is a regular online workshop focused on releasing tension patterns and reconnecting with your body’s natural energy.',
      'All workshop recordings are available in the Reset Room resource library for members.',
    ],
    cta: { label: 'View upcoming workshops', href: '/community/events' },
  });
  return <SubPage {...props} />;
}
