'use client';

/**
 * QuizClient — interactive quiz UI for /the-work/quiz.
 *
 * Why split from page.tsx:
 *   page.tsx is a server component that fetches CMS data (hero copy + the
 *   6 result blurbs). This file is the client component that holds the
 *   useState quiz logic and renders the multi-step UI. CMS-editable
 *   content arrives via props.
 *
 * What stays hardcoded here:
 *   - The 5 questions and their answer weights (deliberately code-only;
 *     non-tech editors are unlikely to retune scoring matrices)
 *   - The href + accent colour for each of the 6 results (technical
 *     wiring tied to actual page routes; not editorial copy)
 *
 * What's CMS-editable (via props):
 *   - Hero eyebrow, title, sub-tagline, intro paragraphs
 *   - Each result's title, blurb, and CTA label (looked up by slug)
 */

import { useState } from 'react';
import Link from 'next/link';

export type Recommendation = 'reset' | 'signal' | 'signal-build' | 'one-day' | 'reset-room' | 'decoder';

export type QuizResultData = {
  slug: Recommendation;
  title: string;
  blurb: string;
  ctaLabel: string;
};

export type QuizHeroData = {
  eyebrow: string;
  title: string;
  intro: string;
  backToLabel: string;
  backToUrl: string;
};

interface QuestionOption {
  label: string;
  weights: Partial<Record<Recommendation, number>>;
}

interface Question {
  id: number;
  text: string;
  options: QuestionOption[];
}

// Five questions with weighted scoring towards 6 result types. Code-only —
// see file header for why.
const QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'Where are you right now, honestly?',
    options: [
      { label: 'Brand new to this work. I want to understand my nervous system before I commit to anything.', weights: { decoder: 4, 'reset-room': 2 } },
      { label: "I've been doing some of the work on my own. Reading, listening, journalling. Ready for support.", weights: { 'reset-room': 3, reset: 2 } },
      { label: 'Something has shifted recently and I need someone to hold the shape of it with me.', weights: { reset: 4, signal: 2 } },
      { label: 'I am in the middle of a complete identity rewrite and I need depth, not a starter.', weights: { signal: 4, 'signal-build': 3 } },
      { label: 'I am burning out. I do not have weeks. I need one quiet, focused day to put it down.', weights: { 'one-day': 5 } },
    ],
  },
  {
    id: 2,
    text: 'What is asking for attention?',
    options: [
      { label: 'My body — I am exhausted, anxious, holding everything in my shoulders, my jaw, my chest.', weights: { reset: 3, 'reset-room': 2, decoder: 1 } },
      { label: 'My relationships — patterns I can see but cannot stop repeating.', weights: { signal: 3, reset: 2 } },
      { label: 'My work and money — building something that does not destroy me to maintain.', weights: { 'signal-build': 5 } },
      { label: "My identity — who I am underneath everyone else's expectations of me.", weights: { signal: 4, reset: 2 } },
      { label: 'All of it. I cannot separate them.', weights: { 'one-day': 3, signal: 3 } },
    ],
  },
  {
    id: 3,
    text: 'How much time and energy can you give this?',
    options: [
      { label: 'A few minutes a day, when I can. I cannot add another big commitment right now.', weights: { 'reset-room': 4, decoder: 3 } },
      { label: 'A weekly 90-minute session for six weeks. I can carve that out.', weights: { reset: 5 } },
      { label: 'A weekly session for three months. I want to go deeper than a quick fix.', weights: { signal: 4, 'signal-build': 3 } },
      { label: 'One full day, no calendar, no interruptions. I will give it everything for a day.', weights: { 'one-day': 5 } },
      { label: 'Whatever it takes. I am ready to invest properly in this.', weights: { signal: 3, 'signal-build': 3, 'one-day': 1 } },
    ],
  },
  {
    id: 4,
    text: 'How do you want to be held in this?',
    options: [
      { label: 'On my own pace. Audio in my ear, in my own home, when I have a quiet hour.', weights: { 'reset-room': 4, decoder: 2 } },
      { label: 'In a quiet group of women going through something similar.', weights: { 'reset-room': 3, signal: 2 } },
      { label: 'One to one with Anna. I want her full attention on what is happening for me.', weights: { reset: 4, signal: 4, 'one-day': 3, 'signal-build': 3 } },
      { label: 'Both. Some 1:1 depth, some group breath, the choice depending on the week.', weights: { signal: 3, 'signal-build': 2, 'reset-room': 2 } },
    ],
  },
  {
    id: 5,
    text: 'What does success look like at the end?',
    options: [
      { label: 'I understand what is happening in my body and have practices that actually help.', weights: { decoder: 3, 'reset-room': 3, reset: 2 } },
      { label: 'My nervous system is genuinely calmer. I sleep, I breathe, I do not flinch at small things.', weights: { reset: 4, signal: 2 } },
      { label: 'A pattern that has run my life for years has loosened its grip.', weights: { signal: 5, 'signal-build': 2 } },
      { label: 'A business or way of working that is sustainable instead of slowly killing me.', weights: { 'signal-build': 5 } },
      { label: 'Clarity. One specific decision made. One specific weight put down. Today.', weights: { 'one-day': 5 } },
    ],
  },
];

