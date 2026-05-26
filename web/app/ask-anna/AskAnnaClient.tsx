'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import TurnstileWidget from '@/components/TurnstileWidget';
import { RenderedMessage } from '@/lib/render-message';

/**
 * AskAnna — AI assessment + follow-up chat.
 *
 * Flow:
 *   intro → questions (4) → loading → result + follow-up chat
 *
 * All Claude calls go through /api/ask-anna (server-side). The API key
 * lives in Coolify env vars; the browser never sees it. Turnstile only
 * gates the first call (the recommendation); follow-ups skip CAPTCHA to
 * keep the chat fluid.
 *
 * Visuals match the site's existing typography (EB Garamond / Mulish)
 * rather than the bespoke layout in the original brief — so it sits
 * inside the standard nav + footer and feels like the rest of the site.
 */

const ACCENT = '#F280AA';
const KICKER = '#6E3A5A';

interface QuestionOption {
  label: string;
  value: string;
}
interface Question {
  id: number;
  question: string;
  options: QuestionOption[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: 'Where are you right now, honestly?',
    options: [
      { label: 'I have done a lot of the work — therapy, journalling, figuring it out — and I am still stuck on the same patterns.', value: 'stuck-after-the-work' },
      { label: 'I am in the middle of something hard — a relationship ending, a career change, a loss, a transition.', value: 'in-transition' },
      { label: 'My business or career feels stuck. I have the strategy but not the energy or the alignment.', value: 'founder-stuck' },
      { label: 'I feel disconnected from myself — spiritually, physically, emotionally. Like I have lost the thread.', value: 'disconnected' },
      { label: 'I am healing from something specific — abuse, trauma, a difficult relationship — and I want real recovery, not surface work.', value: 'recovery' },
    ],
  },
  {
    id: 2,
    question: 'What does your body feel like most of the time?',
    options: [
      { label: 'Tense, braced, like I am always waiting for something to go wrong.', value: 'tense' },
      { label: 'Exhausted. Like I have been running for so long I have forgotten what rest feels like.', value: 'exhausted' },
      { label: 'Numb, disconnected — I struggle to feel much at all.', value: 'numb' },
      { label: 'Anxious, reactive — my nervous system is very much online and very loud.', value: 'anxious' },
      { label: 'Mostly okay, but I know there is more available to me and I want to find it.', value: 'mostly-okay' },
    ],
  },
  {
    id: 3,
    question: 'What would "better" actually feel like for you?',
    options: [
      { label: 'Calm. A genuine sense of safety in my own body that I have not felt in years.', value: 'calm' },
      { label: 'Clarity. Knowing what I actually want and being able to move toward it.', value: 'clarity' },
      { label: 'Flow. Building and creating from a place of alignment, not pressure.', value: 'flow' },
      { label: 'Connection — to myself, to others, to something bigger.', value: 'connection' },
      { label: 'Freedom. To stop carrying things that were never mine to carry.', value: 'freedom' },
    ],
  },
  {
    id: 4,
    question: 'What feels most true right now?',
    options: [
      { label: 'I understand my patterns. I just cannot seem to change them through thinking alone.', value: 'know-cannot-shift' },
      { label: 'I have tried lots of approaches. Nothing has quite reached the right level.', value: 'tried-everything' },
      { label: 'I have not worked with anyone before. I am ready but I do not know where to start.', value: 'new-to-this' },
      { label: 'I am a founder or leader and my nervous system is running my decisions in ways I no longer want.', value: 'founder-nervous-system' },
      { label: 'I am recovering from something that shook my sense of self completely.', value: 'recovering' },
    ],
  },
];

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

type Step = 'intro' | 'questions' | 'loading' | 'result';

