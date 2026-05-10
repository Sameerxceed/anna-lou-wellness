import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
export const metadata: Metadata = { title: 'Press', description: 'Twenty-five years of press coverage. Harrods, Selfridges, QVC Japan, Disney. Media features, credentials, and press kit.' };
export default function PressPage() {
  return <SubPage kicker="About" kickerColour="#231F20" title="Press" parentLabel="About" parentHref="/about"
    paragraphs={[
      'Twenty-five years of press coverage. From the first piece about someone selling handmade jewellery on Portobello Road, to Harrods, Selfridges, Liberty, Harvey Nichols, QVC Japan, Disney, and Henri Bendel New York.',
      'For most of those years the press was about the brand and the jewellery. More recently the coverage has shifted. The coaching, the houseboat, the pivot. The question is no longer just how did you build it — but what did building it cost you, what did you learn, and who are you now.',
      'Anna holds ICF coaching accreditation, CPD certification, and is a certified TRE® provider. She is a somatic trauma-informed coach specialising in nervous system regulation and healing from narcissistic abuse.',
      'For press enquiries, interviews, podcast appearances, and media features, please contact hello@annalouwellness.com.',
    ]}
    details={[
      { label: 'Credentials', value: 'ICF Accredited, CPD Certified, TRE® Provider' },
      { label: 'Featured in', value: 'Harrods, Selfridges, Liberty, Harvey Nichols, QVC Japan, Disney' },
      { label: 'International', value: 'Isetan Tokyo, Hankyu Tokyo, Henri Bendel New York' },
    ]}
    cta={{ label: 'Press enquiries', href: '/contact' }}
  />;
}
