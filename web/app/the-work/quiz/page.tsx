'use client';

import { useState } from 'react';
import Link from 'next/link';

type Recommendation = 'reset' | 'signal' | 'signal-build' | 'one-day' | 'reset-room' | 'decoder';

interface QuestionOption {
  label: string;
  weights: Partial<Record<Recommendation, number>>;
}

interface Question {
  id: number;
  text: string;
  options: QuestionOption[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'Where are you right now, honestly?',
    options: [
      { label: 'Brand new to this work. I want to understand my nervous system before I commit to anything.', weights: { decoder: 4, 'reset-room': 2 } },
      { label: 'I\'ve been doing some of the work on my own. Reading, listening, journalling. Ready for support.', weights: { 'reset-room': 3, reset: 2 } },
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
      { label: 'My identity — who I am underneath everyone else\'s expectations of me.', weights: { signal: 4, reset: 2 } },
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

const RESULTS: Record<Recommendation, {
  title: string;
  blurb: string;
  href: string;
  cta: string;
  colour: string;
}> = {
  decoder: {
    title: 'Start with the free Nervous System Decoder.',
    blurb: 'Before any programme, before any session, this is the foundation. Free guide. Seven self-audit questions. Three small practices to start with, today. It is the first thing offered to anyone who finds Anna Lou Wellness — because understanding your inner world is not a luxury, it is the foundation.',
    href: '/free/nervous-system-decoder',
    cta: 'Send me the free Decoder',
    colour: '#FFD07A',
  },
  'reset-room': {
    title: 'The Reset Room is your room.',
    blurb: 'Monthly somatic membership for women doing the work on their own pace. Private podcast (two new episodes a month), monthly live call with Anna, growing vault of guided journeys. £25 a month, no minimum term. The slow, steady door. Cancel any time.',
    href: '/community/reset-room',
    cta: 'Step into the Reset Room',
    colour: '#7BAFDD',
  },
  reset: {
    title: 'The Reset is the right starting place.',
    blurb: 'A six-week 1:1 somatic coaching programme. Weekly 90-minute sessions with Anna. Nervous-system led, trauma-informed, designed to bring your signal system back online. £1,500. The door for women whose body is already telling them it is time.',
    href: '/the-work/the-reset',
    cta: 'See The Reset',
    colour: '#F280AA',
  },
  signal: {
    title: 'Signal is your container.',
    blurb: 'A twelve-week 1:1 programme. Deeper than The Reset. Designed for women in the middle of an identity rewrite — not a moment of overwhelm, but a real reorganisation of who you are and how you live. £3,000. For pattern work that has refused to shift before.',
    href: '/the-work/signal',
    cta: 'See Signal',
    colour: '#6E3A5A',
  },
  'signal-build': {
    title: 'Signal & Build is built for you.',
    blurb: 'Twelve weeks of 1:1 somatic coaching plus business strategy with Anna. For founders, creators, and women building something — who need their nervous system regulated AND their work made sustainable at the same time. £3,000+. Two strands, one woman.',
    href: '/the-work/signal-and-build',
    cta: 'See Signal & Build',
    colour: '#FAA21B',
  },
  'one-day': {
    title: 'One Day is your day.',
    blurb: 'A full 1:1 day with Anna. On the houseboat at Taggs Island, or in your space if you prefer. No calendar, no interruptions. Brought together for one specific decision, one specific weight, one specific moment of clarity. Enquire for pricing.',
    href: '/the-work/one-day',
    cta: 'Enquire about One Day',
    colour: '#5DCAA5',
  },
};

export default function QuizPage() {
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
  const result = RESULTS[winner];
  const progress = step === 0 ? 0 : step <= QUESTIONS.length ? Math.round(((step - 1) / QUESTIONS.length) * 100) : 100;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <section className="qz-page">
        <div className="qz-inner">
          {/* Progress bar */}
          {step > 0 && step <= QUESTIONS.length && (
            <div className="qz-progress">
              <div className="qz-progress-bar" style={{ width: `${progress}%` }} />
              <p className="qz-progress-label">Question {step} of {QUESTIONS.length}</p>
            </div>
          )}

          {/* Intro */}
          {step === 0 && (
            <div className="qz-intro">
              <p className="qz-eyebrow">Five questions. Two minutes.</p>
              <h1 className="qz-title">What do you need right now?</h1>
              <p className="qz-sub"><em>An honest map to the right starting place.</em></p>
              <p className="qz-body">There are six possible starting points with Anna — the free Nervous System Decoder, the Reset Room, The Reset, Signal, Signal &amp; Build, or One Day. This quiz routes you to the one that fits where you actually are. Not where you think you should be. Where you are.</p>
              <p className="qz-body">No email required. No upsell. Just a clear next step.</p>
              <button onClick={() => setStep(1)} className="qz-btn-primary">Begin the quiz &rarr;</button>
            </div>
          )}

          {/* Questions */}
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

          {/* Result */}
          {step > QUESTIONS.length && (
            <div className="qz-result">
              <p className="qz-eyebrow" style={{ color: result.colour }}>Your starting place</p>
              <h2 className="qz-result-title">{result.title}</h2>
              <p className="qz-body" style={{ fontSize: '1.05rem' }}>{result.blurb}</p>
              <Link href={result.href} className="qz-btn-primary" style={{ background: result.colour, color: result.colour === '#FFD07A' ? '#231F20' : '#fff' }}>
                {result.cta} &rarr;
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
.qz-progress::before {
  content: ''; display: block;
  height: 3px; background: rgba(110,58,90,0.12); border-radius: 2px;
}
.qz-progress-bar {
  position: absolute; top: 0; left: 0; height: 3px;
  background: #6E3A5A; border-radius: 2px;
  transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.qz-progress-label {
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase;
  color: #8C8880; margin-top: 0.5rem;
}

.qz-eyebrow {
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.6rem; letter-spacing: 0.28em; text-transform: uppercase;
  color: #6E3A5A; margin-bottom: 0.6rem;
}
.qz-title {
  font-family: 'Work Sans', sans-serif; font-weight: 300;
  font-size: clamp(2rem, 5vw, 3rem); color: #231F20;
  letter-spacing: 0.04em; line-height: 1.15; margin-bottom: 0.5rem;
}
.qz-sub {
  font-family: 'EB Garamond', Georgia, serif; font-style: italic;
  font-size: 1.2rem; color: #3D3D3A; margin-bottom: 1.2rem;
}
.qz-body {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 1rem; line-height: 1.8; color: #3D3D3A;
  margin-bottom: 1rem;
}

.qz-btn-primary {
  display: inline-block;
  background: #6E3A5A; color: #fff; border: none; cursor: pointer;
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.7rem; letter-spacing: 0.18em; text-transform: uppercase;
  padding: 1rem 1.8rem; border-radius: 4px;
  text-decoration: none; transition: all 0.3s;
  margin-top: 1rem;
}
.qz-btn-primary:hover { transform: translateY(-1px); filter: brightness(0.95); }

/* Question */
.qz-question { animation: fadeIn 0.4s; }
.qz-q-text {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: clamp(1.4rem, 3vw, 1.8rem); line-height: 1.4;
  color: #231F20; margin-bottom: 1.8rem;
}
.qz-options { display: flex; flex-direction: column; gap: 0.7rem; }
.qz-option {
  display: flex; gap: 1rem; align-items: flex-start;
  background: #fff; border: 1px solid rgba(0,0,0,0.06); border-radius: 8px;
  padding: 1rem 1.2rem; text-align: left; cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}
.qz-option:hover {
  border-color: #6E3A5A; transform: translateX(2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
}
.qz-option-letter {
  flex-shrink: 0;
  font-family: Mulish, sans-serif; font-weight: 600;
  font-size: 0.75rem; color: #6E3A5A;
  width: 24px; height: 24px; border-radius: 50%;
  background: rgba(110,58,90,0.08);
  display: inline-flex; align-items: center; justify-content: center;
  margin-top: 0.15rem;
}
.qz-option:hover .qz-option-letter { background: #6E3A5A; color: #fff; }
.qz-option-text {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 0.98rem; line-height: 1.6; color: #3D3D3A;
}

/* Result */
.qz-result { animation: fadeIn 0.5s; text-align: center; }
.qz-result-title {
  font-family: 'Work Sans', sans-serif; font-weight: 300;
  font-size: clamp(1.8rem, 4.5vw, 2.6rem); line-height: 1.15;
  color: #231F20; letter-spacing: 0.03em; margin-bottom: 1rem;
}
.qz-result-other {
  margin-top: 3rem; padding-top: 2rem;
  border-top: 1px solid rgba(0,0,0,0.06);
}
.qz-link {
  display: block;
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase;
  color: #6E3A5A; text-decoration: none;
  margin-top: 0.6rem; cursor: pointer; background: none; border: none;
}
.qz-link:hover { color: #5A2E4A; }
.qz-link-reset { color: #8C8880; margin-top: 1rem; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 640px) {
  .qz-page { padding: 2rem 1.2rem 3rem; }
  .qz-option { padding: 0.8rem 1rem; }
}
`;
