import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
export const metadata: Metadata = { title: 'Workshops', description: 'Group sessions on the houseboat, online, and in corporate spaces. Crystal healing, breathwork, and somatic practice.' };
export default function WorkshopsPage() {
  return <SubPage kicker="Experiences" kickerColour="#7BAFDD" title="Workshops" parentLabel="Experiences" parentHref="/experiences"
    paragraphs={[
      'Group sessions held on the houseboat at Taggs Island, online, and in corporate spaces. Every workshop includes either full access or a recording and summary so you can engage at whatever level feels right.',
      'Workshops combine crystal healing, breathwork, jewellery-making, and restorative somatic practices. The Sparkle Club format brings all of these together in an immersive experience designed to help you maintain resilience and inner sparkle.',
      'Surrendering and Raising Your Vibration is a regular online workshop focused on releasing tension patterns and reconnecting with your body\u2019s natural energy.',
      'Crystal Clear Business Vortex is a journey to success \u2014 combining crystal healing with entrepreneurial strategy for founders and business owners.',
      'FREE Crystal Healing: Surrender & Sparkle is a complimentary session open to everyone, available online. No booking fee required.',
      'All workshop recordings are available in the Reset Room resource library for members.',
    ]}
    cta={{ label: 'View upcoming workshops', href: '/community/events' }}
  />;
}
