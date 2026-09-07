'use client';

import { useState } from 'react';
import type { DefaultAddress } from '@/lib/auth';

/**
 * Client form for saving the user's default shipping address.
 * POSTs to /api/account/default-address which writes it back to the
 * Strapi user record. On success we swap to the "saved" summary view.
 */

interface Props {
  initial: DefaultAddress | null;
  initialPhone: string | null;
  // User's account-level name — used as fallback if the saved address
  // does not carry its own first_name/last_name (older records or a
  // fresh save where they left the name blank).
  initialFirstName: string | null;
  initialLastName: string | null;
}

const COUNTRIES: Array<{ code: string; name: string }> = [
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IE', name: 'Ireland' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'IN', name: 'India' },
  { code: 'SG', name: 'Singapore' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'JP', name: 'Japan' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'OTHER', name: 'Other' },
];

export default function DefaultAddressForm({ initial, initialPhone, initialFirstName, initialLastName }: Props) {
  const [addr, setAddr] = useState<DefaultAddress>(
    initial || {
      country: 'GB',
      first_name: initialFirstName || '',
      last_name: initialLastName || '',
    },
  );
  const [phone, setPhone] = useState(initialPhone || '');
  const [mode, setMode] = useState<'view' | 'edit'>(initial?.line1 ? 'view' : 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const bind = (k: keyof DefaultAddress) => ({
    value: addr[k] || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setAddr((a) => ({ ...a, [k]: e.target.value })),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFlash(null);
    setSaving(true);
    try {
      const res = await fetch('/api/account/default-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...addr, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Save failed.');
        return;
      }
      setAddr(data.defaultAddress || addr);
      setMode('view');
      setFlash('Saved.');
      setTimeout(() => setFlash(null), 3000);
    } catch (err: any) {
      setError(err?.message || 'Network error.');
    } finally {
      setSaving(false);
    }
  };

  const countryName = COUNTRIES.find((c) => c.code === addr.country)?.name || addr.country || '';

  if (mode === 'view' && addr.line1) {
    return (
      <div>
        {flash && (
          <div style={{ marginBottom: '1rem', padding: '0.7rem 1rem', background: '#dcecdc', color: '#2c5c2c', fontFamily: "'Lora', serif", fontSize: '0.85rem' }}>{flash}</div>
        )}
        <div style={{ padding: '1.25rem 1.4rem', background: '#f7f2ea', border: '1px solid #ece6dc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
            <div style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 400, fontSize: '0.6rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#6E3A5A' }}>
              Default delivery address
            </div>
            <button type="button" onClick={() => setMode('edit')} style={{ background: 'none', border: 'none', color: '#c4704a', cursor: 'pointer', fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', padding: 0 }}>
              Edit
            </button>
          </div>
          <div style={{ fontFamily: "'Lora', serif", fontSize: '0.95rem', color: '#1a1a18', lineHeight: 1.6 }}>
            {(addr.first_name || addr.last_name) && (
              <><strong>{[addr.first_name, addr.last_name].filter(Boolean).join(' ')}</strong><br /></>
            )}
            {addr.line1}<br />
            {addr.line2 && <>{addr.line2}<br /></>}
            {[addr.city, addr.county].filter(Boolean).join(', ')}<br />
            {addr.postcode}<br />
            {countryName}
          </div>
          {phone && (
            <div style={{ marginTop: '0.75rem', fontFamily: "'Lora', serif", fontSize: '0.85rem', color: '#6e6a62' }}>
              Delivery contact: <strong style={{ color: '#1a1a18' }}>{phone}</strong>
            </div>
          )}
        </div>
        <p style={{ marginTop: '1rem', fontFamily: "'Lora', serif", fontSize: '0.8rem', color: '#a89e91', fontStyle: 'italic' }}>
          This address is prefilled into checkout when you place your next order.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{ marginBottom: '1rem', padding: '0.7rem 1rem', background: 'rgba(238,49,47,0.08)', border: '1px solid rgba(238,49,47,0.3)', color: '#a01f1d', fontFamily: "'Lora', serif", fontSize: '0.85rem' }}>{error}</div>
      )}
      <div style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Field label="First name *"><input required {...bind('first_name')} style={inp} /></Field>
          <Field label="Last name *"><input required {...bind('last_name')} style={inp} /></Field>
        </div>
        <Field label="Address line 1 *"><input required {...bind('line1')} style={inp} /></Field>
        <Field label="Address line 2 (optional)"><input {...bind('line2')} style={inp} /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Field label="City / Town *"><input required {...bind('city')} style={inp} /></Field>
          <Field label="County / State"><input {...bind('county')} style={inp} /></Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1rem' }}>
          <Field label="Postcode / ZIP *"><input required {...bind('postcode')} style={inp} /></Field>
          <Field label="Country *">
            <select required {...bind('country')} style={inp}>
              {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Phone (optional, for delivery contact)">
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+44…" style={inp} />
        </Field>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button type="submit" disabled={saving} style={{ padding: '0.8rem 1.4rem', background: saving ? '#a89e91' : '#6E3A5A', color: '#fff', border: 'none', fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', cursor: saving ? 'default' : 'pointer' }}>
          {saving ? 'Saving…' : 'Save address'}
        </button>
        {initial?.line1 && (
          <button type="button" onClick={() => { setAddr(initial); setMode('view'); }} style={{ padding: '0.8rem 1.4rem', background: 'transparent', color: '#4a4640', border: '1px solid #c8c4bc', fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer' }}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

const inp: React.CSSProperties = {
  width: '100%',
  fontFamily: "'Lora', serif",
  fontSize: '0.9rem',
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
