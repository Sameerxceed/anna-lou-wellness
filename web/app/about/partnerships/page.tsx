import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
export const metadata: Metadata = { title: 'Work With Me — Partnerships', description: 'Partnership and collaboration enquiries. Brand collaborations, sponsorship, and joint ventures.' };
export default function PartnershipsPage() {
  return <SubPage kicker="About" kickerColour="#231F20" title="Work With Me" parentLabel="About" parentHref="/about"
    paragraphs={[
      'Anna Lou Wellness is open to collaborations that align with the brand\'s values: honest storytelling, somatic wellbeing, ethical production, and supporting women through real transformation.',
      'Previous collaborations include Harrods, Selfridges, Harvey Nichols, Liberty, Disney, Hello Kitty, Ray-Ban, QVC Japan, and a range of independent retailers worldwide.',
      'We are interested in brand partnerships, product collaborations, editorial sponsorships, and event co-hosting. If what you do supports women coming back to themselves, we want to hear from you.',
      'For all enquiries, please email hello@annalouwellness.com with a brief outline of what you have in mind.',
    ]}
    cta={{ label: 'Get in touch', href: '/contact' }}
  />;
}
