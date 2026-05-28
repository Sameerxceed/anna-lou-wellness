'use client';

/**
 * DecoderQuizClient — interactive 3-state nervous-system quiz UI.
 *
 * Mirrors the structure of /the-work/quiz/QuizClient.tsx but with 3
 * result outcomes (Ventral / Sympathetic / Dorsal) instead of 6.
 *
 * What stays hardcoded here:
 *   - The placeholder questions and their state-weight scoring
 *     (Anna sends a separate doc with final questions + scoring —
 *     swap these arrays when that arrives)
 *
 * What's CMS-editable (via props from Strapi decoder-quiz-page singleton):
 *   - Hero eyebrow, title, intro
 *   - Each state result's title, blurb, practice intro, meditation URL,
 *     CTA label, CTA URL (looked up by state slug)
 */

import { useState } from 'react';
import Link from 'next/link';

export type NervousSystemState = 'ventral' | 'sympathetic' | 'dorsal';

export type DecoderStateResult = {
  state: NervousSystemState;
  title: string;
  blurb: string;
  practiceIntro: string;
  meditationUrl: string;
  ctaLabel: string;
  ctaUrl: string;
};

export type DecoderQuizHero = {
  eyebrow: string;
  title: string;
  intro: string;
  backToLabel: string;
  backToUrl: string;
};

interface QuestionOption {
  label: string;
  weights: Partial<Record<NervousSystemState, number>>;
}

interface Question {
  id: number;
  text: string;
  options: QuestionOption[];
}

// Placeholder questions — Anna will replace with the final set from her
// separate doc. Each option carries weights toward one of the 3 states.
// Ventral = grounded/connected, Sympathetic = fight-or-flight, Dorsal = freeze.
const QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'In the last few days, when something stressful landed, your body felt...',
    options: [
      { label: 'Settled. Heart rate stayed normal. I could think clearly and respond.', weights: { ventral: 3 } },
      { label: 'Activated. Heart racing, jaw tight, mind going at 100mph.', weights: { sympathetic: 3 } },
      { label: 'Flat. I went numb, foggy, wanted to lie down and disappear.', weights: { dorsal: 3 } },
      { label: 'It depends on the moment — some calm, some not.', weights: { ventral: 1, sympathetic: 1 } },
    ],
  },
  {
    id: 2,
    text: 'How are you sleeping?',
    options: [
      { label: 'Mostly well. I fall asleep within 20 minutes and wake rested.', weights: { ventral: 2 } },
      { label: 'Light and restless. Wake at 3am with my mind racing.', weights: { sympathetic: 3 } },
      { label: 'Heavy but not refreshing. I could sleep all day.', weights: { dorsal: 3 } },
      { label: 'Inconsistent — depends on the week.', weights: { sympathetic: 1, ventral: 1 } },
    ],
  },
  {
    id: 3,
    text: 'When a friend texts to vent, your first reaction is...',
    options: [
      { label: "Genuine care. I have space for them and I can listen without taking it on.", weights: { ventral: 3 } },
      { label: 'Tense. I want to fix it immediately, even when they did not ask me to.', weights: { sympathetic: 3 } },
      { label: "Honestly? I read the message and don't reply for a day. I have nothing in the tank.", weights: { dorsal: 3 } },
      { label: 'Mixed — I want to help but I also feel my own resources going.', weights: { sympathetic: 1, dorsal: 1 } },
    ],
  },
  {
    id: 4,
    text: 'In your body right now, where is the strongest sensation?',
    options: [
      { label: 'A soft fullness in my chest. I can feel my breath moving.', weights: { ventral: 3 } },
      { label: 'Tightness in my jaw, shoulders, chest. Shallow breath.', weights: { sympathetic: 3 } },
      { label: 'Heaviness everywhere. I feel sunk into the chair.', weights: { dorsal: 3 } },
      { label: 'A little of everything — I notice I am scanning.', weights: { sympathetic: 1, ventral: 1 } },
    ],
  },
  {
    id: 5,
    text: 'How do you feel about the next 24 hours?',
    options: [
      { label: 'Ready. There are things I am looking forward to.', weights: { ventral: 3 } },
      { label: 'Wired. I have a long list and not enough time.', weights: { sympathetic: 3 } },
      { label: 'I would rather not think about it.', weights: { dorsal: 3 } },
      { label: 'Neutral. Some things to do, some to look forward to.', weights: { ventral: 2 } },
    ],
  },
];

