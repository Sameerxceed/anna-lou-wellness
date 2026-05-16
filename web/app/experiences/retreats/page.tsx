import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
import { getExperienceBySlug, experienceProps } from '@/lib/experience-page';

export const metadata: Metadata = {
  title: 'Retreats',
  description: 'Reset days at Taggs Island, Hampton. Six people maximum. No phones, no fixed agenda.',
};

export default async function RetreatPage() {
  const cms = await getExperienceBySlug('retreats');
  const props = experienceProps(cms, {
    title: 'Retreats',
    kicker: 'Experiences',
    kickerColour: '#7BAFDD',
    stockCategory: 'houseboat',
    stockSeed: 'retreats-hero',
    paragraphs: [
      'A few times a year, a small group comes to Taggs Island, Hampton for a full reset day. Six people maximum. No phones, no fixed agenda.',
      'We work with whatever the group needs — breathwork, somatic practice, the Signal Method™, honest conversation. People arrive wound tight and leave softer.',
      'The houseboat is surrounded by water on all sides. There is something about being on the river that strips away everything that is not real. The space itself does half the work.',
      'Each retreat includes a full day of guided practice, lunch prepared on the houseboat, and a take-home integration guide. There is no curriculum — just space, presence, and the work.',
      'Retreats are announced to the mailing list first. Sign up to Reset Letters for priority access.',
    ],
    cta: { label: 'Register interest', href: '/contact' },
  });
  return <SubPage {...props} />;
}
