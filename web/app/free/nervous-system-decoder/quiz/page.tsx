import { Metadata } from 'next';
import { fetchAPI } from '@/lib/strapi';
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
const heroFallback: DecoderQuizHero = {
  eyebrow: 'Free. Always free.',
  title: 'Which state is your nervous system in?',
  intro: 'A few short questions, no email required to see your result. At the end you get one of three readings (Ventral, Sympathetic, Dorsal) and a practice you can use today.',
  backToLabel: 'Back to the Decoder',
  backToUrl: '/free/nervous-system-decoder',
};

const resultsFallback: DecoderStateResult[] = [
  {
    state: 'ventral',
    title: 'Your signal: Ventral. You are mostly grounded right now.',
    blurb: "Your nervous system is in its ventral vagal state — the place from which you connect, rest, create, and engage. This does not mean nothing is hard; it means you have the inner resource to meet what is.\n\nProtect this state. It is the foundation everything else gets built on.",
    practiceIntro: 'A short practice to deepen the regulation you already have:',
    meditationUrl: '',
    ctaLabel: 'Step inside REGULATED',
    ctaUrl: '/the-work/regulated',
  },
  {
    state: 'sympathetic',
    title: 'Your signal: Sympathetic. You are activated — fight or flight.',
    blurb: 'Your nervous system has moved into sympathetic activation. The body reads the current environment as something to push against, push through, or run from. Cortisol is high, breath is shallow, jaw and shoulders likely tight.\n\nThis is not a flaw — it is your system trying to keep you safe. The work is to let the activation discharge so you can come back down to ventral.',
    practiceIntro: 'A 5-minute practice to discharge the activation:',
    meditationUrl: '',
    ctaLabel: 'Step inside REGULATED',
    ctaUrl: '/the-work/regulated',
  },
  {
    state: 'dorsal',
    title: 'Your signal: Dorsal. You are in freeze or shutdown.',
    blurb: 'Your nervous system has dropped into the dorsal vagal state — freeze, collapse, or shutdown. Energy is low, motivation is hard to access, and the body wants to be horizontal. This is what happens when the system has been asked to hold too much for too long.\n\nThe way back is not to push. It is to gently, slowly, signal safety to the body so it can come up to sympathetic and then to ventral.',
    practiceIntro: 'A gentle practice to begin coming back online:',
    meditationUrl: '',
    ctaLabel: 'Step inside REGULATED',
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
  return <DecoderQuizClient hero={hero} results={results} />;
}