interface Props {
  hero: DecoderQuizHero;
  results: DecoderStateResult[];
}

export default function DecoderQuizClient({ hero, results }: Props) {
  const [step, setStep] = useState<number>(-1); // -1 = intro, 0..N-1 = questions, N = result
  const [scores, setScores] = useState<Record<NervousSystemState, number>>({
    ventral: 0,
    sympathetic: 0,
    dorsal: 0,
  });

  function answer(opt: QuestionOption) {
    const next = { ...scores };
    for (const [k, v] of Object.entries(opt.weights)) {
      next[k as NervousSystemState] = (next[k as NervousSystemState] || 0) + (v || 0);
    }
    setScores(next);
    setStep((s) => s + 1);
  }

  function restart() {
    setScores({ ventral: 0, sympathetic: 0, dorsal: 0 });
    setStep(-1);
  }

  // Pick the highest-scoring state at the end
  const winner: NervousSystemState =
    scores.ventral >= scores.sympathetic && scores.ventral >= scores.dorsal
      ? 'ventral'
      : scores.sympathetic >= scores.dorsal
      ? 'sympathetic'
      : 'dorsal';
  const result = results.find((r) => r.state === winner) || results[0] || null;

  const accentForState: Record<NervousSystemState, string> = {
    ventral: '#5DCAA5',     // mint — grounded
    sympathetic: '#F280AA', // pink — activated
    dorsal: '#7BAFDD',      // blue — collapsed
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: quizStyles }} />
      <section className="dq-wrap">
        <Link href={hero.backToUrl} className="dq-back">&larr; {hero.backToLabel}</Link>

        {step === -1 && (
          <div className="dq-card">
            <p className="dq-eyebrow">{hero.eyebrow}</p>
            <h1 className="dq-title">{hero.title}</h1>
            <p className="dq-intro">{hero.intro}</p>
            <button className="dq-btn dq-btn-primary" onClick={() => setStep(0)}>
              Begin &rarr;
            </button>
          </div>
        )}

        {step >= 0 && step < QUESTIONS.length && (
          <div className="dq-card">
            <p className="dq-eyebrow">Question {step + 1} of {QUESTIONS.length}</p>
            <h2 className="dq-question">{QUESTIONS[step].text}</h2>
            <div className="dq-options">
              {QUESTIONS[step].options.map((opt, i) => (
                <button key={i} className="dq-option" onClick={() => answer(opt)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step >= QUESTIONS.length && result && (
          <div className="dq-card dq-result" style={{ borderTop: `4px solid ${accentForState[winner]}` }}>
            <p className="dq-eyebrow" style={{ color: accentForState[winner] }}>Your result</p>
            <h2 className="dq-title">{result.title}</h2>
            <div className="dq-blurb">
              {result.blurb.split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)}
            </div>
            {result.practiceIntro && (
              <p className="dq-practice-intro">{result.practiceIntro}</p>
            )}
            {result.meditationUrl && (
              <div className="dq-meditation">
                {result.meditationUrl.includes('youtube') || result.meditationUrl.includes('youtu.be') ? (
                  <iframe
                    src={toEmbedUrl(result.meditationUrl)}
                    title={`Practice for ${result.state}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                ) : (
                  <audio controls src={result.meditationUrl} preload="metadata" />
                )}
              </div>
            )}
            <div className="dq-result-cta">
              <Link href={result.ctaUrl} className="dq-btn dq-btn-primary" style={{ background: accentForState[winner], borderColor: accentForState[winner] }}>
                {result.ctaLabel} &rarr;
              </Link>
              <button className="dq-btn dq-btn-ghost" onClick={restart}>Retake the quiz</button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function toEmbedUrl(url: string): string {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}`;
  return url;
}

const quizStyles = `
.dq-wrap { background:#fff; padding:2rem 1.5rem 3rem; min-height:70vh; }
.dq-back { display:inline-block; max-width:1100px; margin:0 auto 1.5rem; font-family:Mulish,sans-serif; font-size:0.7rem; letter-spacing:0.14em; text-transform:uppercase; color:#8C8880; text-decoration:none; }
.dq-back:hover { color:#231F20; }
.dq-card { max-width:760px; margin:0 auto; background:#FAF7F1; border-radius:8px; padding:2.5rem 2rem; box-shadow:0 6px 30px rgba(0,0,0,0.05); }
.dq-eyebrow { font-family:Mulish,sans-serif; font-weight:500; font-size:0.65rem; letter-spacing:0.3em; text-transform:uppercase; color:#6E3A5A; margin-bottom:0.8rem; }
.dq-title { font-family:'EB Garamond',Georgia,serif; font-weight:400; font-size:clamp(1.7rem,3.5vw,2.4rem); color:#231F20; line-height:1.3; margin-bottom:1rem; text-wrap:balance; }
.dq-question { font-family:'EB Garamond',Georgia,serif; font-weight:400; font-size:clamp(1.3rem,2.4vw,1.7rem); color:#231F20; line-height:1.4; margin-bottom:1.5rem; }
.dq-intro { font-family:'EB Garamond',Georgia,serif; font-size:1.05rem; line-height:1.8; color:#3D3D3A; margin-bottom:1.8rem; }
.dq-options { display:flex; flex-direction:column; gap:0.75rem; }
.dq-option { font-family:'EB Garamond',Georgia,serif; font-size:1rem; line-height:1.6; color:#231F20; background:#fff; border:1px solid rgba(0,0,0,0.08); border-radius:6px; padding:1rem 1.2rem; text-align:left; cursor:pointer; transition:all 0.2s; }
.dq-option:hover { border-color:#6E3A5A; background:#FFF8FA; transform:translateY(-1px); }
.dq-btn { font-family:Mulish,sans-serif; font-weight:600; font-size:0.7rem; letter-spacing:0.18em; text-transform:uppercase; padding:0.9rem 1.6rem; border-radius:3px; border:1px solid; cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; gap:0.4rem; transition:opacity 0.2s; }
.dq-btn-primary { background:#6E3A5A; color:#fff; border-color:#6E3A5A; }
.dq-btn-primary:hover { opacity:0.9; }
.dq-btn-ghost { background:transparent; color:#6E3A5A; border-color:rgba(110,58,90,0.3); }
.dq-btn-ghost:hover { background:rgba(110,58,90,0.06); }
.dq-result .dq-blurb { font-family:'EB Garamond',Georgia,serif; font-size:1.05rem; line-height:1.85; color:#3D3D3A; margin-bottom:1.2rem; }
.dq-result .dq-blurb p { margin-bottom:1rem; }
.dq-practice-intro { font-family:'EB Garamond',Georgia,serif; font-style:italic; font-size:0.95rem; color:#5D5A52; margin-bottom:1rem; }
.dq-meditation { margin:1rem 0 1.5rem; }
.dq-meditation iframe { width:100%; aspect-ratio:16/9; border:0; border-radius:6px; display:block; }
.dq-meditation audio { width:100%; }
.dq-result-cta { display:flex; flex-wrap:wrap; gap:0.8rem; margin-top:1.5rem; }
@media (max-width:640px) { .dq-card { padding:2rem 1.4rem; } .dq-result-cta { flex-direction:column; align-items:stretch; } .dq-btn { justify-content:center; } }
`;
