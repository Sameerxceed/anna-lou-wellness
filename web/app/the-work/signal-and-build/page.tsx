import { Metadata } from 'next';
import ProgrammePage from '@/components/ProgrammePage';
import ReviewsSection from '@/components/ReviewsSection';
import FAQAccordion from '@/components/FAQAccordion';
import { ServiceSchema, BreadcrumbSchema, type ReviewInput } from '@/components/StructuredData';
import { getStockImage } from '@/data/stock-images';
import { getProgrammeBySlug, programmeProps } from '@/lib/programme';
import { getTestimonials, getFAQs } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Signal & Build | 12-Week 1:1 Coaching for Founders',
  description: 'Twelve weeks of 1:1 coaching for founders and leaders. The inner work and the business strategy held together. £3,000.',
  alternates: { canonical: '/the-work/signal-and-build' },
};

export default async function SignalAndBuildPage() {
  const [cms, reviews, faqs] = await Promise.all([
    getProgrammeBySlug('signal-and-build'),
    getTestimonials({ tag: 'signal-and-build' }),
    getFAQs({ page: 'signal-and-build' }),
  ]);
  const props = programmeProps(cms, {
    title: 'Signal & Build.',
    tagline: 'Twelve weeks. The inner work and the business, held together.',
    accentColour: '#FAA21B',
    image: getStockImage('work-and-money', 'signal-and-build'),
    intro: [
      'Signal & Build is Signal with a second track: heart-led business strategy using the Signal Method. For founders, coaches, and leaders who want to regulate their inner world and build from that place.',
    ],
    whatsIncludedItems: [
      'Everything in Signal: twelve 1:1 sessions, Voxer support, full inner-world audit',
      'Business strategy sessions interleaved with the inner work — pricing, positioning, capacity, decision-making, team, founder energy',
      'Drawn from twenty years building Anna Lou of London across Harrods, Selfridges, Liberty, Harvey Nichols',
      'Voxer access widened to include in-the-moment business questions',
    ],
    pricingBody: '£3,000. Paid in full, or three instalments of £1,000.',
    ctaLabel: 'Book Signal & Build',
    ctaUrl: '/contact',
  });
  return (
    <>
      <ServiceSchema name="Signal & Build" description="Twelve weeks of 1:1 coaching for founders. Inner work and business strategy held together." url="/the-work/signal-and-build" price="3000" reviews={reviews.map((r) => ({ reviewerName: r.reviewerName || 'Anonymous', quote: r.quote, rating: 5 } as ReviewInput))} />
      <BreadcrumbSchema items={[{ name: 'Home', href: '/' }, { name: 'Work with Anna', href: '/the-work' }, { name: 'Signal & Build', href: '/the-work/signal-and-build' }]} />
      <ProgrammePage {...props} />
      <ReviewsSection reviews={reviews} title="From founder clients" kicker="Reviews" kickerColour="#FAA21B" />
      <FAQAccordion faqs={faqs} accentColour="#FAA21B" background="#F5F3EF" />
    </>
  );
}