export default function AskAnnaClient() {
  const [step, setStep] = useState<Step>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, chatLoading]);

  // ── Streaming helper. Reads /api/ask-anna chunk-by-chunk and updates
  //    the in-flight assistant message as text arrives.
  async function streamReply(body: unknown): Promise<void> {
    setError('');
    setChatLoading(true);
    // Append an empty assistant message we'll fill in.
    setChat((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/ask-anna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Something went wrong.' }));
        setError(data?.error || 'Something went wrong. Please try again.');
        // Remove the empty placeholder.
        setChat((prev) => prev.slice(0, -1));
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setError('Streaming not supported by this browser.');
        setChat((prev) => prev.slice(0, -1));
        return;
      }
      const decoder = new TextDecoder();
      let accumulated = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setChat((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: 'assistant', content: accumulated };
          return next;
        });
      }
    } catch (err) {
      setError('Connection interrupted. Please try again.');
      setChat((prev) => prev.slice(0, -1));
    } finally {
      setChatLoading(false);
    }
  }

  const handleStart = () => setStep('questions');

  const handleNext = async () => {
    if (!selected) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    setSelected(null);

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
      return;
    }
    // Final question answered — fire the recommendation.
    setStep('loading');
    setChat([]);
    await streamReply({ mode: 'recommend', answers: newAnswers, turnstileToken });
    setStep('result');
  };

  const handleBack = () => {
    if (currentQ === 0) {
      setStep('intro');
    } else {
      setCurrentQ(currentQ - 1);
      setAnswers(answers.slice(0, -1));
    }
    setSelected(null);
  };

  const handleFollowUp = async (questionOverride?: string) => {
    const q = (questionOverride ?? chatInput).trim();
    if (!q || chatLoading) return;
    setChatInput('');
    // Add the user message first.
    setChat((prev) => [...prev, { role: 'user', content: q }]);
    // The history sent to the server INCLUDES the recommendation we already streamed.
    // We snapshot here because setChat is async — pass the just-built array.
    const history = [...chat, { role: 'user' as const, content: q }];
    // Server expects: { mode: 'follow_up', history, question }
    // But for the model we want the new user turn appended once, not twice.
    // Trick: history without the new question, then question separate.
    const priorHistory = history.slice(0, -1);
    await streamReply({ mode: 'follow_up', history: priorHistory, question: q });
  };

  const handleRestart = () => {
    setStep('intro');
    setCurrentQ(0);
    setAnswers([]);
    setSelected(null);
    setChat([]);
    setChatInput('');
    setError('');
  };

  const progress = (currentQ / QUESTIONS.length) * 100 + (1 / QUESTIONS.length) * 100;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <article className="aa-page">
        <div className="aa-inner">
          {step === 'intro' && (
            <div className="aa-intro">
              <div className="aa-badge" style={{ background: '#FCE8EF', color: ACCENT }}>AI Coaching Assessment</div>
              <h1 className="aa-h1">
                Not sure where to start?<br />
                <em>Let&apos;s find out together.</em>
              </h1>
              <p className="aa-tagline">
                Four honest questions and Anna will give you a personal recommendation — which programme, session, or starting point fits where you actually are right now. Takes about two minutes. Always free.
              </p>
              <div className="aa-turnstile-wrap">
                <TurnstileWidget onVerify={setTurnstileToken} />
              </div>
              <button
                type="button"
                onClick={handleStart}
                className="aa-btn-primary"
              >
                Begin the assessment <span aria-hidden>→</span>
              </button>
              <div className="aa-divider">
                TRE · Breathwork · Flash EMDR · IFS · Somatic Coaching · The Signal Method™
              </div>
            </div>
          )}

          {step === 'questions' && (
            <div className="aa-questions">
              <div className="aa-progress">
                <div className="aa-progress-bar" style={{ width: `${progress}%` }} />
              </div>
              <p className="aa-q-counter" style={{ color: KICKER }}>
                Question {currentQ + 1} of {QUESTIONS.length}
              </p>
              <h2 className="aa-q-title">{QUESTIONS[currentQ].question}</h2>
              <div className="aa-options">
                {QUESTIONS[currentQ].options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelected(opt.value)}
                    className={`aa-option ${selected === opt.value ? 'is-selected' : ''}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="aa-nav">
                <button type="button" onClick={handleBack} className="aa-btn-back">&larr; Back</button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!selected}
                  className="aa-btn-next"
                  style={{ background: selected ? ACCENT : '#D5D0C8' }}
                >
                  {currentQ < QUESTIONS.length - 1 ? 'Next →' : 'Get my recommendation →'}
                </button>
              </div>
            </div>
          )}

          {step === 'loading' && (
            <div className="aa-loading">
              <div className="aa-loading-dot" />
              <p>Reading your answers…<br /><span>Anna is putting together your personal recommendation.</span></p>
            </div>
          )}

          {step === 'result' && (
            <div className="aa-result">
              <p className="aa-kicker" style={{ color: KICKER }}>Your personal recommendation from Anna</p>
              {chat.map((msg, i) => (
                <div key={i} className={msg.role === 'user' ? 'aa-msg-user' : 'aa-msg-anna'}>
                  {msg.role === 'user' && (
                    <p className="aa-q-counter" style={{ marginBottom: 6 }}>You asked</p>
                  )}
                  <RenderedMessage
                    content={msg.content}
                    paragraphClassName={msg.role === 'user' ? 'aa-msg-user-text' : 'aa-msg-anna-text'}
                    linkColour={msg.role === 'user' ? undefined : KICKER}
                  />
                </div>
              ))}
              {chatLoading && (
                <div className="aa-thinking" style={{ color: ACCENT }}>Anna is thinking…</div>
              )}
              {error && <div className="aa-error">{error}</div>}
              <div ref={chatEndRef} />

              <div className="aa-followup">
                <p className="aa-followup-label">Ask Anna a follow-up</p>
                <p className="aa-followup-hint">Not sure about something? Want to know more about a specific programme?</p>
                <div className="aa-followup-row">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleFollowUp(); }}
                    placeholder="e.g. What is the difference between TRE and EMDR?"
                    className="aa-followup-input"
                    disabled={chatLoading}
                  />
                  <button
                    type="button"
                    onClick={() => handleFollowUp()}
                    disabled={!chatInput.trim() || chatLoading}
                    className="aa-followup-btn"
                    style={{ background: chatInput.trim() && !chatLoading ? '#231F20' : '#D5D0C8' }}
                  >
                    Ask <span aria-hidden>→</span>
                  </button>
                </div>
                <div className="aa-suggestions">
                  {[
                    'What does a session actually involve?',
                    'How is this different from therapy?',
                    'Can I do this online?',
                    'How much do the programmes cost?',
                    'What is TRE and does it work?',
                  ].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleFollowUp(q)}
                      disabled={chatLoading}
                      className="aa-suggestion"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div className="aa-cta-row">
                <Link href="/contact" className="aa-cta-primary" style={{ background: ACCENT }}>
                  Book a discovery call <span aria-hidden>→</span>
                </Link>
                <Link href="/the-work" className="aa-cta-secondary">
                  Browse all coaching
                </Link>
                <button type="button" onClick={handleRestart} className="aa-restart">Start again</button>
              </div>
            </div>
          )}
        </div>
      </article>
    </>
  );
}

const styles = `
.aa-page { background:#F5F3EF; padding:3rem 2rem 4rem; min-height:60vh; }
.aa-inner { max-width:720px; margin:0 auto; }

/* INTRO */
.aa-intro { text-align:center; }
.aa-badge { display:inline-block; padding:6px 14px; border-radius:3px; font-family:Mulish,sans-serif; font-size:0.6rem; font-weight:600; letter-spacing:0.16em; text-transform:uppercase; margin-bottom:1.5rem; }
.aa-h1 { font-family:'EB Garamond',Georgia,serif; font-weight:400; font-size:clamp(2rem,5vw,2.8rem); color:#231F20; line-height:1.2; margin-bottom:1.2rem; text-wrap:balance; }
.aa-h1 em { color:#8C8880; }
.aa-tagline { font-family:'EB Garamond',Georgia,serif; font-style:italic; font-size:1.1rem; color:#3D3D3A; line-height:1.7; max-width:540px; margin:0 auto 1.5rem; }
.aa-turnstile-wrap { display:flex; justify-content:center; margin-bottom:1.5rem; }
.aa-btn-primary { background:#231F20; color:#fff; border:none; padding:14px 36px; font-family:Mulish,sans-serif; font-size:0.7rem; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; cursor:pointer; border-radius:3px; transition:opacity 0.2s; }
.aa-btn-primary:hover { opacity:0.85; }
.aa-divider { margin-top:2.5rem; padding-top:1.5rem; border-top:1px solid #D5D0C8; font-family:Mulish,sans-serif; font-size:0.6rem; color:#8C8880; letter-spacing:0.1em; text-transform:uppercase; }

/* QUESTIONS */
.aa-progress { height:2px; background:#D5D0C8; margin-bottom:2rem; border-radius:1px; overflow:hidden; }
.aa-progress-bar { height:100%; background:${ACCENT}; transition:width 0.4s ease; border-radius:1px; }
.aa-q-counter { font-family:Mulish,sans-serif; font-size:0.6rem; font-weight:600; letter-spacing:0.18em; text-transform:uppercase; margin-bottom:0.5rem; }
.aa-q-title { font-family:'EB Garamond',Georgia,serif; font-weight:400; font-size:clamp(1.5rem,3.5vw,2rem); color:#231F20; line-height:1.3; margin-bottom:1.5rem; text-wrap:balance; }
.aa-options { display:flex; flex-direction:column; gap:0.6rem; margin-bottom:1.5rem; }
.aa-option { background:#fff; border:1px solid #D5D0C8; padding:14px 18px; text-align:left; cursor:pointer; font-family:'EB Garamond',Georgia,serif; font-size:1rem; font-style:italic; color:#3D3D3A; line-height:1.5; transition:all 0.15s ease; border-radius:3px; }
.aa-option:hover { border-color:${ACCENT}; }
.aa-option.is-selected { background:#FCE8EF; border-color:${ACCENT}; border-width:1.5px; color:#231F20; }
.aa-nav { display:flex; justify-content:space-between; align-items:center; }
.aa-btn-back { background:transparent; border:none; font-family:Mulish,sans-serif; font-size:0.65rem; color:#8C8880; cursor:pointer; letter-spacing:0.1em; text-transform:uppercase; padding:6px 0; }
.aa-btn-next { color:#fff; border:none; padding:12px 26px; font-family:Mulish,sans-serif; font-size:0.65rem; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; cursor:pointer; border-radius:3px; transition:all 0.2s; }
.aa-btn-next:disabled { cursor:not-allowed; color:#8C8880; }

/* LOADING */
.aa-loading { text-align:center; padding:3rem 0; }
.aa-loading-dot { display:inline-block; width:14px; height:14px; background:${ACCENT}; border-radius:50%; animation:aa-pulse 1.4s ease-in-out infinite; margin-bottom:1.2rem; }
@keyframes aa-pulse { 0%,100% { opacity:0.3; transform:scale(0.9); } 50% { opacity:1; transform:scale(1.1); } }
.aa-loading p { font-family:'EB Garamond',Georgia,serif; font-style:italic; font-size:1.2rem; color:#8C8880; line-height:1.6; }
.aa-loading span { font-size:0.95rem; }

/* RESULT */
.aa-kicker { font-family:Mulish,sans-serif; font-size:0.6rem; font-weight:600; letter-spacing:0.18em; text-transform:uppercase; margin-bottom:1rem; }
.aa-msg-anna { background:#FCE8EF; border-left:3px solid ${ACCENT}; padding:1.5rem 1.8rem; margin-bottom:1rem; border-radius:3px; }
.aa-msg-anna-text { font-family:'EB Garamond',Georgia,serif; font-style:italic; font-size:1.05rem; color:#231F20; line-height:1.8; margin:0 0 0.8rem; }
.aa-msg-anna-text:last-child { margin-bottom:0; }
.aa-msg-user { background:#fff; border:1px solid #D5D0C8; padding:1rem 1.2rem; margin-bottom:1rem; border-radius:3px; }
.aa-msg-user-text { font-family:'EB Garamond',Georgia,serif; font-size:0.95rem; color:#3D3D3A; line-height:1.6; margin:0; }
.aa-thinking { font-family:'EB Garamond',Georgia,serif; font-style:italic; font-size:0.95rem; padding:0.5rem 0; opacity:0.75; }
.aa-error { font-family:Mulish,sans-serif; font-size:0.85rem; color:#B12B2B; padding:0.75rem 1rem; background:#FFF1F1; border-radius:3px; margin-bottom:1rem; }

.aa-followup { background:#fff; border:1px solid #D5D0C8; padding:1.3rem 1.5rem; border-radius:3px; margin-top:1.5rem; }
.aa-followup-label { font-family:Mulish,sans-serif; font-size:0.6rem; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:#8C8880; margin:0 0 0.4rem; }
.aa-followup-hint { font-family:'EB Garamond',Georgia,serif; font-style:italic; font-size:0.9rem; color:#8C8880; line-height:1.5; margin:0 0 0.9rem; }
.aa-followup-row { display:flex; gap:0; margin-bottom:0.8rem; }
.aa-followup-input { flex:1; padding:11px 14px; border:1px solid #D5D0C8; border-right:none; font-family:'EB Garamond',Georgia,serif; font-size:0.95rem; font-style:italic; color:#231F20; background:#F5F3EF; outline:none; border-top-left-radius:3px; border-bottom-left-radius:3px; }
.aa-followup-input:focus { border-color:${ACCENT}; }
.aa-followup-input:disabled { opacity:0.5; }
.aa-followup-btn { color:#fff; border:none; padding:11px 18px; font-family:Mulish,sans-serif; font-size:0.65rem; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; cursor:pointer; white-space:nowrap; border-top-right-radius:3px; border-bottom-right-radius:3px; }
.aa-followup-btn:disabled { cursor:not-allowed; }
.aa-suggestions { display:flex; flex-wrap:wrap; gap:6px; }
.aa-suggestion { background:#F5F3EF; border:1px solid #D5D0C8; padding:6px 12px; font-family:'EB Garamond',Georgia,serif; font-size:0.85rem; font-style:italic; color:#3D3D3A; cursor:pointer; border-radius:3px; transition:all 0.15s; }
.aa-suggestion:hover:not(:disabled) { background:#fff; border-color:${ACCENT}; }
.aa-suggestion:disabled { opacity:0.5; cursor:not-allowed; }

.aa-cta-row { margin-top:1.8rem; padding-top:1.5rem; border-top:1px solid #D5D0C8; display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
.aa-cta-primary { color:#fff; padding:11px 22px; font-family:Mulish,sans-serif; font-size:0.65rem; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; text-decoration:none; border-radius:3px; transition:opacity 0.2s; }
.aa-cta-primary:hover { opacity:0.85; }
.aa-cta-secondary { background:transparent; color:#231F20; border:1px solid #231F20; padding:10px 22px; font-family:Mulish,sans-serif; font-size:0.65rem; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; text-decoration:none; border-radius:3px; transition:all 0.2s; }
.aa-cta-secondary:hover { background:#231F20; color:#fff; }
.aa-restart { margin-left:auto; background:transparent; border:none; font-family:Mulish,sans-serif; font-size:0.6rem; color:#8C8880; cursor:pointer; letter-spacing:0.1em; text-transform:uppercase; text-decoration:underline; padding:6px 0; }

@media (max-width:700px) {
  .aa-page { padding:2rem 1.2rem 3rem; }
  .aa-followup-row { flex-direction:column; gap:8px; }
  .aa-followup-input { border-right:1px solid #D5D0C8; border-radius:3px; }
  .aa-followup-btn { border-radius:3px; padding:12px; }
  .aa-cta-row { flex-direction:column; align-items:stretch; }
  .aa-restart { margin-left:0; text-align:center; }
}
`;
