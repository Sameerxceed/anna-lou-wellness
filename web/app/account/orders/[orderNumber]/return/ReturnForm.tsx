'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

type ItemRow = { id: number; name: string; qty: number; price?: number };

const REASONS = [
  { value: 'damaged', label: 'Arrived damaged' },
  { value: 'wrong_item', label: 'Wrong item sent' },
  { value: 'not_as_described', label: 'Not as described' },
  { value: 'changed_mind', label: 'Changed my mind' },
  { value: 'other', label: 'Other (explain below)' },
];

export default function ReturnForm({ orderNumber, items }: { orderNumber: string; items: ItemRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Record<number, number>>(
    Object.fromEntries(items.map((i) => [i.id, i.qty])),
  );
  const [included, setIncluded] = useState<Record<number, boolean>>(
    Object.fromEntries(items.map((i) => [i.id, true])),
  );
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!reason) { setError('Please select a reason.'); return; }
    const chosenItems = items
      .filter((it) => included[it.id])
      .map((it) => ({ id: it.id, name: it.name, qty: selected[it.id] || it.qty }));
    if (chosenItems.length === 0) {
      setError('Select at least one item to return.');
      return;
    }
    if (reason === 'other' && notes.trim().length < 10) {
      setError('Please tell us a bit more in the notes when selecting "Other".');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_number: orderNumber, items: chosenItems, reason, notes: notes.trim() }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Could not submit your return.');
      }
      setDone(true);
      // refresh /account so the new return shows up on next visit
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rf-done">
        <p className="rf-eyebrow">Submitted</p>
        <h2 className="rf-h2">Thank you — we&rsquo;ve received your return request.</h2>
        <p className="rf-sub">
          A confirmation has been emailed to you. We&rsquo;ll review within 1–2 working days and reply
          with shipping instructions. No need to ship anything yet.
        </p>
        <a href="/account" className="rf-back">← Back to your account</a>
        <style>{innerStyles}</style>
      </div>
    );
  }

  return (
    <form className="rf-form" onSubmit={onSubmit}>
      <fieldset className="rf-fieldset">
        <legend className="rf-legend">Items to return</legend>
        {items.map((it) => (
          <label key={it.id} className="rf-item">
            <input
              type="checkbox"
              checked={!!included[it.id]}
              onChange={(e) => setIncluded((s) => ({ ...s, [it.id]: e.target.checked }))}
            />
            <span className="rf-item-name">{it.name}</span>
            {it.qty > 1 ? (
              <select
                className="rf-qty"
                value={selected[it.id] || it.qty}
                onChange={(e) => setSelected((s) => ({ ...s, [it.id]: Number(e.target.value) }))}
                disabled={!included[it.id]}
              >
                {Array.from({ length: it.qty }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n} of {it.qty}</option>
                ))}
              </select>
            ) : (
              <span className="rf-qty-static">1 of 1</span>
            )}
          </label>
        ))}
      </fieldset>

      <div className="rf-field">
        <label className="rf-label" htmlFor="rf-reason">Reason for return</label>
        <select
          id="rf-reason"
          className="rf-input"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        >
          <option value="" disabled>Please choose…</option>
          {REASONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      <div className="rf-field">
        <label className="rf-label" htmlFor="rf-notes">Notes (optional)</label>
        <textarea
          id="rf-notes"
          className="rf-input rf-textarea"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything we should know — photos can be replied to the confirmation email."
          maxLength={2000}
        />
      </div>

      {error && <div className="rf-error">{error}</div>}

      <div className="rf-actions">
        <a href="/account" className="rf-back">← Cancel</a>
        <button type="submit" className="rf-submit" disabled={loading}>
          {loading ? 'Submitting…' : 'Submit return request'}
        </button>
      </div>
      <style>{innerStyles}</style>
    </form>
  );
}

const innerStyles = `
.rf-form { display: flex; flex-direction: column; gap: 1.4rem; }
.rf-fieldset { border: 1px solid rgba(0,0,0,0.08); background: #fff; padding: 1rem 1.2rem; }
.rf-legend { font-family: 'Josefin Sans', sans-serif; font-size: 0.62rem; letter-spacing: 0.16em; text-transform: uppercase; color: #6e6a62; padding: 0 0.4rem; }
.rf-item { display: flex; align-items: center; gap: 0.8rem; padding: 0.55rem 0; font-family: 'EB Garamond', Georgia, serif; font-size: 0.95rem; color: #3D3D3A; border-bottom: 1px solid #f0ede5; }
.rf-item:last-child { border-bottom: none; }
.rf-item-name { flex: 1; }
.rf-qty { padding: 0.3rem 0.5rem; border: 1px solid rgba(0,0,0,0.1); font-family: 'EB Garamond', Georgia, serif; font-size: 0.85rem; background: #fff; }
.rf-qty-static { font-family: 'EB Garamond', Georgia, serif; font-size: 0.8rem; color: #8C8880; }
.rf-field { display: flex; flex-direction: column; }
.rf-label { font-family: Mulish, sans-serif; font-size: 0.62rem; letter-spacing: 0.16em; text-transform: uppercase; color: #8C8880; margin-bottom: 0.4rem; }
.rf-input { padding: 0.7rem 0.8rem; border: 1px solid rgba(0,0,0,0.1); background: #fff; font-family: 'EB Garamond', Georgia, serif; font-size: 0.95rem; color: #231F20; }
.rf-textarea { resize: vertical; min-height: 90px; }
.rf-input:focus { outline: none; border-color: #6E3A5A; }
.rf-error { background: #FDE8E8; color: #B33A3A; padding: 0.6rem 0.8rem; font-family: 'EB Garamond', Georgia, serif; font-size: 0.88rem; }
.rf-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 0.6rem; }
.rf-back { font-family: 'EB Garamond', Georgia, serif; font-size: 0.9rem; color: #6E3A5A; }
.rf-submit { background: #231F20; color: #F5F3EF; border: none; padding: 0.85rem 1.4rem; font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.7rem; letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer; transition: background 0.2s; }
.rf-submit:hover:not(:disabled) { background: #6E3A5A; }
.rf-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.rf-done { text-align: center; padding: 1.5rem 0; }
.rf-done .rf-eyebrow { font-family: 'Josefin Sans', sans-serif; font-size: 0.62rem; letter-spacing: 0.22em; text-transform: uppercase; color: #c4704a; }
.rf-done .rf-h2 { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 500; font-size: 1.6rem; color: #231F20; margin: 0.4rem 0 0.8rem; }
.rf-done .rf-sub { font-family: 'EB Garamond', Georgia, serif; font-size: 0.95rem; color: #6e6a62; margin: 0 0 1.4rem; line-height: 1.6; }
`;
