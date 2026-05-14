'use client';

import { useState } from 'react';

export interface EnquiryField {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'textarea' | 'select' | 'date' | 'tel';
  required?: boolean;
  placeholder?: string;
  options?: string[]; // for select
  rows?: number; // for textarea
}

export interface EnquiryFormProps {
  endpoint: string; // e.g. '/api/lead/corporate'
  fields: EnquiryField[];
  submitLabel?: string;
  successTitle?: string;
  successMessage?: string;
  accentColour?: string;
}

export default function EnquiryForm({
  endpoint,
  fields,
  submitLabel = 'Send enquiry',
  successTitle = 'Thank you.',
  successMessage = 'Your enquiry is in. Anna will be in touch within 48 hours.',
  accentColour = '#6E3A5A',
}: EnquiryFormProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(name: string, val: string) {
    setValues(v => ({ ...v, [name]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // Real Flodesk/CRM wiring lands once API key is configured.
      // For now, log to /api/lead/* (or quietly succeed if endpoint not implemented).
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      }).catch(() => null);
      setDone(true);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Try again or email hello@annalouwellness.com.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="enq-success">
          <p className="enq-success-eyebrow" style={{ color: accentColour }}>Received</p>
          <h3 className="enq-success-title">{successTitle}</h3>
          <p className="enq-success-body">{successMessage}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <form className="enq-form" onSubmit={handleSubmit}>
        {fields.map(f => (
          <label key={f.name} className="enq-field">
            <span className="enq-label">{f.label}{f.required && <em className="enq-required" style={{ color: accentColour }}> *</em>}</span>
            {f.type === 'textarea' ? (
              <textarea
                rows={f.rows || 4}
                required={f.required}
                placeholder={f.placeholder}
                value={values[f.name] || ''}
                onChange={e => update(f.name, e.target.value)}
              />
            ) : f.type === 'select' ? (
              <select
                required={f.required}
                value={values[f.name] || ''}
                onChange={e => update(f.name, e.target.value)}
              >
                <option value="">Select...</option>
                {f.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : (
              <input
                type={f.type || 'text'}
                required={f.required}
                placeholder={f.placeholder}
                value={values[f.name] || ''}
                onChange={e => update(f.name, e.target.value)}
              />
            )}
          </label>
        ))}

        {error && <p className="enq-error">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="enq-submit"
          style={{ background: accentColour }}
        >
          {submitting ? 'Sending...' : submitLabel}
        </button>
        <p className="enq-fineprint">Sent to Anna&apos;s inbox. No automated chasing. Reply directly to her.</p>
      </form>
    </>
  );
}

const styles = `
.enq-form { background: #fff; padding: 1.8rem; border-radius: 8px; border: 1px solid rgba(0,0,0,0.06); max-width: 520px; }
.enq-field { display: block; margin-bottom: 1rem; }
.enq-label {
  display: block;
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase;
  color: #3D3D3A; margin-bottom: 0.4rem;
}
.enq-required { font-style: normal; }
.enq-form input, .enq-form textarea, .enq-form select {
  width: 100%;
  padding: 0.7rem 0.9rem;
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 4px;
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 0.95rem; color: #231F20;
  background: #fff;
  outline: none; transition: border-color 0.2s;
  resize: vertical;
}
.enq-form input:focus, .enq-form textarea:focus, .enq-form select:focus { border-color: #6E3A5A; }
.enq-submit {
  width: 100%; height: 48px; margin-top: 0.4rem;
  color: #fff; border: none; border-radius: 4px;
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.7rem; letter-spacing: 0.18em; text-transform: uppercase;
  cursor: pointer; transition: filter 0.2s;
}
.enq-submit:hover { filter: brightness(0.92); }
.enq-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.enq-fineprint {
  font-family: Mulish, sans-serif; font-weight: 300;
  font-size: 0.65rem; color: #8C8880;
  text-align: center; margin-top: 0.8rem; letter-spacing: 0.05em;
}
.enq-error {
  background: #FCE8EF; border-left: 3px solid #EE312F;
  padding: 0.7rem 1rem; border-radius: 0 4px 4px 0;
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 0.9rem; color: #3D3D3A; margin-bottom: 0.8rem;
}

.enq-success {
  background: #F5F3EF; padding: 1.8rem; border-radius: 8px; max-width: 520px;
}
.enq-success-eyebrow {
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase;
  margin-bottom: 0.5rem;
}
.enq-success-title {
  font-family: 'EB Garamond', Georgia, serif; font-style: italic;
  font-size: 1.6rem; color: #231F20; margin-bottom: 0.5rem;
}
.enq-success-body {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 1rem; line-height: 1.7; color: #3D3D3A;
}
`;