// Routes + accent colours per result. Technical wiring — not CMS.
const RESULT_META: Record<Recommendation, { href: string; colour: string }> = {
  decoder: { href: '/free/nervous-system-decoder', colour: '#FFD07A' },
  'reset-room': { href: '/community/reset-room', colour: '#7BAFDD' },
  reset: { href: '/the-work/the-reset', colour: '#6E3A5A' },
  signal: { href: '/the-work/signal', colour: '#F280AA' },
  'signal-build': { href: '/the-work/signal-and-build', colour: '#FAA21B' },
  'one-day': { href: '/the-work/one-day', colour: '#5DCAA5' },
};

interface QuizClientProps {
  hero: QuizHeroData;
  results: QuizResultData[];
}

export default function QuizClient({ hero, results }: QuizClientProps) {
  const [step, setStep] = useState(0); // 0 = intro, 1-5 = questions, 6 = result
  const [scores, setScores] = useState<Record<Recommendation, number>>({
    decoder: 0, 'reset-room': 0, reset: 0, signal: 0, 'signal-build': 0, 'one-day': 0,
  });

  function handleAnswer(weights: Partial<Record<Recommendation, number>>) {
    const next = { ...scores };
    for (const [key, val] of Object.entries(weights)) {
      next[key as Recommendation] = (next[key as Recommendation] || 0) + (val || 0);
    }
    setScores(next);
    setStep(step + 1);
  }

  function reset() {
    setStep(0);
    setScores({ decoder: 0, 'reset-room': 0, reset: 0, signal: 0, 'signal-build': 0, 'one-day': 0 });
  }

  const winner = (Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] || 'decoder') as Recommendation;
  // Find the CMS result for the winning slug; fall back to first result if missing.
  const winningResult = results.find((r) => r.slug === winner) || results[0];
  const meta = RESULT_META[winner];
  const progress = step === 0 ? 0 : step <= QUESTIONS.length ? Math.round(((step - 1) / QUESTIONS.length) * 100) : 100;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <section className="qz-page">
        <div className="qz-inner">
          {step > 0 && step <= QUESTIONS.length && (
            <div className="qz-progress">
              <div className="qz-progress-bar" style={{ width: `${progress}%` }} />
              <p className="qz-progress-label">Question {step} of {QUESTIONS.length}</p>
            </div>
          )}

          {step === 0 && (
            <div className="qz-intro">
              <p className="qz-eyebrow">{hero.eyebrow}</p>
              <h1 className="qz-title">{hero.title}</h1>
              <p className="qz-body">{hero.intro}</p>
              <button onClick={() => setStep(1)} className="qz-btn-primary">Begin the quiz &rarr;</button>
            </div>
          )}

          {step > 0 && step <= QUESTIONS.length && (
            <div className="qz-question">
              <p className="qz-eyebrow">Question {step}</p>
              <h2 className="qz-q-text">{QUESTIONS[step - 1].text}</h2>
              <div className="qz-options">
                {QUESTIONS[step - 1].options.map((opt, i) => (
                  <button key={i} onClick={() => handleAnswer(opt.weights)} className="qz-option">
                    <span className="qz-option-letter">{String.fromCharCode(65 + i)}</span>
                    <span className="qz-option-text">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step > QUESTIONS.length && winningResult && (
            <div className="qz-result">
              <p className="qz-eyebrow" style={{ color: meta.colour }}>Your starting place</p>
              <h2 className="qz-result-title">{winningResult.title}</h2>
              <p className="qz-body" style={{ fontSize: '1.05rem' }}>{winningResult.blurb}</p>
              <Link href={meta.href} className="qz-btn-primary" style={{ background: meta.colour, color: meta.colour === '#FFD07A' ? '#231F20' : '#fff' }}>
                {winningResult.ctaLabel} &rarr;
              </Link>
              <div className="qz-result-other">
                <p className="qz-eyebrow">Or</p>
                <p className="qz-body">If this does not land, book a free 15-minute discovery call. Anna will hear what you actually need and tell you straight.</p>
                <Link href="/contact" className="qz-link">Book a free discovery call &rarr;</Link>
                <button onClick={reset} className="qz-link qz-link-reset">Retake the quiz</button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

const pageStyles = `
.qz-page { background: linear-gradient(180deg, #F1EAE0 0%, #F5F3EF 100%); padding: 3rem 2rem 4rem; min-height: 70vh; }
.qz-inner { max-width: 720px; margin: 0 auto; }
.qz-progress { margin-bottom: 2rem; position: relative; }
.qz-progress::before { content: ''; display: block; height: 3px; background: rgba(110,58,90,0.12); border-radius: 2px; }
.qz-progress-bar { position: absolute; top: 0; left: 0; height: 3px; background: #6E3A5A; border-radius: 2px; transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1); }
.qz-progress-label { font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase; color: #8C8880; margin-top: 0.5rem; }
.qz-eyebrow { font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.6rem; letter-spacing: 0.28em; text-transform: uppercase; color: #6E3A5A; margin-bottom: 0.6rem; }
.qz-title { font-family: 'Work Sans', sans-serif; font-weight: 300; font-size: clamp(2rem, 5vw, 3rem); color: #231F20; letter-spacing: 0.04em; line-height: 1.15; margin-bottom: 0.5rem; }
.qz-body { font-family: 'EB Garamond', Georgia, serif; font-size: 1rem; line-height: 1.8; color: #3D3D3A; margin-bottom: 1rem; }
.qz-btn-primary { display: inline-block; background: #6E3A5A; color: #fff; border: none; cursor: pointer; font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.7rem; letter-spacing: 0.18em; text-transform: uppercase; padding: 1rem 1.8rem; border-radius: 4px; text-decoration: none; transition: all 0.3s; margin-top: 1rem; }
.qz-btn-primary:hover { transform: translateY(-1px); filter: brightness(0.95); }
.qz-question { animation: fadeIn 0.4s; }
.qz-q-text { font-family: 'EB Garamond', Georgia, serif; font-size: clamp(1.4rem, 3vw, 1.8rem); line-height: 1.4; color: #231F20; margin-bottom: 1.8rem; }
.qz-options { display: flex; flex-direction: column; gap: 0.7rem; }
.qz-option { display: flex; gap: 1rem; align-items: flex-start; background: #fff; border: 1px solid rgba(0,0,0,0.06); border-radius: 8px; padding: 1rem 1.2rem; text-align: left; cursor: pointer; transition: all 0.2s; font-family: inherit; }
.qz-option:hover { border-color: #6E3A5A; transform: translateX(2px); box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
.qz-option-letter { flex-shrink: 0; font-family: Mulish, sans-serif; font-weight: 600; font-size: 0.75rem; color: #6E3A5A; width: 24px; height: 24px; border-radius: 50%; background: rgba(110,58,90,0.08); display: inline-flex; align-items: center; justify-content: center; margin-top: 0.15rem; }
.qz-option:hover .qz-option-letter { background: #6E3A5A; color: #fff; }
.qz-option-text { font-family: 'EB Garamond', Georgia, serif; font-size: 0.98rem; line-height: 1.6; color: #3D3D3A; }
.qz-result { animation: fadeIn 0.5s; text-align: center; }
.qz-result-title { font-family: 'Work Sans', sans-serif; font-weight: 300; font-size: clamp(1.8rem, 4.5vw, 2.6rem); line-height: 1.15; color: #231F20; letter-spacing: 0.03em; margin-bottom: 1rem; }
.qz-result-other { margin-top: 3rem; padding-top: 2rem; border-top: 1px solid rgba(0,0,0,0.06); }
.qz-link { display: block; font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; color: #6E3A5A; text-decoration: none; margin-top: 0.6rem; cursor: pointer; background: none; border: none; }
.qz-link:hover { color: #5A2E4A; }
.qz-link-reset { color: #8C8880; margin-top: 1rem; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 640px) { .qz-page { padding: 2rem 1.2rem 3rem; } .qz-option { padding: 0.8rem 1rem; } }
`;
