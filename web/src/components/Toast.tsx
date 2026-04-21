'use client';

import { useEffect, useState, useCallback } from 'react';

let showToastFn: ((message: string) => void) | null = null;

export function showToast(message: string) {
  showToastFn?.(message);
}

export default function Toast() {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  const show = useCallback((msg: string) => {
    setMessage(msg);
    setVisible(true);
    setTimeout(() => setVisible(false), 2200);
  }, []);

  useEffect(() => {
    showToastFn = show;
    return () => { showToastFn = null; };
  }, [show]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: `translateX(-50%) translateY(${visible ? '0' : '80px'})`,
        background: '#1a1a18',
        color: '#faf8f4',
        fontFamily: '"Josefin Sans", sans-serif',
        fontSize: '0.58rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase' as const,
        padding: '0.7rem 1.5rem',
        zIndex: 9998,
        opacity: visible ? 1 : 0,
        transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        pointerEvents: 'none' as const,
        whiteSpace: 'nowrap' as const,
      }}
    >
      {message}
    </div>
  );
}
