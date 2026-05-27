import { Metadata } from 'next';
import { fetchAPI } from '@/lib/strapi';
import { getFAQs } from '@/lib/cms';
import FAQAccordion from '@/components/FAQAccordion';
import QuizClient, { type QuizHeroData, type QuizResultData, type Recommendation } from './QuizClient';

export const metadata: Metadata = {
  title: 'What do you need right now? | The Signal Method Quiz',
  description: 'Five short questions, two minutes. Get a recommendation tuned to where you actually are right now. No email required.',
  alternates: { canonical: '/the-work/quiz' },
};

export const dynamic = 'force-dynamic';

// Hardcoded fallback used only if the CMS singleton is unreachable. Anna
// edits the live content via Quick Edit > Work · Quiz.
const heroFallback: QuizHeroData = {
  eyebrow: 'Five questions. Two minutes.',
  title: 'What do you need right now?',
  intro: 'There are six possible starting points with Anna — the free Nervous System Decoder, the Reset Room, The Reset, Signal, Signal & Build, or One Day. This quiz routes you to the one that fits where you actually are. Not where you think you should be. Where you are. No email required. No upsell. Just a clear next step.',
  backToLabel: 'Back to Work with Anna',
  backToUrl: '/the-work',
};

const resultsFallback: QuizResultData[] = [
  { slug: 'decoder', title: 'Start with the free Nervous System Decoder.', blurb: 'Before any programme, before any session, this is the foundation. Free guide. Seven self-audit questions. Three small practices to start with, today. It is the first thing offered to anyone who finds Anna Lou Wellness, because understanding your inner world is not a luxury, it is the foundation.', ctaLabel: 'Send me the free Decoder' },
  { slug: 'reset-room', title: 'The Reset Room is your room.', blurb: 'Monthly somatic membership for women doing the work on their own pace. Private podcast (two new episodes a month), monthly live call with Anna, growing vault of guided journeys. £25 a month, no minimum term. The slow, steady door. Cancel any time.', ctaLabel: 'Step into the Reset Room' },
  { slug: 'reset', title: 'The Reset is the right starting place.', blurb: 'A six-week 1:1 somatic coaching programme. Weekly 90-minute sessions with Anna. Nervous-system led, trauma-informed, designed to bring your signal system back online. £1,500. The door for women whose body is already telling them it is time.', ctaLabel: 'Read about The Reset' },
  { slug: 'signal', title: 'Signal is the right depth.', blurb: 'Twelve weeks of 1:1 work for a complete identity rewrite. Not a starter programme. For women already deep in the work who need depth, structure, and a coach who can hold the shape of a real transformation. Application required.', ctaLabel: 'Apply for Signal' },
  { slug: 'signal-build', title: 'Signal & Build is where business meets nervous system.', blurb: 'Twelve weeks of 1:1 work for the founder rebuilding her business from the body up. Strategy, somatic coaching, and a clear plan for the work that does not destroy you to maintain. Application required.', ctaLabel: 'Apply for Signal & Build' },
  { slug: 'one-day', title: 'One Day is the right reset.', blurb: 'A full 1:1 day with Anna. On the houseboat at Taggs Island, or in your space if you prefer. No calendar, no interruptions. Brought together for one specific decision, one specific weight, one specific moment of clarity. Enquire for pricing.', ctaLabel: 'Enquire about One Day' },
];

async function loadQuizPage(): Promise<{ hero: QuizHeroData; results: QuizResultData[] }> {
  try {
    const { data: d } = await fetchAPI('/quiz-page', { populate: '*' });
    if (!d) return { hero: heroFallback, results: resultsFallback };
    const r = d as Record<string, unknown>;
    const cmsResults = Array.isArray(r.results) ? (r.results as Array<Record<string, unknown>>) : [];
    const results: QuizResultData[] = cmsResults.length > 0
      ? cmsResults.map((c): QuizResultData => ({
          slug: (c.slug as Recommendation) || 'decoder',
          title: (c.title as string) || '',
          blurb: (c.blurb as string) || '',
          ctaLabel: (c.cta_label as string) || '',
        }))
      : resultsFallback;
    const hero: QuizHeroData = {
      eyebrow: (r.eyebrow as string) || heroFallback.eyebrow,
      title: (r.title as string) || heroFallback.title,
      intro: (r.intro as string) || heroFallback.intro,
      backToLabel: (r.back_to_label as string) || heroFallback.backToLabel,
      backToUrl: (r.back_to_url as string) || heroFallback.backToUrl,
    };
    return { hero, results };
  } catch {
    return { hero: heroFallback, results: resultsFallback };
  }
}

export default async function QuizPage() {
  const [{ hero, results }, faqs] = await Promise.all([
    loadQuizPage(),
    getFAQs({ page: 'quiz' }),
  ]);
  return (
    <>
      <QuizClient hero={hero} results={results} />
      <FAQAccordion faqs={faqs} accentColour="#F280AA" background="#fff" />
    </>
  );
}
