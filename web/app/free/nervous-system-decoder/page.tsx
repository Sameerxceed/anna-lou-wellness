import { Metadata } from 'next';
import { fetchAPI, mediaUrl } from '@/lib/strapi';
import { ServiceSchema, BreadcrumbSchema } from '@/components/StructuredData';
import DecoderQuizClient, {
  type DecoderQuestion,
  type DecoderQuizCopy,
  type DecoderStateResult,
} from './quiz/DecoderQuizClient';

export const metadata: Metadata = {
  title: 'The Nervous System Decoder | Free Quiz | Anna Lou Wellness',
  description: 'A short interactive quiz to read where your inner guidance system is right now — Signal Clear, Signal Scrambled, or Signal Faint — plus a practice you can use today.',
  alternates: { canonical: '/free/nervous-system-decoder' },
};

export const dynamic = 'force-dynamic';

const copyFallback: DecoderQuizCopy = {
  eyebrow: 'Issue No. 01 · Free Resource',
  title: 'The Nervous System Decoder.',
  lede: 'What it is, and why it is free.',
  heroImageUrl: '',
  intro: 'It explains the three primary states of your inner guidance system in plain language. Helps you identify which state you are in right now. Gives you three immediate practices, one for each state.\n\nTake a few minutes. Answer honestly. We will show you which of the three states your inner world is in right now.',
  beginButtonLabel: 'Begin the Decoder',
  backToLabel: 'Back to home',
  backToUrl: '/',
  emailGateTitle: 'Where would you like your result?',
  emailGateIntro: 'Pop your email in, and your result, your practice, and a follow-up are yours.',
  emailGateButtonLabel: 'Show me my result',
  emailGateFineprint: 'One short email. Unsubscribe any time.',
  practiceLabelClear: 'A short meditation to stay clear',
  practiceLabelScrambled: 'Try this now',
  practiceLabelFaint: 'One small thing',
  priceMicrocopy: 'Pay what you feel, from £5.',
  retakeButtonLabel: 'Retake the quiz',
};

const questionsFallback: DecoderQuestion[] = [
  { text: 'When I try to rest, lately…', answerA: 'I can settle, even if it takes a moment.', answerB: 'My mind starts racing and I cannot switch off.', answerC: 'I shut down or zone out rather than properly rest.' },
  { text: 'When I look at my phone or read the news…', answerA: 'I can engage and put it down without it staying with me.', answerB: 'I feel it land in my body and stay buzzing afterwards.', answerC: 'I scroll without really taking it in, or I avoid it altogether.' },
  { text: 'Other people’s moods and stress…', answerA: 'I notice them, but they do not pull me out of myself.', answerB: 'Land in me. I pick them up and carry them.', answerC: 'Reach me faintly. It can feel like I am behind glass.' },
  { text: 'When something small goes wrong…', answerA: 'I can take it, breathe, and move on.', answerB: 'I am tipped over more easily than I would like.', answerC: 'I freeze or go quiet, even when I want to respond.' },
  { text: 'If I check in with myself right now, what I notice is…', answerA: 'I feel mostly here, in my body.', answerB: 'I feel wired or on edge.', answerC: 'I feel flat, foggy, or far away from myself.' },
];

const resultsFallback: DecoderStateResult[] = [
  { state: 'clear', title: 'Your signal is clear.', blurb: 'Right now, your inner world is mostly steady. You can think, rest, feel, and come back to yourself. That is not luck and it is not nothing. It is something to protect.\n\nThe world is loud, and even a clear signal gets pulled at. Staying clear is a practice, not a fixed state.\n\nSo here is a short meditation from me, to help you hold your ground and stay where you are.', practiceIntro: 'A short meditation to stay clear:', meditationUrl: '', ctaLabel: 'Step inside The Reset Room', ctaUrl: '/community/reset-room' },
  { state: 'scrambled', title: 'Your signal is scrambled.', blurb: 'Read this as information, not a verdict. Your inner world has been picking up a lot of signal that was never yours to carry. That is why you are wired and tired at the same time.\n\nThe longer work, the one that teaches you how to stay anchored, lives inside REGULATED.', practiceIntro: 'Try this now: Feet on the floor. Let your exhale grow a little longer than your inhale, three or four breaths. Look slowly around the room and name three things you can see. That is your signal coming back online. It is small, but it is real.', meditationUrl: '', ctaLabel: 'See REGULATED', ctaUrl: '/the-work/regulated' },
  { state: 'faint', title: 'Your signal is faint.', blurb: 'Something in you has gone quiet. That is not weakness and it is not a flaw. It is what an inner world does when it has been carrying too much for too long. It turns the volume down, to protect you.\n\nBe gentle with yourself today.\n\nWhen you feel ready for the longer work, REGULATED is the practice that brings you home, slowly and at your own pace.', practiceIntro: 'One small thing: Look up and find one thing in front of you. A colour, a corner of light, a shape. Let your eyes rest on it for a moment. That is enough.', meditationUrl: '', ctaLabel: 'See REGULATED', ctaUrl: '/the-work/regulated' },
];

