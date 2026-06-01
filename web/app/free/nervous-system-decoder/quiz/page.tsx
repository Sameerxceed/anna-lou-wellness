import { Metadata } from 'next';
import { fetchAPI } from '@/lib/strapi';
import { BreadcrumbSchema } from '@/components/StructuredData';
import DecoderQuizClient, {
  type DecoderQuizHero,
  type DecoderStateResult,
} from './DecoderQuizClient';

export const metadata: Metadata = {
  title: 'The Nervous System Decoder Quiz | Free | Anna Lou Wellness',
  description: 'A short interactive quiz to identify which of the three nervous system states (Ventral, Sympathetic, Dorsal) you are in right now — and a practice you can use today.',
  alternates: { canonical: '/free/nervous-system-decoder/quiz' },
};

// Hardcoded fallbacks — used only if the CMS singleton is unreachable.
// Anna edits the live content in Strapi under "Decoder Quiz (Free)".
// Hardcoded fallbacks — Anna's 1 Jun 2026 wireframe copy. Used only if the
// CMS singleton is unreachable; the singleton itself is seeded with the
// same copy by cms/src/seed-decoder-quiz.js so Anna can edit live.
const heroFallback: DecoderQuizHero = {
  eyebrow: 'Issue No. 01 · Free Resource',
  title: 'The Nervous System Decoder.',
  intro: 'Five short questions. Answer honestly. At the end we will read where your inner guidance system is right now, and give you a practice you can use today.',
  backToLabel: 'Back to the Decoder',
  backToUrl: '/free/nervous-system-decoder',
};

const resultsFallback: DecoderStateResult[] = [
  {
    state: 'clear',
    title: 'Your signal is clear.',
    blurb: 'Right now, your inner world is mostly steady. You can think, rest, feel, and come back to yourself. That is not luck and it is not nothing. It is something to protect.\n\nThe world is loud, and even a clear signal gets pulled at. Staying clear is a practice, not a fixed state.\n\nSo here is a short meditation from me, to help you hold your ground and stay where you are.',
    practiceIntro: 'A short meditation to stay clear:',
    meditationUrl: '',
    ctaLabel: 'Step inside The Reset Room',
    ctaUrl: '/community/reset-room',
  },
  {
    state: 'scrambled',
    title: 'Your signal is scrambled.',
    blurb: 'Read this as information, not a verdict. Your inner world has been picking up a lot of signal that was never yours to carry. That is why you are wired and tired at the same time.\n\nThe longer work, the one that teaches you how to stay anchored, lives inside REGULATED.',
    practiceIntro: 'Try this now: Feet on the floor. Let your exhale grow a little longer than your inhale, three or four breaths. Look slowly around the room and name three things you can see. That is your signal coming back online. It is small, but it is real.',
    meditationUrl: '',
    ctaLabel: 'See REGULATED',
    ctaUrl: '/the-work/regulated',
  },
  {
    state: 'faint',
    title: 'Your signal is faint.',
    blurb: 'Something in you has gone quiet. That is not weakness and it is not a flaw. It is what an inner world does when it has been carrying too much for too long. It turns the volume down, to protect you.\n\nBe gentle with yourself today.\n\nWhen you feel ready for the longer work, REGULATED is the practice that brings you home, slowly and at your own pace.',
    practiceIntro: 'One small thing: Look up and find one thing in front of you. A colour, a corner of light, a shape. Let your eyes rest on it for a moment. That is enough.',
    meditationUrl: '',
    ctaLabel: 'See REGULATED',
    ctaUrl: '/the-work/regulated',
  },
];

async function loadDecoderQuizPage(): Promise<{ hero: DecoderQuizHero; results: DecoderStateResult[] }> {
  try {
    const { data: d } = await fetchAPI('/decoder-quiz-page', { populate: '*' });
    if (!d) return { hero: heroFallback, results: resultsFallback };
    const r = d as Record<string, unknown>;
    const cmsResults = Array.isArray(r.results) ? (r.results as Array<Record<string, unknown>>) : [];
    const results: DecoderStateResult[] = cmsResults.length === 3
      ? cmsResults.map((c): DecoderStateResult => ({
          state: ((c.state as string) || 'ventral') as DecoderStateResult['state'],
          title: (c.title as string) || '',
          blurb: (c.blurb as string) || '',
          practiceIntro: (c.practice_intro as string) || '',
          meditationUrl: (c.meditation_url as string) || '',
          ctaLabel: (c.cta_label as string) || 'Step inside REGULATED',
          ctaUrl: (c.cta_url as string) || '/the-work/regulated',
        }))
      : resultsFallback;
    const hero: DecoderQuizHero = {
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

export default async function DecoderQuizPage() {
  const { hero, results } = await loadDecoderQuizPage();
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', href: '/' },
          { name: 'Free Decoder', href: '/free/nervous-system-decoder' },
          { name: 'Quiz', href: '/free/nervous-system-decoder/quiz' },
        ]}
      />
      <DecoderQuizClient hero={hero} results={results} />
    </>
  );
}
