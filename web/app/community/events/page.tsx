import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
export const metadata: Metadata = { title: 'Events Calendar', description: 'Upcoming retreats, workshops, crystal parties, live dates, and member-only events.' };
export default function EventsPage() {
  return <SubPage kicker="Community" kickerColour="#231F20" title="Events Calendar" parentLabel="Community" parentHref="/community"
    paragraphs={[
      'All upcoming events in one place. Retreats on Taggs Island, workshops (online and in person), crystal parties, crystal wellbeing gatherings, and member-only Reset Room sessions.',
      'Crystal parties are available for children (ages 6\u201312 with The Sparkle Fairy Godmother), teens (13\u201317), and adults. Each gathering combines crystal exploration, jewellery making, mindfulness, and creative activities.',
      'The Crystal Clear Business Vortex is a journey to success \u2014 an immersive workshop combining crystal healing, breathwork, and entrepreneurial strategy.',
      'FREE Crystal Healing: Surrender & Sparkle is a complimentary online session open to everyone. No booking fee, just come as you are.',
      'For bespoke corporate events and private bookings, please get in touch directly.',
    ]}
    cta={{ label: 'Enquire about events', href: '/contact' }}
  />;
}
