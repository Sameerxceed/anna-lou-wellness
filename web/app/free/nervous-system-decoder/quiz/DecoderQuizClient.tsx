'use client';

/**
 * DecoderQuizClient — Anna's "Nervous System Decoder" quiz.
 *
 * Implements her 1 June 2026 wireframe spec exactly:
 *   - Five questions, A/B/C answers, one per screen, progress bar
 *   - Scoring: count A/B/C, then in order:
 *       A >= 3            -> Signal Clear   (mint background)
 *       else B >= C       -> Signal Scrambled (cream-light)
 *       else              -> Signal Faint   (lavender)
 *   - Email is captured AFTER Q5 and BEFORE the result reveal
 *     (this is the trigger that tags the subscriber in Mailchimp with
 *     the result-specific tag — Anna's journeys route from those tags)
 *   - Signal Clear: meditation player, no upsell
 *   - Signal Scrambled / Faint: REGULATED CTA (pink for scrambled,
 *     blue/gentler for faint)
 *
 * The 5 questions + their A/B/C answer text are hardcoded here. They
 * came straight from Anna's wireframe and are unlikely to change
 * frequently. Result page copy + meditation URL + CTA URL come from
 * Strapi's decoder-quiz-page singleton so Anna can iterate without code.
 */

import { useState } from 'react';
import Link from 'next/link';

// Internal state names match the wireframe + CMS enum.
export type DecoderState = 'clear' | 'scrambled' | 'faint';

