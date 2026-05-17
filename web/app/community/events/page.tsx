import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
import { getCommunityEventBySlug, genericPageProps } from '@/lib/generic-page';

export const metadata: Metadata = {
  title: 'Events Calendar',
  description: 'Upcoming retreats, workshops, live dates, and member-only events.',
};

export default async function EventsPage() {
  const cms = await getCommunityEventBySlug('events');
  const props = genericPageProps(cms, {
    title: 'Events Calendar',
    kicker: 'Community',
    kickerColour: '#231F20',
    parentLabel: 'Community',
    parentHref: '/community',
    stockCategory: 'community',
    stockSeed: 'events',
    paragraphs: [
      'All upcoming events in one place. Retreats on Taggs Island, workshops (online and in person), and member-only Reset Room sessions.',
      'For bespoke corporate events and private bookings, please get in touch directly.',
    ],
    cta: { label: 'Enquire about events', href: '/contact' },
  });
  return <SubPage {...props} />;
}
