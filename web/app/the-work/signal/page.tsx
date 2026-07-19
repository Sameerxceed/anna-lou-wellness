import { Metadata } from 'next';
import ProgrammePage from '@/components/ProgrammePage';
import ReviewsSection from '@/components/ReviewsSection';
import FAQAccordion from '@/components/FAQAccordion';
import { ServiceSchema, BreadcrumbSchema, type ReviewInput } from '@/components/StructuredData';
import { getStockImage } from '@/data/stock-images';
import { getProgrammeBySlug, programmeProps } from '@/lib/programme';
import { getTestimonials, getFAQs } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Signal | 12-Week 1:1 Somatic Coaching | Trauma-Informed',
  description: 'Twelve weeks of 1:1 somatic coaching with Anna Lou. The deeper container for women rebuilding the relationship with their own inner guidance system. £3,000.',
  alternates: { canonical: '/the-work/signal' },
};

export default async function SignalPage() {
  const [cms, reviews, faqs] = await Promise.all([
    getProgrammeBySlug('signal'),
    getTestimonials({ tag: 'signal' }),
    getFAQs({ page: 'signal' }),
  ]);
  const props = programmeProps(cms, {
    title: 'Signal.',
    tagline: 'Twelve weeks. One-to-one. The deeper container.',
    accentColour: '#6E3A5A',
    image: getStockImage('programmes', 'signal'),
    intro: [
      'Twelve weeks is enough time for something to genuinely change. Not the surface, the pattern underneath it. The automatic response that has been running your decisions, your relationships, and your relationship to yourself without your full permission.',
      'Signal is the full twelve-week somatic coaching programme. Inner world rewire, pattern release, belief repatterning, rebuilding from the inside out. Weekly sessions, integration support throughout.',
    ],
    whatsIncludedItems: [
      'Twelve 1:1 sessions, weekly, 60 minutes each',
      'Voxer support Tuesday to Thursday',
      'Personalised Signal Method workbook',
      'Lifetime access to recordings',
      'Optional in-person session at the Hampton studio',
    ],
    pricingBody: '£3,000. Paid in full, or three instalments of £1,000.',
    ctaLabel: 'Book Signal',
    ctaUrl: '/contact',
  });
  return (
    <>
      <ServiceSchema name="Signal" description="Twelve weeks of 1:1 somatic coaching for women rebuilding the relationship with their own inner guidance system." url="/the-work/signal" price="3000" reviews={reviews.map((r) => ({ reviewerName: r.reviewerName || 'Anonymous', quote: r.quote, rating: 5 } as ReviewInput))} />
      <BreadcrumbSchema items={[{ name: 'Home', href: '/' }, { name: 'Work with Anna', href: '/the-work' }, { name: 'Signal', href: '/the-work/signal' }]} />
      <ProgrammePage {...props} />
      <ReviewsSection reviews={reviews} title="From Signal alumnae" kicker="Reviews" kickerColour="#6E3A5A" />
      <FAQAccordion faqs={faqs} accentColour="#6E3A5A" background="#F5F3EF" />
    </>
  );
}
