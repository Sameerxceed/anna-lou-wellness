'use client';

/**
 * Mount-once client component that calls captureUtmOnLoad on first
 * render. Stick this in app/layout.tsx so every visit captures the
 * ?utm_source=... param (first-touch wins, sessionStorage scope).
 *
 * Renders nothing. Has no props.
 */

import { useEffect } from 'react';
import { captureUtmOnLoad } from '@/lib/utm';

export default function UtmCapture() {
  useEffect(() => {
    captureUtmOnLoad();
  }, []);
  return null;
}
