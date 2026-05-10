import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
export const metadata: Metadata = { title: 'Retreats', description: 'Reset days at Taggs Island, Hampton. Six people maximum. No phones, no fixed agenda.' };
export default function RetreatPage() {
  return <SubPage kicker="Experiences" kickerColour="#7BAFDD" title="Retreats" parentLabel="Experiences" parentHref="/experiences"
    paragraphs={[
      'A few times a year, a small group comes to Taggs Island, Hampton for a full reset day. Six people maximum. No phones, no fixed agenda.',
      'We work with whatever the group needs \u2014 breathwork, somatic practice, the Signal Method\u2122, honest conversation. People arrive wound tight and leave softer.',
      'The houseboat is surrounded by water on all sides. There is something about being on the river that strips away everything that is not real. The space itself does half the work.',
      'Each retreat includes a full day of guided practice, lunch prepared on the houseboat, and a take-home integration guide. There is no curriculum \u2014 just space, presence, and the work.',
      'Retreats are announced to the mailing list first. Sign up to Reset Letters for priority access.',
    ]}
    details={[
      { label: 'Location', value: 'Taggs Island, Hampton, London' },
      { label: 'Group size', value: 'Maximum 6 people' },
      { label: 'Duration', value: 'Full day (10am\u20134pm)' },
      { label: 'Next date', value: 'September 2026' },
    ]}
    cta={{ label: 'Register interest', href: '/contact' }}
  />;
}
