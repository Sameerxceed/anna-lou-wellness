'use client';

/**
 * PractitionerEnquiryButton — "Apply to be listed" CTA on /practitioners.
 *
 * Clicking the button opens a modal form (name, email, phone, practice,
 * message). Submission POSTs to /api/lead/practitioner-enquiry which:
 *   1. Tags the lead in Mailchimp as "Practitioner Enquiry"
 *   2. Sends Anna an admin notification email (template `admin_practitioner_enquiry`)
 *
 * The form is intentionally short — 3 required fields + 2 optional.
 * Long forms drop conversion. Anna can follow up via email for more info.
 */

import { useEffect, useState } from 'react';
import { trackEvent } from '@/lib/analytics';

interface Props {
  accentColour?: string;
  buttonLabel?: string;
  headline?: string;
  body?: string;
}

export default function PractitionerEnquiryButton({
  accentColour = '#6E3A5A',
  buttonLabel = 'Apply to be listed',
  headline = 'Are you a practitioner?',
  body = 'Anna curates this circle by hand. If your practice aligns with the work, send a quick note below and she will be in touch.',
}: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    first_name: '',
    email: '',
    phone: '',
    practice: '',
    message: '',
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const update = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/lead/practitioner-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt.slice(0, 200)}`);
      }
      trackEvent('generate_lead', { method: 'practitioner_enquiry', value: 0, currency: 'GBP' }, 'Lead');
      setDone(true);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Email hello@annalouwellness.com if it keeps failing.');
    } finally {
      setSubmitting(false);
    }
  };

  const close = () => {
    setOpen(false);
    // Reset after the close animation finishes so the user doesn't see
    // the form flash back to empty mid-close.
    setTimeout(() => {
      setDone(false);
      setError(null);
      setForm({ first_name: '', email: '', phone: '', practice: '', message: '' });
    }, 250);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      {/* Call-out block on the page itself */}
      <section className="pe-cta-block" style={{ borderColor: accentColour }}>
        <div className="pe-cta-inner">
          <p className="pe-cta-kicker" style={{ color: accentColour }}>For Practitioners</p>
          <h2 className="pe-cta-headline">{headline}</h2>
          <p className="pe-cta-body">{body}</p>
          <button
            type="button"
            className="pe-cta-btn"
            style={{ background: accentColour }}
            onClick={() => setOpen(true)}
          >
            {buttonLabel} &rarr;
          </button>
        </div>
      </section>

      {/* Modal */}
      {open && (
        <div
          className="pe-modal-backdrop"
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pe-modal-headline"
        >
          <div className="pe-modal-card">
            <button type="button" className="pe-modal-close" aria-label="Close" onClick={close}>&times;</button>

            {done ? (
              <div className="pe-done">
                <p className="pe-done-eyebrow" style={{ color: accentColour }}>Received</p>
                <h3 className="pe-done-title">Thank you.</h3>
                <p className="pe-done-body">Your enquiry is in. Anna will be in touch directly within 48 hours.</p>
                <button type="button" className="pe-done-close" onClick={close}>Close</button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <p className="pe-form-kicker" style={{ color: accentColour }}>Practitioner enquiry</p>
                <h3 id="pe-modal-headline" className="pe-form-headline">A few quick details.</h3>

                <label className="pe-label">
                  <span className="pe-label-text">Name <span className="pe-req">*</span></span>
                  <input
                    type="text" required value={form.first_name}
                    onChange={(e) => update('first_name', e.target.value)}
                    placeholder="e.g. Anna Lou"
                    className="pe-input"
                  />
                </label>

                <label className="pe-label">
                  <span className="pe-label-text">Email <span className="pe-req">*</span></span>
                  <input
                    type="email" required value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="e.g. hello@yourpractice.com"
                    className="pe-input"
                  />
                </label>

                <label className="pe-label">
                  <span className="pe-label-text">Phone <span className="pe-req">*</span></span>
                  <input
                    type="tel" required value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    placeholder="e.g. +44 7700 900 000"
                    className="pe-input"
                  />
                </label>

                <label className="pe-label">
                  <span className="pe-label-text">Your practice <span className="pe-opt">(optional)</span></span>
                  <input
                    type="text" value={form.practice}
                    onChange={(e) => update('practice', e.target.value)}
                    placeholder="e.g. Somatic coach, London"
                    className="pe-input"
                  />
                </label>

                <label className="pe-label">
                  <span className="pe-label-text">Anything else? <span className="pe-opt">(optional)</span></span>
                  <textarea
                    value={form.message}
                    onChange={(e) => update('message', e.target.value)}
                    placeholder="Tell Anna a little about your practice and what brings you here."
                    className="pe-textarea"
                    rows={4}
                  />
                </label>

                {error && <p className="pe-error">{error}</p>}

                <div className="pe-actions">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="pe-submit"
                    style={{ background: accentColour }}
                  >
                    {submitting ? 'Sending...' : 'Send enquiry'}
                  </button>
                  <button type="button" className="pe-cancel" onClick={close}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const styles = `
