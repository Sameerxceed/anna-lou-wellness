import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
import UpcomingExperiences from '@/components/UpcomingExperiences';
import ReviewsSection from '@/components/ReviewsSection';
import FAQAccordion from '@/components/FAQAccordion';
import { ServiceSchema, BreadcrumbSchema, type ReviewInput } from '@/components/StructuredData';
import { getExperienceBySlug, experienceProps } from '@/lib/experience-page';
import { getExperiences, getTestimonials, getFAQs } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Workshops',
  description: 'Group sessions on the houseboat, online, and in corporate spaces. Crystal healing, breathwork, and somatic practice.',
};

export default async function WorkshopsPage() {
  const [cms, upcoming, reviews, faqs] = await Promise.all([
    getExperienceBySlug('workshops'),
    getExperiences('workshop'),
    getTestimonials({ tag: 'workshops' }),
    getFAQs({ page: 'workshops' }),
  ]);
  const props = experienceProps(cms, {
    title: 'Workshops',
    kicker: 'Experiences',
    kickerColour: '#7BAFDD',
    stockCategory: 'experiences',
    stockSeed: 'workshops-hero',
    paragraphs: [
      'Group sessions held on the houseboat at Taggs Island, online, and in corporate spaces. Every workshop includes either full access or a recording and summary so you can engage at whatever level feels right.',
      'Workshops combine somatic practice, breathwork, and honest conversation in an immersive format designed to help you maintain resilience.',
      'Surrendering and Raising Your Vibration is a regular online workshop focused on releasing tension patterns and reconnecting with your body’s natural energy.',
      'All workshop recordings are available in the Reset Room resource library for members.',
    ],
    cta: { label: 'View upcoming workshops', href: '/community/events' },
  });
  return (
    <>
      <ServiceSchema name="Workshops" description="Group somatic workshops on the houseboat at Taggs Island, online, and in corporate spaces. Crystal healing, breathwork, somatic practice." url="/experiences/workshops" reviews={reviews.map((r) => ({ reviewerName: r.reviewerName || 'Anonymous', quote: r.quote, rating: 5 } as ReviewInput))} />
      <BreadcrumbSchema items={[{ name: 'Home', href: '/' }, { name: 'Experiences', href: '/experiences' }, { name: 'Workshops', href: '/experiences/workshops' }]} />
      <SubPage {...props} />
      <UpcomingExperiences items={upcoming} accentColour="#7BAFDD" emptyLabel="Next workshop dates are announced to the mailing list first." />
      <ReviewsSection reviews={reviews} title="From past workshops" kicker="Reviews" kickerColour="#7BAFDD" />
      <FAQAccordion faqs={faqs} accentColour="#7BAFDD" background="#F5F3EF" />
    </>
  );
}