export type DecoderStateResult = {
  // Accept the legacy polyvagal values too for backwards compatibility with
  // any singleton that still has them — the lookup map below normalises.
  state: DecoderState | 'ventral' | 'sympathetic' | 'dorsal';
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

// Maps legacy polyvagal slugs to Anna's brand-language states so old
// records keep rendering until they're updated in CMS.
const LEGACY_TO_NEW: Record<string, DecoderState> = {
  ventral: 'clear',
  sympathetic: 'scrambled',
  dorsal: 'faint',
};

function normaliseState(s: string): DecoderState {
  if (s === 'clear' || s === 'scrambled' || s === 'faint') return s;
  return LEGACY_TO_NEW[s] || 'scrambled';
}

// ─── Questions (Anna's wireframe, 1 Jun 2026) ───
type AnswerKey = 'A' | 'B' | 'C';
interface Question {
  text: string;
  answers: { key: AnswerKey; label: string }[];
}

const QUESTIONS: Question[] = [
  {
    text: 'When I try to rest, lately…',
    answers: [
      { key: 'A', label: 'I can settle, even if it takes a moment.' },
      { key: 'B', label: 'My mind starts racing and I cannot switch off.' },
      { key: 'C', label: 'I shut down or zone out rather than properly rest.' },
    ],
  },
  {
    text: 'When I look at my phone or read the news…',
    answers: [
      { key: 'A', label: 'I can engage and put it down without it staying with me.' },
      { key: 'B', label: 'I feel it land in my body and stay buzzing afterwards.' },
      { key: 'C', label: 'I scroll without really taking it in, or I avoid it altogether.' },
    ],
  },
  {
    text: 'Other people’s moods and stress…',
    answers: [
      { key: 'A', label: 'I notice them, but they do not pull me out of myself.' },
      { key: 'B', label: 'Land in me. I pick them up and carry them.' },
      { key: 'C', label: 'Reach me faintly. It can feel like I am behind glass.' },
    ],
  },
  {
    text: 'When something small goes wrong…',
    answers: [
      { key: 'A', label: 'I can take it, breathe, and move on.' },
      { key: 'B', label: 'I am tipped over more easily than I would like.' },
      { key: 'C', label: 'I freeze or go quiet, even when I want to respond.' },
    ],
  },
  {
    text: 'If I check in with myself right now, what I notice is…',
    answers: [
      { key: 'A', label: 'I feel mostly here, in my body.' },
      { key: 'B', label: 'I feel wired or on edge.' },
      { key: 'C', label: 'I feel flat, foggy, or far away from myself.' },
    ],
  },
];

function scoreToState(counts: Record<AnswerKey, number>): DecoderState {
  if (counts.A >= 3) return 'clear';
  if (counts.B >= counts.C) return 'scrambled';
  return 'faint';
}

// ─── Per-result theme (matches wireframe) ───
const THEME: Record<DecoderState, { bg: string; accent: string; ctaBg: string; pillTagLabel: string }> = {
  clear:     { bg: '#E1F5EE', accent: '#5DCAA5', ctaBg: '#F280AA', pillTagLabel: 'Signal Clear' },
  scrambled: { bg: '#FFF0D2', accent: '#FAA21B', ctaBg: '#F280AA', pillTagLabel: 'Signal Scrambled' },
  faint:     { bg: '#E9EBF6', accent: '#7BAFDD', ctaBg: '#7BAFDD', pillTagLabel: 'Signal Faint' },
};

// Mailchimp tags Anna's Customer Journeys listen for. Keep these stable —
// changing them silently breaks her email flows.
const TAG_FOR_STATE: Record<DecoderState, string> = {
  clear: 'Decoder · Signal Clear',
  scrambled: 'Decoder · Signal Scrambled',
  faint: 'Decoder · Signal Faint',
};

interface Props {
  hero: DecoderQuizHero;
  results: DecoderStateResult[];
}

type Step = 'intro' | 'question' | 'email' | 'result';

export default function DecoderQuizClient({ hero, results }: Props) {
  const [step, setStep] = useState<Step>('intro');
  const [questionIdx, setQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerKey[]>([]);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  function answer(key: AnswerKey) {
    const nextAnswers = [...answers, key];
    setAnswers(nextAnswers);
    if (questionIdx + 1 < QUESTIONS.length) {
      setQuestionIdx(questionIdx + 1);
    } else {
      // Last question answered — move to email capture (gates the result)
      setStep('email');
    }
  }

  const counts: Record<AnswerKey, number> = answers.reduce(
    (acc, k) => ({ ...acc, [k]: acc[k] + 1 }),
    { A: 0, B: 0, C: 0 } as Record<AnswerKey, number>,
  );
  const winnerState: DecoderState = scoreToState(counts);
  const tag = TAG_FOR_STATE[winnerState];

  // Find the matching CMS result, normalising any legacy state slugs
  const result = results.find((r) => normaliseState(r.state) === winnerState) || results[0] || null;
  const theme = THEME[winnerState];

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/lead/decoder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          firstName: firstName.trim() || undefined,
          source: 'decoder-quiz',
          result: winnerState,
          // Send the human-readable tag too so the API can use it directly
          // without re-deriving — keeps tag naming in one place.
          resultTag: tag,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitError(data?.error || 'Something went wrong. Please try again.');
        return;
      }
      setStep('result');
    } catch {
      setSubmitError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function restart() {
    setStep('intro');
    setQuestionIdx(0);
    setAnswers([]);
    setEmail('');
    setFirstName('');
    setSubmitError('');
  }

  const progressPct = step === 'question'
    ? ((questionIdx + 1) / QUESTIONS.length) * 100
    : step === 'email'
      ? 100
      : 0;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: quizStyles }} />
      <section className="dq-wrap" style={step === 'result' ? { background: theme.bg } : undefined}>
        <Link href={hero.backToUrl} className="dq-back">&larr; {hero.backToLabel}</Link>

        {step === 'intro' && (
          <div className="dq-card">
            <p className="dq-eyebrow">{hero.eyebrow}</p>
            <h1 className="dq-title">{hero.title}</h1>
            <p className="dq-intro">{hero.intro}</p>
            <button className="dq-btn dq-btn-primary" onClick={() => setStep('question')}>
              Begin the Decoder &rarr;
            </button>
          </div>
        )}

        {step === 'question' && (
          <div className="dq-card">
            <div className="dq-progress">
              <span>Question {questionIdx + 1} of {QUESTIONS.length}</span>
              <div className="dq-progress-bar">
                <div className="dq-progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
            <h2 className="dq-question">{QUESTIONS[questionIdx].text}</h2>
            <div className="dq-options">
              {QUESTIONS[questionIdx].answers.map((ans) => (
                <button
                  key={ans.key}
                  className="dq-option"
                  onClick={() => answer(ans.key)}
                >
                  <span className="dq-option-letter">{ans.key}</span>
                  <span>{ans.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'email' && (
          <div className="dq-card dq-email-card">
            <div className="dq-progress">
              <span>Almost there</span>
              <div className="dq-progress-bar">
                <div className="dq-progress-fill" style={{ width: '100%' }} />
              </div>
            </div>
            <h2 className="dq-title" style={{ textAlign: 'center' }}>Where would you like your result?</h2>
            <p className="dq-intro" style={{ textAlign: 'center' }}>
              Pop your email in, and your result, your practice, and a follow-up are yours.
            </p>
            <form onSubmit={submitEmail} className="dq-email-form">
              <input
                type="text"
                placeholder="First name (optional)"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                className="dq-input"
              />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="dq-input"
              />
              <button
                type="submit"
                disabled={submitting || !email.trim()}
                className="dq-btn dq-btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {submitting ? 'Sending…' : 'Show me my result →'}
              </button>
              {submitError && <p className="dq-error">{submitError}</p>}
              <p className="dq-fineprint">
                One short email. Unsubscribe any time.
              </p>
            </form>
          </div>
        )}

        {step === 'result' && result && (
          <div
            className="dq-card dq-result"
            style={{ borderTop: `4px solid ${theme.accent}`, background: '#fff' }}
          >
            <p className="dq-eyebrow" style={{ color: theme.accent }}>Your result</p>
            <h2 className="dq-title">{result.title}</h2>
            <div className="dq-blurb">
              {result.blurb.split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)}
            </div>
            {result.practiceIntro && (
              <div className="dq-practice" style={{ borderLeftColor: theme.accent }}>
                <span className="dq-practice-label" style={{ color: theme.accent }}>
                  {winnerState === 'clear' ? 'A short meditation to stay clear' : winnerState === 'scrambled' ? 'Try this now' : 'One small thing'}
                </span>
                <p>{result.practiceIntro}</p>
              </div>
            )}
            {winnerState === 'clear' && result.meditationUrl && (
              <div className="dq-meditation">
                {result.meditationUrl.includes('youtube') || result.meditationUrl.includes('youtu.be') ? (
                  <iframe
                    src={toEmbedUrl(result.meditationUrl)}
                    title="Meditation to stay clear"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                ) : (
                  <audio controls src={result.meditationUrl} preload="metadata" />
                )}
              </div>
            )}
            {(winnerState === 'scrambled' || winnerState === 'faint') && (
              <>
                <div className="dq-result-cta">
                  <Link
                    href={result.ctaUrl || '/the-work/regulated'}
                    className="dq-btn dq-btn-primary"
                    style={{ background: theme.ctaBg, borderColor: theme.ctaBg }}
                  >
                    {result.ctaLabel || 'See REGULATED'} &rarr;
                  </Link>
                </div>
                <p className="dq-price">Pay what you feel, from &pound;5.</p>
              </>
            )}
            {winnerState === 'clear' && (
              <div className="dq-result-cta">
                <Link
                  href={result.ctaUrl || '/community/reset-room'}
                  className="dq-btn dq-btn-primary"
                  style={{ background: theme.accent, borderColor: theme.accent }}
                >
                  {result.ctaLabel || 'Step inside The Reset Room'} &rarr;
                </Link>
              </div>
            )}
            <button className="dq-btn dq-btn-ghost dq-retake" onClick={restart}>Retake the quiz</button>
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
.dq-wrap { background:#fff; padding:2rem 1.5rem 3rem; min-height:70vh; transition:background 0.4s; }
.dq-back { display:block; max-width:1100px; margin:0 auto 1.5rem; font-family:Mulish,sans-serif; font-size:0.7rem; letter-spacing:0.14em; text-transform:uppercase; color:#8C8880; text-decoration:none; }
.dq-back:hover { color:#231F20; }
.dq-card { max-width:720px; margin:0 auto; background:#FAF7F1; border-radius:8px; padding:2.5rem 2rem; box-shadow:0 6px 30px rgba(0,0,0,0.05); }
.dq-email-card { background:#FCE8EF; }
.dq-eyebrow { font-family:Mulish,sans-serif; font-weight:500; font-size:0.65rem; letter-spacing:0.3em; text-transform:uppercase; color:#6E3A5A; margin-bottom:0.8rem; text-align:center; }
.dq-title { font-family:'EB Garamond',Georgia,serif; font-weight:400; font-size:clamp(1.7rem,3.5vw,2.4rem); color:#231F20; line-height:1.3; margin-bottom:1rem; text-wrap:balance; text-align:center; }
.dq-question { font-family:'EB Garamond',Georgia,serif; font-style:italic; font-weight:400; font-size:clamp(1.3rem,2.4vw,1.7rem); color:#231F20; line-height:1.4; margin-bottom:1.5rem; text-align:center; }
.dq-intro { font-family:'EB Garamond',Georgia,serif; font-size:1.05rem; line-height:1.8; color:#3D3D3A; margin-bottom:1.8rem; text-align:center; }
.dq-progress { display:flex; align-items:center; gap:14px; margin-bottom:1.8rem; color:#8C8880; font-size:0.6rem; letter-spacing:0.18em; text-transform:uppercase; font-family:Mulish,sans-serif; }
.dq-progress-bar { flex:1; height:2px; background:rgba(35,31,32,0.12); position:relative; border-radius:2px; }
.dq-progress-fill { position:absolute; left:0; top:0; height:100%; background:#F280AA; transition:width 0.4s; border-radius:2px; }
.dq-options { display:flex; flex-direction:column; gap:0.6rem; }
.dq-option { font-family:'EB Garamond',Georgia,serif; font-size:1rem; line-height:1.6; color:#231F20; background:#fff; border:1px solid rgba(35,31,32,0.12); border-radius:6px; padding:1rem 1.2rem; text-align:left; cursor:pointer; transition:all 0.2s; display:flex; gap:0.9rem; align-items:flex-start; }
.dq-option:hover { border-color:#6E3A5A; background:#FFF8FA; transform:translateY(-1px); }
.dq-option-letter { font-family:'EB Garamond',Georgia,serif; font-weight:500; color:#F280AA; flex-shrink:0; min-width:1rem; }
.dq-btn { font-family:Mulish,sans-serif; font-weight:600; font-size:0.7rem; letter-spacing:0.18em; text-transform:uppercase; padding:0.95rem 1.6rem; border-radius:3px; border:1px solid; cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; gap:0.4rem; transition:opacity 0.2s, transform 0.2s; }
.dq-btn:hover:not(:disabled) { opacity:0.9; transform:translateY(-1px); }
.dq-btn:disabled { opacity:0.5; cursor:not-allowed; }
.dq-btn-primary { background:#F280AA; color:#fff; border-color:#F280AA; }
.dq-btn-ghost { background:transparent; color:#6E3A5A; border-color:rgba(110,58,90,0.3); }
.dq-btn-ghost:hover { background:rgba(110,58,90,0.06); }
.dq-email-form { max-width:380px; margin:0 auto; display:flex; flex-direction:column; gap:0.7rem; }
.dq-input { font-family:'EB Garamond',Georgia,serif; font-size:0.95rem; padding:0.85rem 1rem; background:#fff; border:1px solid rgba(35,31,32,0.18); border-radius:4px; outline:none; transition:border-color 0.2s; }
.dq-input:focus { border-color:#F280AA; }
.dq-error { color:#A01F1D; font-size:0.85rem; font-family:'EB Garamond',Georgia,serif; margin:0; text-align:center; }
.dq-fineprint { color:#8C8880; font-size:0.75rem; font-family:'EB Garamond',Georgia,serif; font-style:italic; margin:0.4rem 0 0; text-align:center; }
.dq-result .dq-blurb { font-family:'EB Garamond',Georgia,serif; font-size:1.05rem; line-height:1.85; color:#3D3D3A; margin-bottom:1.2rem; }
.dq-result .dq-blurb p { margin-bottom:1rem; }
.dq-practice { background:rgba(35,31,32,0.03); padding:1.3rem 1.4rem; margin:1.2rem 0; border-left:3px solid; border-radius:0 4px 4px 0; }
.dq-practice-label { display:block; text-transform:uppercase; letter-spacing:0.22em; font-size:0.6rem; font-weight:500; font-family:Mulish,sans-serif; margin-bottom:0.6rem; }
.dq-practice p { font-family:'EB Garamond',Georgia,serif; font-size:0.95rem; line-height:1.7; color:#3D3D3A; margin:0; }
.dq-meditation { margin:1rem 0 1.5rem; }
.dq-meditation iframe { width:100%; aspect-ratio:16/9; border:0; border-radius:6px; display:block; }
.dq-meditation audio { width:100%; }
.dq-result-cta { display:flex; justify-content:center; margin-top:1.5rem; }
.dq-price { font-family:'EB Garamond',Georgia,serif; font-style:italic; font-size:0.9rem; color:#8C8880; text-align:center; margin-top:0.6rem; }
.dq-retake { margin:1.4rem auto 0; display:flex; justify-content:center; }
@media (max-width:640px) { .dq-card { padding:2rem 1.4rem; } .dq-result-cta { flex-direction:column; align-items:stretch; } .dq-btn { justify-content:center; } }
`;
