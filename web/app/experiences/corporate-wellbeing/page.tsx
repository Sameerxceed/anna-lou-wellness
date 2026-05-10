import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
export const metadata: Metadata = { title: 'Corporate Wellbeing', description: 'Bespoke wellbeing formats for teams and organisations. The Signal Method adapted for the workplace.' };
export default function CorporatePage() {
  return <SubPage kicker="Experiences" kickerColour="#7BAFDD" title="Corporate Wellbeing" parentLabel="Experiences" parentHref="/experiences"
    paragraphs={[
      'Bespoke formats for teams and organisations. Workshops, keynotes, and ongoing wellbeing programmes tailored to your workplace. The Signal Method\u2122 adapted for corporate environments.',
      'The Level Up and Sparkle programme is a corporate wellness mini-retreat designed to build team resilience, reduce burnout, and create space for honest conversation in a professional setting.',
      'Formats range from a single 90-minute session to a full-day immersive experience. Available in person at your workplace, on the houseboat at Taggs Island, or online.',
      'Anna brings fifteen years of entrepreneurial experience and clinical somatic training to every corporate engagement. This is not generic mindfulness. This is nervous system work that actually changes how people show up.',
      'For bespoke proposals and pricing, please get in touch.',
    ]}
    cta={{ label: 'Request a proposal', href: '/contact' }}
  />;
}
