'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountActions() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <button
      onClick={signOut}
      disabled={loading}
      style={{
        background: '#fff',
        color: '#231F20',
        border: '1px solid #231F20',
        padding: '0.6rem 1rem',
        borderRadius: 4,
        fontFamily: 'Mulish, sans-serif',
        fontWeight: 500,
        fontSize: '0.6rem',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        cursor: 'pointer',
      }}
    >
      {loading ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
