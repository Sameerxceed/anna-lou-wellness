import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
export const metadata: Metadata = { title: 'Speaking', description: 'Anna speaks on somatic coaching, the founder journey, and nervous system regulation.' };
export default function SpeakingPage() {
  return <SubPage kicker="Experiences" kickerColour="#7BAFDD" title="Speaking" parentLabel="Experiences" parentHref="/experiences"
    paragraphs={[
      'Anna speaks on somatic coaching, the founder journey, nervous system regulation, and building a business from the body up. Available for conferences, panels, podcasts, and private events.',
      'Her story spans twenty-five years: from Portobello Road to Harrods and Selfridges, through a complete personal and professional rebuild, to founding a wellness practice from a houseboat on Taggs Island.',
      'Topics include: the founder nervous system (how your body makes your business decisions), what somatic coaching actually is (and what it is absolutely not), healing from narcissistic abuse, the Signal Method\u2122, and the intersection of creativity, trauma, and resilience.',
      'Anna\u2019s speaking style is direct, honest, and grounded in lived experience. She does not do corporate platitudes. She tells the real version.',
      'For speaking enquiries and booking, please contact hello@annalouwellness.com.',
    ]}
    cta={{ label: 'Book Anna to speak', href: '/contact' }}
  />;
}