type LoadResult = {
  copy: DecoderQuizCopy;
  questions: DecoderQuestion[];
  results: DecoderStateResult[];
};

async function loadDecoderQuizPage(): Promise<LoadResult> {
  try {
    const { data: d } = await fetchAPI('/decoder-quiz-page', { populate: '*' });
    if (!d) return { copy: copyFallback, questions: questionsFallback, results: resultsFallback };
    const r = d as Record<string, unknown>;

    const cmsResults = Array.isArray(r.results) ? (r.results as Array<Record<string, unknown>>) : [];
    const results: DecoderStateResult[] = cmsResults.length === 3
      ? cmsResults.map((c): DecoderStateResult => ({
          state: ((c.state as string) || 'clear') as DecoderStateResult['state'],
          title: (c.title as string) || '',
          blurb: (c.blurb as string) || '',
          practiceIntro: (c.practice_intro as string) || '',
          meditationUrl: (c.meditation_url as string) || '',
          ctaLabel: (c.cta_label as string) || 'Step inside REGULATED',
          ctaUrl: (c.cta_url as string) || '/the-work/regulated',
        }))
      : resultsFallback;

    const cmsQuestions = Array.isArray(r.questions) ? (r.questions as Array<Record<string, unknown>>) : [];
    const questions: DecoderQuestion[] = cmsQuestions.length === 5
      ? cmsQuestions.map((q): DecoderQuestion => ({
          text: (q.text as string) || '',
          answerA: (q.answer_a as string) || '',
          answerB: (q.answer_b as string) || '',
          answerC: (q.answer_c as string) || '',
        }))
      : questionsFallback;

    const heroImageUrl = mediaUrl(r.hero_image as { url?: string } | undefined) || '';

    const copy: DecoderQuizCopy = {
      eyebrow: (r.eyebrow as string) || copyFallback.eyebrow,
      title: (r.title as string) || copyFallback.title,
      lede: (r.lede as string) || copyFallback.lede,
      heroImageUrl,
      intro: (r.intro as string) || copyFallback.intro,
      beginButtonLabel: (r.begin_button_label as string) || copyFallback.beginButtonLabel,
      backToLabel: (r.back_to_label as string) || copyFallback.backToLabel,
      backToUrl: (r.back_to_url as string) || copyFallback.backToUrl,
      emailGateTitle: (r.email_gate_title as string) || copyFallback.emailGateTitle,
      emailGateIntro: (r.email_gate_intro as string) || copyFallback.emailGateIntro,
      emailGateButtonLabel: (r.email_gate_button_label as string) || copyFallback.emailGateButtonLabel,
      emailGateFineprint: (r.email_gate_fineprint as string) || copyFallback.emailGateFineprint,
      practiceLabelClear: (r.practice_label_clear as string) || copyFallback.practiceLabelClear,
      practiceLabelScrambled: (r.practice_label_scrambled as string) || copyFallback.practiceLabelScrambled,
      practiceLabelFaint: (r.practice_label_faint as string) || copyFallback.practiceLabelFaint,
      priceMicrocopy: (r.price_microcopy as string) || copyFallback.priceMicrocopy,
      retakeButtonLabel: (r.retake_button_label as string) || copyFallback.retakeButtonLabel,
    };

    return { copy, questions, results };
  } catch {
    return { copy: copyFallback, questions: questionsFallback, results: resultsFallback };
  }
}

export default async function DecoderPage() {
  const { copy, questions, results } = await loadDecoderQuizPage();
  return (
    <>
      <ServiceSchema
        name="The Nervous System Decoder"
        description="A free somatic self-audit quiz. Identify which of the three nervous system states you are in and get a practice for each."
        url="/free/nervous-system-decoder"
        price="0"
      />
      <BreadcrumbSchema items={[{ name: 'Home', href: '/' }, { name: 'Free Decoder', href: '/free/nervous-system-decoder' }]} />
      <DecoderQuizClient copy={copy} questions={questions} results={results} />
    </>
  );
}
