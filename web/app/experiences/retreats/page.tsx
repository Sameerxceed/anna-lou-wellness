import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
import UpcomingExperiences from '@/components/UpcomingExperiences';
import ReviewsSection from '@/components/ReviewsSection';
import FAQAccordion from '@/components/FAQAccordion';
import UpsellBlock, { type UpsellItem } from '@/components/UpsellBlock';
import { ServiceSchema, BreadcrumbSchema, type ReviewInput } from '@/components/StructuredData';
import { getExperienceBySlug, experienceProps } from '@/lib/experience-page';
import { getExperiences, getTestimonials, getFAQs } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Retreats',
  description: 'Reset days at Taggs Island, Hampton. Six people maximum. No phones, no fixed agenda.',
};

export default async function RetreatPage() {
  const [cms, upcoming, reviews, faqs] = await Promise.all([
    getExperienceBySlug('retreats'),
    getExperiences('retreat'),
    getTestimonials({ tag: 'retreats' }),
    getFAQs({ page: 'retreats' }),
  ]);
  const props = experienceProps(cms, {
    title: 'Retreats',
    kicker: 'Experiences',
    kickerColour: '#7BAFDD',
    stockCategory: 'houseboat',
    stockSeed: 'retreats-hero',
    paragraphs: [
      'A few times a year, a small group comes to Taggs Island, Hampton for a full reset day. Six people maximum. No phones, no fixed agenda.',
      'We work with whatever the group needs — breathwork, somatic practice, the Signal Method™, honest conversation. People arrive wound tight and leave softer.',
      'The houseboat is surrounded by water on all sides. There is something about being on the river that strips away everything that is not real. The space itself does half the work.',
      'Each retreat includes a full day of guided practice, lunch prepared on the houseboat, and a take-home integration guide. There is no curriculum — just space, presence, and the work.',
      'Retreats are announced to the mailing list first. Sign up to Reset Letters for priority access.',
    ],
    // Anna 14 Jul feedback: remove "Register interest" button. The page
    // should only display the available retreats — no generic CTA.
    // Passing undefined suppresses the CTA row entirely.
    cta: undefined,
  });
  return (
    <>
      <ServiceSchema name="Retreats" description="Reset days at Taggs Island, Hampton. Six people maximum. Somatic practice, breathwork, Signal Method on the water." url="/experiences/retreats" reviews={reviews.map((r) => ({ reviewerName: r.reviewerName || 'Anonymous', quote: r.quote, rating: 5 } as ReviewInput))} />
      <BreadcrumbSchema items={[{ name: 'Home', href: '/' }, { name: 'Experiences', href: '/experiences' }, { name: 'Retreats', href: '/experiences/retreats' }]} />
      <SubPage {...props} />
      <UpcomingExperiences items={upcoming} accentColour="#7BAFDD" emptyLabel="Next retreat dates are announced to the mailing list first." />
      <ReviewsSection reviews={reviews} title="From past retreats" kicker="Reviews" kickerColour="#7BAFDD" />
      <FAQAccordion faqs={faqs} accentColour="#7BAFDD" background="#F5F3EF" />
      <UpsellBlock items={(cms?.upsells as UpsellItem[] | undefined) || []} title="Where next." kicker="Continue your journey" />
    </>
  );
}
