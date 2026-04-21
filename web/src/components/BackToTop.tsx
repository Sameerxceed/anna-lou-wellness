'use client';

import { useState, useEffect } from 'react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div
        className={`back-top${visible ? ' visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </div>
    </>
  );
}

const styles = `
.back-top {
  position: fixed; bottom: 2rem; right: 2rem; width: 44px; height: 44px;
  border: 1px solid #c8c4bc; background: rgba(250,248,244,0.9); backdrop-filter: blur(10px);
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  opacity: 0; pointer-events: none; transition: all 0.4s; z-index: 500;
}
.back-top.visible { opacity: 1; pointer-events: auto; }
.back-top:hover { background: #1a1a18; border-color: #1a1a18; }
.back-top:hover svg { stroke: #faf8f4; }
.back-top svg { width: 16px; height: 16px; stroke: #6e6a62; }
`;
