'use client';

/**
 * DecoderQuizClient — Anna's "Nervous System Decoder" quiz.
 *
 * Fully CMS-driven. The only thing in code is:
 *   - Scoring rule (A>=3 -> Clear, else B>=C -> Scrambled, else -> Faint)
 *   - Colour palette per result (mint / cream-light / lavender — the wireframe)
 *   - Mailchimp result-tag names (kept stable in code so Anna's journeys
 *     don't silently break if a copy edit changes the human-readable label)
 *
 * Everything else — the 5 questions, their A/B/C answers, the result
 * pages, all button + label text — comes from CMS via props.
 *
 * See cms/src/api/decoder-quiz-page/content-types/decoder-quiz-page/schema.json
 * for the editable fields. Anna can iterate without code changes.
 */

import { useState } from 'react';
import Link from 'next/link';

export type DecoderState = 'clear' | 'scrambled' | 'faint';

export type DecoderStateResult = {
  // Legacy polyvagal values (ventral/sympathetic/dorsal) still accepted
  // for backwards compatibility with old singleton records.
  state: DecoderState | 'ventral' | 'sympathetic' | 'dorsal';
  title: string;
  blurb: string;
  practiceIntro: string;
  meditationUrl: string;
  ctaLabel: string;
  ctaUrl: string;
};

export type DecoderQuestion = {
  text: string;
  answerA: string;
  answerB: string;
  answerC: string;
};

export type DecoderQuizCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  beginButtonLabel: string;
  backToLabel: string;
  backToUrl: string;
  emailGateTitle: string;
  emailGateIntro: string;
  emailGateButtonLabel: string;
  emailGateFineprint: string;
  practiceLabelClear: string;
  practiceLabelScrambled: string;
  practiceLabelFaint: string;
  priceMicrocopy: string;
  retakeButtonLabel: string;
};

// Legacy polyvagal slug -> Anna's brand-language state, for any singleton
// records that haven't been re-seeded yet.
const LEGACY_TO_NEW: Record<string, DecoderState> = {
  ventral: 'clear',
  sympathetic: 'scrambled',
  dorsal: 'faint',
};
function normaliseState(s: string): DecoderState {
  if (s === 'clear' || s === 'scrambled' || s === 'faint') return s;
  return LEGACY_TO_NEW[s] || 'scrambled';
}

type AnswerKey = 'A' | 'B' | 'C';

function scoreToState(counts: Record<AnswerKey, number>): DecoderState {
  if (counts.A >= 3) return 'clear';
  if (counts.B >= counts.C) return 'scrambled';
  return 'faint';
}

// Per-result theme (matches wireframe) — stays in code because it's a
// design system constraint, not editorial content.
const THEME: Record<DecoderState, { bg: string; accent: string; ctaBg: string }> = {
  clear:     { bg: '#E1F5EE', accent: '#5DCAA5', ctaBg: '#F280AA' },
  scrambled: { bg: '#FFF0D2', accent: '#FAA21B', ctaBg: '#F280AA' },
  faint:     { bg: '#E9EBF6', accent: '#7BAFDD', ctaBg: '#7BAFDD' },
};

// Mailchimp tag names — kept in code so Anna can edit display copy in CMS
// without accidentally breaking the journey triggers in Mailchimp.
const TAG_FOR_STATE: Record<DecoderState, string> = {
  clear: 'Decoder · Signal Clear',
  scrambled: 'Decoder · Signal Scrambled',
  faint: 'Decoder · Signal Faint',
};

interface Props {
  copy: DecoderQuizCopy;
  questions: DecoderQuestion[];
  results: DecoderStateResult[];
}

type Step = 'intro' | 'question' | 'email' | 'result';

