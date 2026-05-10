import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
export const metadata: Metadata = { title: 'Ways to Work With Me', description: 'Overview of all coaching programmes. The Signal Method, 1:1 sessions, and group work.' };
export default function WaysPage() {
  return <SubPage kicker="The Work" kickerColour="#F280AA" title="Ways to Work With Me" parentLabel="The Work" parentHref="/the-work"
    paragraphs={[
      'The Signal Method\u2122 is the umbrella for all the coaching work here. It is a somatic framework Anna developed from fifteen years of personal practice, clinical training (ICF, CPD, TRE\u00AE), and working with hundreds of women.',
      'Underneath it sit the programmes, each designed for a different stage of the journey. Whether you are just beginning to notice the patterns, or you are ready to rewire them completely, there is a way in.',
      'The Reset (6 weeks, \u00A31,500) \u2014 The starting point. Identify and begin releasing the patterns running your life.',
      'Signal (12 weeks, \u00A33,000) \u2014 The deep dive. For women ready to rewire at a deeper level.',
      'Signal & Build (12 weeks, \u00A33,000) \u2014 Signal plus business coaching. For founders whose nervous system is affecting their business.',
      'One Day Intensive (enquire) \u2014 A full day on the houseboat. Immersive, concentrated work.',
      'The Signal Collective (by application) \u2014 Ongoing mastermind for women who have completed a programme and want continued support.',
      'Not sure which is right? Book a free 15-minute discovery call.',
    ]}
    cta={{ label: 'Book a discovery call', href: '/contact' }}
  />;
}
