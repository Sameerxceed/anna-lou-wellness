'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import CartIcon from '@/components/CartIcon';

interface NavProps {
  transparent?: boolean;
  navigation: Array<{ label: string; href: string }>;
  siteSettings: any;
}

export default function Nav({ transparent = false, navigation, siteSettings }: NavProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const hasLogo = !!siteSettings?.logo;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navCls = `${scrolled ? 'scrolled' : ''} ${!transparent ? 'nav-dark' : ''}`.trim();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: navStyles }} />
      <nav id="mainNav" className={navCls}>
        <Link href="/" className="nav-logo">
          {hasLogo ? (
            <img src={siteSettings.logo} alt={siteSettings.siteName} className="nav-logo-img" />
          ) : (
            siteSettings?.siteName || ''
          )}
        </Link>
        <ul className="nav-links">
          {navigation.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={pathname.startsWith(item.href) && item.href !== '/' ? 'active' : ''}>
                {item.label}
              </Link>
            </li>
          ))}
          <li><CartIcon /></li>
          {siteSettings?.instagramUrl && (
            <li>
              <a href={siteSettings.instagramUrl} target="_blank" rel="noopener noreferrer" className="nav-ig" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </li>
          )}
        </ul>
        <button className="nav-toggle" aria-label="Menu" onClick={() => setMobileOpen(!mobileOpen)}>
          <span /><span /><span />
        </button>
      </nav>
      <div className={`mobile-menu${mobileOpen ? ' open' : ''}`}>
        <Link href="/" onClick={() => setMobileOpen(false)}>Home</Link>
        {navigation.map((item) => (
          <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>{item.label}</Link>
        ))}
        <Link href="/cart" onClick={() => setMobileOpen(false)}>Cart</Link>
      </div>
    </>
  );
}

const navStyles = `
#mainNav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  padding: 1.5rem 3rem; display: flex; justify-content: space-between; align-items: center;
  transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
#mainNav.scrolled, #mainNav.nav-dark {
  background: rgba(250, 248, 244, 0.95); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  padding: 1rem 3rem; box-shadow: 0 1px 0 rgba(0,0,0,0.06);
}
.nav-logo {
  font-family: 'Nobel', 'Helvetica Neue', serif; font-weight: 300; font-size: 1.6rem;
  letter-spacing: 0.25em; text-transform: uppercase; color: var(--warm-white, #F5F3EF);
  text-decoration: none; transition: color 0.5s;
}
#mainNav.scrolled .nav-logo, #mainNav.nav-dark .nav-logo { color: var(--ink, #231F20); }
.nav-logo-img { height: 36px; width: auto; transition: filter 0.5s; }
#mainNav:not(.scrolled):not(.nav-dark) .nav-logo-img { filter: brightness(10); }
#mainNav.scrolled .nav-logo-img, #mainNav.nav-dark .nav-logo-img { filter: none; }
.nav-links { display: flex; gap: 2.2rem; list-style: none; align-items: center; }
.nav-links a {
  font-family: 'Proxima Nova', sans-serif; font-weight: 300; font-size: 0.75rem;
  letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.85);
  text-decoration: none; position: relative; padding-bottom: 2px; transition: color 0.4s;
}
#mainNav.scrolled .nav-links a, #mainNav.nav-dark .nav-links a { color: #8C8880; }
#mainNav.scrolled .nav-links a:hover, #mainNav.nav-dark .nav-links a:hover { color: #231F20; }
.nav-links a::after {
  content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 1px;
  background: currentColor; transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.nav-links a:hover::after { width: 100%; }
.nav-links a:hover { color: #fff; }
#mainNav.nav-dark .nav-links a:hover { color: #231F20; }
.nav-links a.active { color: #231F20; }
.nav-links a.active::after { width: 100%; background: #EE312F; }
.nav-ig { display: inline-flex; align-items: center; }
.nav-ig svg { width: 16px; height: 16px; }
.nav-toggle {
  display: none; background: none; border: none; cursor: pointer;
  width: 28px; height: 20px; position: relative; z-index: 1001;
}
.nav-toggle span {
  display: block; width: 100%; height: 1.5px; background: #F5F3EF;
  position: absolute; left: 0; transition: all 0.35s;
}
#mainNav.scrolled .nav-toggle span, #mainNav.nav-dark .nav-toggle span { background: #231F20; }
.nav-toggle span:nth-child(1) { top: 0; }
.nav-toggle span:nth-child(2) { top: 50%; transform: translateY(-50%); }
.nav-toggle span:nth-child(3) { bottom: 0; }
.mobile-menu {
  display: none; position: fixed; inset: 0; background: rgba(250,248,244,0.98);
  backdrop-filter: blur(30px); z-index: 999; flex-direction: column;
  align-items: center; justify-content: center; gap: 2rem;
}
.mobile-menu.open { display: flex; }
.mobile-menu a {
  font-family: 'Nobel', 'Helvetica Neue', serif; font-weight: 300; font-size: 2rem;
  color: #231F20; letter-spacing: 0.05em; transition: color 0.3s; text-decoration: none;
}
.mobile-menu a:hover { color: #EE312F; }
@media (max-width: 768px) {
  #mainNav { padding: 1.2rem 1.5rem; }
  #mainNav.scrolled, #mainNav.nav-dark { padding: 1rem 1.5rem; }
  .nav-links { display: none; }
  .nav-toggle { display: block; }
}
`;
