'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CookieBannerProps {
  bannerText: string;
}

export default function CookieBanner({ bannerText }: CookieBannerProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('alw-cookies')) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('alw-cookies', 'accepted');
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem('alw-cookies', 'declined');
    setShow(false);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className={`cookie-banner${show ? ' show' : ''}`}>
        <div className="cookie-inner">
          <p className="cookie-text">
            {bannerText}{' '}
            <Link href="/privacy" className="cookie-link">Privacy Policy</Link>
          </p>
          <div className="cookie-actions">
            <button className="cookie-accept" onClick={handleAccept}>Accept</button>
            <button className="cookie-decline" onClick={handleDecline}>Decline</button>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = `
.cookie-banner {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 998;
  background: rgba(26, 26, 24, 0.97); backdrop-filter: blur(10px);
  padding: 1.2rem 2rem;
  transform: translateY(100%); transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.cookie-banner.show { transform: translateY(0); }
.cookie-inner {
  max-width: 1200px; margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between; gap: 2rem; flex-wrap: wrap;
}
.cookie-text {
  font-family: 'EB Garamond', Garamond, serif; font-size: 0.82rem; color: rgba(245,240,232,0.65);
  line-height: 1.6; flex: 1; min-width: 280px;
}
.cookie-link { color: #6E3A5A; text-decoration: underline; text-underline-offset: 2px; transition: color 0.3s; }
.cookie-link:hover { color: #faf8f4; }
.cookie-actions { display: flex; gap: 0.6rem; flex-shrink: 0; }
.cookie-accept {
  font-family: Mulish, sans-serif; font-weight: 300; font-size: 0.55rem;
  letter-spacing: 0.15em; text-transform: uppercase; color: #1a1a18;
  background: #faf8f4; border: 1px solid #faf8f4; padding: 0.55rem 1.5rem;
  cursor: pointer; transition: all 0.3s;
}
.cookie-accept:hover { background: #6E3A5A; border-color: #6E3A5A; color: #fff; }
.cookie-decline {
  font-family: Mulish, sans-serif; font-weight: 300; font-size: 0.55rem;
  letter-spacing: 0.15em; text-transform: uppercase; color: rgba(245,240,232,0.4);
  background: transparent; border: 1px solid rgba(245,240,232,0.15); padding: 0.55rem 1.5rem;
  cursor: pointer; transition: all 0.3s;
}
.cookie-decline:hover { border-color: rgba(245,240,232,0.3); color: rgba(245,240,232,0.6); }
@media (max-width: 600px) {
  .cookie-inner { flex-direction: column; text-align: center; }
  .cookie-actions { justify-content: center; }
}
`;
