'use client';

import { useState } from 'react';

/**
 * Client edit-form for the user's basic profile (firstName, lastName,
 * phone). Rendered inside /account/details in place of the read-only
 * rows once the user clicks Edit. POSTs to /api/account/profile.
 */

interface Props {
  initialFirstName: string | null;
  initialLastName: string | null;
  initialPhone: string | null;
  email: string;
  username: string;
}

export default function ProfileForm({
  initialFirstName,
  initialLastName,
  initialPhone,
  email,
  username,
}: Props) {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [firstName, setFirstName] = useState(initialFirstName || '');
  const [lastName, setLastName] = useState(initialLastName || '');
  const [phone, setPhone] = useState(initialPhone || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const displayName = [firstName, lastName].filter(Boolean).join(' ').trim() || '—';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFlash(null);
    setSaving(true);
    try {
      const res = await fetch('/api/account/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Save failed.');
        return;
      }
      setMode('view');
      setFlash('Saved.');
      setTimeout(() => setFlash(null), 3000);
    } catch (err: any) {
      setError(err?.message || 'Network error.');
    } finally {
      setSaving(false);
    }
  };

  if (mode === 'view') {
    return (
      <>
        {flash && (
          <div style={{ marginBottom: '1rem', padding: '0.7rem 1rem', background: '#dcecdc', color: '#2c5c2c', fontFamily: "'Lora', serif", fontSize: '0.85rem' }}>{flash}</div>
        )}
        <div style={{ border: '1px solid #ece6dc', position: 'relative' }}>
          <button
            type="button"
            onClick={() => setMode('edit')}
            style={{ position: 'absolute', top: '0.9rem', right: '1.1rem', background: 'none', border: 'none', color: '#c4704a', cursor: 'pointer', fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', padding: 0 }}
          >
            Edit
          </button>
          <Row label="Name" value={displayName} />
          <Row label="Email" value={email} />
          <Row label="Phone" value={phone || '—'} />
          <Row label="Username" value={username || '—'} muted last />
        </div>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ece6dc', padding: '1.5rem' }}>
      {error && (
        <div style={{ marginBottom: '1rem', padding: '0.7rem 1rem', background: 'rgba(238,49,47,0.08)', border: '1px solid rgba(238,49,47,0.3)', color: '#a01f1d', fontFamily: "'Lora', serif", fontSize: '0.85rem' }}>{error}</div>
      )}
      <div style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Field label="First name">
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inp} />
          </Field>
          <Field label="Last name">
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} style={inp} />
          </Field>
        </div>
        <Field label="Email (contact hello@annalouwellness.com to change)">
          <input value={email} disabled style={{ ...inp, color: '#a89e91', cursor: 'not-allowed' }} />
        </Field>
        <Field label="Phone">
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+44…" style={inp} />
        </Field>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button
          type="submit"
          disabled={saving}
          style={{ padding: '0.8rem 1.4rem', background: saving ? '#a89e91' : '#6E3A5A', color: '#fff', border: 'none', fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', cursor: saving ? 'default' : 'pointer' }}
        >
          {saving ? 'Saving…' : 'Save profile'}
        </button>
        <button
          type="button"
          onClick={() => {
            setFirstName(initialFirstName || '');
            setLastName(initialLastName || '');
            setPhone(initialPhone || '');
            setError(null);
            setMode('view');
          }}
          style={{ padding: '0.8rem 1.4rem', background: 'transparent', color: '#4a4640', border: '1px solid #c8c4bc', fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

const inp: React.CSSProperties = {
  width: '100%',
  fontFamily: "'Lora', serif",
  fontSize: '0.92rem',
  color: '#1a1a18',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid #c8c4bc',
  padding: '0.55rem 0',
  outline: 'none',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, fontSize: '0.5rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6e6a62', marginBottom: '0.4rem' }}>{label}</label>
      {children}
    </div>
  );
}

function Row({ label, value, muted, last }: { label: string; value: string; muted?: boolean; last?: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '1rem', padding: '0.9rem 1.1rem', borderBottom: last ? 'none' : '1px solid #ece6dc', alignItems: 'baseline' }}>
      <div style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#a89e91' }}>{label}</div>
      <div style={{ fontFamily: "'Lora', serif", fontSize: '0.95rem', color: muted ? '#a89e91' : '#1a1a18' }}>{value}</div>
    </div>
  );
}
