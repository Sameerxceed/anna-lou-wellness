'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  html: string;
  height: string;
  hideChrome: boolean;
  title: string;
}

/**
 * CampaignFrame — sandboxed iframe host for Anna's pasted HTML.
 *
 * When height="auto", we listen for iframe load and set the wrapper
 * height to match iframe scrollHeight (needs allow-same-origin sandbox
 * flag for content-height inspection). Otherwise we honour the fixed
 * value Anna typed (e.g. "900px", "100vh").
 *
 * When hideChrome is true, we add a body class the root layout's global
 * CSS uses to hide <nav> + <footer> for a distraction-free landing.
 */
export default function CampaignFrame({ html, height, hideChrome, title }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [autoHeight, setAutoHeight] = useState<string>('1200px');

  useEffect(() => {
    if (!hideChrome) return;
    document.body.classList.add('campaign-bare');
    return () => document.body.classList.remove('campaign-bare');
  }, [hideChrome]);

  useEffect(() => {
    if (height !== 'auto') return;
    const iframe = iframeRef.current;
    if (!iframe) return;
    const resize = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        const h = Math.max(
          doc.body.scrollHeight,
          doc.documentElement.scrollHeight,
          800,
        );
        setAutoHeight(`${h}px`);
      } catch {
        setAutoHeight('100vh');
      }
    };
    iframe.addEventListener('load', resize);
    const interval = window.setInterval(resize, 1500);
    return () => {
      iframe.removeEventListener('load', resize);
      window.clearInterval(interval);
    };
  }, [height, html]);

  const finalHeight = height === 'auto' ? autoHeight : height;

  return (
    <div style={{ width: '100%', margin: 0, padding: 0 }}>
      <iframe
        ref={iframeRef}
        srcDoc={html}
        title={title}
        sandbox="allow-scripts allow-forms allow-popups allow-same-origin"
        style={{
          width: '100%',
          height: finalHeight,
          border: 0,
          display: 'block',
        }}
      />
    </div>
  );
}