.pe-cta-block { background:#fff; border-top:3px solid; padding:2.5rem 2rem; margin:2rem auto 0; max-width:1100px; }
.pe-cta-inner { max-width:680px; margin:0 auto; text-align:center; }
.pe-cta-kicker { font-family:Mulish,sans-serif; font-weight:600; font-size:0.7rem; letter-spacing:0.22em; text-transform:uppercase; margin:0 0 0.7rem; }
.pe-cta-headline { font-family:'EB Garamond',Georgia,serif; font-weight:400; font-size:1.9rem; color:#231F20; line-height:1.25; margin:0 0 0.9rem; font-style:italic; text-wrap:balance; }
.pe-cta-body { font-family:'EB Garamond',Georgia,serif; font-size:1.05rem; color:#3D3D3A; line-height:1.7; margin:0 0 1.6rem; }
.pe-cta-btn { display:inline-flex; align-items:center; gap:0.5rem; color:#F5F3EF; font-family:Mulish,sans-serif; font-weight:600; font-size:0.78rem; letter-spacing:0.14em; text-transform:uppercase; padding:1rem 1.8rem; border:0; border-radius:3px; cursor:pointer; transition:filter 0.2s; }
.pe-cta-btn:hover { filter:brightness(0.92); }

.pe-modal-backdrop { position:fixed; inset:0; background:rgba(35,31,32,0.55); backdrop-filter:blur(3px); z-index:9998; display:flex; align-items:center; justify-content:center; padding:1.5rem; animation:pe-fade-in 0.3s ease-out; overflow-y:auto; }
.pe-modal-card { position:relative; max-width:520px; width:100%; background:#F8F5F0; border-radius:10px; padding:2rem 2rem 1.8rem; box-shadow:0 24px 64px rgba(0,0,0,0.25); animation:pe-pop-in 0.32s cubic-bezier(0.16,1,0.3,1); border:1px solid rgba(110,58,90,0.12); max-height:calc(100vh - 3rem); overflow-y:auto; }
.pe-modal-close { position:absolute; top:10px; right:12px; width:36px; height:36px; border:0; background:transparent; color:#6E3A5A; font-size:26px; line-height:1; cursor:pointer; border-radius:50%; transition:background 0.2s; display:flex; align-items:center; justify-content:center; }
.pe-modal-close:hover { background:rgba(110,58,90,0.1); }

.pe-form-kicker { font-family:Mulish,sans-serif; font-weight:600; font-size:0.7rem; letter-spacing:0.22em; text-transform:uppercase; margin:0 0 0.6rem; }
.pe-form-headline { font-family:'EB Garamond',Georgia,serif; font-weight:400; font-size:1.5rem; color:#231F20; line-height:1.3; margin:0 0 1.2rem; }
.pe-label { display:block; margin-bottom:1rem; }
.pe-label-text { display:block; font-family:Mulish,sans-serif; font-weight:600; font-size:0.7rem; letter-spacing:0.12em; text-transform:uppercase; color:#3D3D3A; margin-bottom:0.4rem; }
.pe-req { color:#C44A7A; }
.pe-opt { color:#8C8880; font-weight:400; text-transform:none; letter-spacing:0.04em; }
.pe-input, .pe-textarea { width:100%; padding:0.7rem 0.9rem; font-family:'EB Garamond',Georgia,serif; font-size:1rem; color:#231F20; background:#fff; border:1px solid #DCDCE4; border-radius:4px; box-sizing:border-box; }
.pe-input:focus, .pe-textarea:focus { outline:none; border-color:#6E3A5A; box-shadow:0 0 0 3px rgba(110,58,90,0.12); }
.pe-textarea { resize:vertical; min-height:90px; font-family:inherit; line-height:1.55; }
.pe-error { color:#B33A3A; font-size:0.85rem; background:#FFF0F0; border:1px solid #FFB3B3; padding:0.6rem 0.8rem; border-radius:4px; margin:0.6rem 0; }
.pe-actions { display:flex; align-items:center; gap:1rem; margin-top:1.2rem; flex-wrap:wrap; }
.pe-submit { color:#F5F3EF; border:0; padding:0.95rem 1.7rem; border-radius:3px; font-family:Mulish,sans-serif; font-weight:600; font-size:0.78rem; letter-spacing:0.14em; text-transform:uppercase; cursor:pointer; transition:filter 0.2s; }
.pe-submit:hover:not(:disabled) { filter:brightness(0.92); }
.pe-submit:disabled { opacity:0.6; cursor:wait; }
.pe-cancel { background:transparent; border:0; color:#6E6A62; font-family:Mulish,sans-serif; font-weight:500; font-size:0.78rem; letter-spacing:0.08em; cursor:pointer; padding:0.7rem 0.3rem; text-decoration:underline; }
.pe-cancel:hover { color:#231F20; }

.pe-done { text-align:center; padding:0.5rem 0; }
.pe-done-eyebrow { font-family:Mulish,sans-serif; font-weight:600; font-size:0.7rem; letter-spacing:0.22em; text-transform:uppercase; margin:0 0 0.6rem; }
.pe-done-title { font-family:'EB Garamond',Georgia,serif; font-weight:400; font-size:1.7rem; color:#231F20; margin:0 0 0.8rem; font-style:italic; }
.pe-done-body { font-family:'EB Garamond',Georgia,serif; font-size:1.05rem; color:#3D3D3A; line-height:1.6; margin:0 0 1.4rem; }
.pe-done-close { background:#231F20; color:#F5F3EF; border:0; padding:0.85rem 1.6rem; border-radius:3px; font-family:Mulish,sans-serif; font-weight:600; font-size:0.78rem; letter-spacing:0.14em; text-transform:uppercase; cursor:pointer; }

@keyframes pe-fade-in { from{opacity:0;} to{opacity:1;} }
@keyframes pe-pop-in { from{opacity:0; transform:translateY(12px) scale(0.97);} to{opacity:1; transform:translateY(0) scale(1);} }

@media (max-width:600px) {
  .pe-cta-block { padding:2rem 1.4rem; margin-top:1.5rem; }
  .pe-cta-headline { font-size:1.6rem; }
  .pe-modal-card { padding:1.6rem 1.4rem 1.4rem; }
  .pe-form-headline { font-size:1.3rem; }
}
`;