export default function DecoderQuizClient({ copy, questions, results }: Props) {
  const [step, setStep] = useState<Step>('intro');
  const [questionIdx, setQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerKey[]>([]);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  function answer(key: AnswerKey) {
    const next = [...answers, key];
    setAnswers(next);
    if (questionIdx + 1 < questions.length) {
      setQuestionIdx(questionIdx + 1);
    } else {
      setStep('email');
    }
  }

  const counts: Record<AnswerKey, number> = answers.reduce(
    (acc, k) => ({ ...acc, [k]: acc[k] + 1 }),
    { A: 0, B: 0, C: 0 } as Record<AnswerKey, number>,
  );
  const winnerState: DecoderState = scoreToState(counts);
  const tag = TAG_FOR_STATE[winnerState];
  const theme = THEME[winnerState];
  const result = results.find((r) => normaliseState(r.state) === winnerState) || results[0] || null;

  const practiceLabel =
    winnerState === 'clear' ? copy.practiceLabelClear
      : winnerState === 'scrambled' ? copy.practiceLabelScrambled
        : copy.practiceLabelFaint;

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
    ? ((questionIdx + 1) / Math.max(1, questions.length)) * 100
    : step === 'email' ? 100 : 0;

  const currentQ = questions[questionIdx];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: quizStyles }} />
      <section className="dq-wrap" style={step === 'result' ? { background: theme.bg } : undefined}>
        <Link href={copy.backToUrl} className="dq-back">&larr; {copy.backToLabel}</Link>

        {step === 'intro' && (
          <div className="dq-card">
            <p className="dq-eyebrow">{copy.eyebrow}</p>
            <h1 className="dq-title">{copy.title}</h1>
            <p className="dq-intro">{copy.intro}</p>
            <div style={{ textAlign: 'center' }}>
              <button className="dq-btn dq-btn-primary" onClick={() => setStep('question')}>
                {copy.beginButtonLabel} &rarr;
              </button>
            </div>
          </div>
        )}

        {step === 'question' && currentQ && (
          <div className="dq-card">
            <div className="dq-progress">
              <span>Question {questionIdx + 1} of {questions.length}</span>
              <div className="dq-progress-bar">
                <div className="dq-progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
            <h2 className="dq-question">{currentQ.text}</h2>
            <div className="dq-options">
              <button className="dq-option" onClick={() => answer('A')}>
                <span className="dq-option-letter">A</span>
                <span>{currentQ.answerA}</span>
              </button>
              <button className="dq-option" onClick={() => answer('B')}>
                <span className="dq-option-letter">B</span>
                <span>{currentQ.answerB}</span>
              </button>
              <button className="dq-option" onClick={() => answer('C')}>
                <span className="dq-option-letter">C</span>
                <span>{currentQ.answerC}</span>
              </button>
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
            <h2 className="dq-title" style={{ textAlign: 'center' }}>{copy.emailGateTitle}</h2>
            <p className="dq-intro" style={{ textAlign: 'center' }}>{copy.emailGateIntro}</p>
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
                {submitting ? 'Sending…' : `${copy.emailGateButtonLabel} →`}
              </button>
              {submitError && <p className="dq-error">{submitError}</p>}
              <p className="dq-fineprint">{copy.emailGateFineprint}</p>
            </form>
          </div>
        )}

        {step === 'result' && result && (
          <div className="dq-card dq-result" style={{ borderTop: `4px solid ${theme.accent}`, background: '#fff' }}>
            <p className="dq-eyebrow" style={{ color: theme.accent }}>Your result</p>
            <h2 className="dq-title">{result.title}</h2>
            <div className="dq-blurb">
              {result.blurb.split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)}
            </div>
            {result.practiceIntro && (
              <div className="dq-practice" style={{ borderLeftColor: theme.accent }}>
                <span className="dq-practice-label" style={{ color: theme.accent }}>{practiceLabel}</span>
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
                {copy.priceMicrocopy && <p className="dq-price">{copy.priceMicrocopy}</p>}
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
            <button className="dq-btn dq-btn-ghost dq-retake" onClick={restart}>{copy.retakeButtonLabel}</button>
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
