import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
import UpcomingExperiences from '@/components/UpcomingExperiences';
import FAQAccordion from '@/components/FAQAccordion';
import { getCommunityEventBySlug, genericPageProps } from '@/lib/generic-page';
import { getExperiences, getFAQs } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Events Calendar',
  description: 'Upcoming retreats, workshops, live dates, and member-only events.',
};

export default async function EventsPage() {
  const [cms, upcoming, faqs] = await Promise.all([
    getCommunityEventBySlug('events'),
    getExperiences(),
    getFAQs({ page: 'events' }),
  ]);
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
  return (
    <>
      <SubPage {...props} />
      <UpcomingExperiences items={upcoming} accentColour="#231F20" emptyLabel="No public events on the calendar right now. New dates land monthly — sign up to Reset Letters for the first heads-up." />
      <FAQAccordion faqs={faqs} accentColour="#6E3A5A" background="#F5F3EF" />
    </>
  );
}
