'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { getCartCount, onCartChange } from '@/lib/cart';

interface NavItem {
  label: string;
  href: string;
  colour?: string;
  children?: NavItem[];
}

interface NavProps {
  transparent?: boolean;
  navigation: NavItem[];
  siteSettings: any;
  topStripText?: string;
}

export default function Nav({ transparent = false, navigation, siteSettings, topStripText }: NavProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setCartCount(getCartCount());
    const unsub = onCartChange(() => setCartCount(getCartCount()));
    return unsub;
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    // Clear any dismissed dropdowns when route changes so hovering re-opens them
    document.querySelectorAll('.nav-item-dismiss').forEach(el => el.classList.remove('nav-item-dismiss'));
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navCls = `${scrolled ? 'scrolled' : ''} ${!transparent ? 'nav-dark' : ''}`.trim();

  // Split nav into left (first 4) and right (last 5) around the logo
  const leftNav = navigation.slice(0, 4);
  const rightNav = navigation.slice(4);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: navStyles }} />

      {/* Top strip */}
      <div className="top-strip">
        <p className="top-strip-text">{topStripText || 'Stories · Work with Anna · Experiences · Shop · Community'}</p>
      </div>

      {/* Main nav */}
      <nav id="mainNav" className={navCls}>
        <div className="nav-row">
          {/* Left nav items (desktop) */}
          <div className="nav-left">
            {leftNav.map((item, i) => (
              <div
                key={item.href}
                className="nav-item"
                onMouseLeave={e => e.currentTarget.classList.remove('nav-item-dismiss')}
              >
                <Link
                  href={item.href}
                  className={pathname.startsWith(item.href) ? 'active' : ''}
                  style={{ color: item.colour }}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="nav-dropdown">
                    {item.children.map(child => (
                      <Link
                        key={child.href}
                        href={child.href}
                        style={{ '--hover-color': item.colour } as any}
                        onClick={e => {
                          (e.currentTarget.closest('.nav-item') as HTMLElement | null)?.classList.add('nav-item-dismiss');
                        }}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Center logo */}
          <div className="nav-center-logo">
            <Link href="/" className="nav-logo" aria-label={siteSettings?.siteName || 'Anna Lou Wellness'}>
              <img src="/brand/alw-wordmark-stacked.svg" alt={siteSettings?.siteName || 'Anna Lou Wellness'} className="nav-logo-img" />
            </Link>
          </div>

          {/* Right zone: nav links + actions inline so flex can balance the layout */}
          <div className="nav-right-wrap">
            <div className="nav-right">
              {rightNav.map((item, i) => (
                <div key={item.href} className="nav-item">
                  <Link
                    href={item.href}
                    className={pathname.startsWith(item.href) ? 'active' : ''}
                    style={{ color: item.colour }}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="nav-dropdown">
                      {item.children.map(child => (
                        <Link
                          key={child.href}
                          href={child.href}
                          style={{ '--hover-color': item.colour } as any}
                          onClick={e => {
                            (e.currentTarget.closest('.nav-item') as HTMLElement | null)?.classList.add('nav-item-dismiss');
                          }}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="nav-actions">
              <Link href="/account" className="nav-action-btn">Login</Link>
              <Link href="/cart" className="nav-action-btn nav-action-accent">
                Cart{cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
              </Link>
              <button
                className={`hamburger${mobileOpen ? ' open' : ''}`}
                aria-label="Menu"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                <span /><span /><span />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-header">
            <Link href="/" className="mobile-logo" onClick={() => setMobileOpen(false)} aria-label={siteSettings?.siteName || 'Anna Lou Wellness'}>
              <img src="/brand/alw-wordmark-stacked.svg" alt={siteSettings?.siteName || 'Anna Lou Wellness'} style={{ height: 56, width: 'auto', display: 'block' }} />
            </Link>
            <button
              className="mobile-close"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              &times;
            </button>
          </div>

          {navigation.map((item, i) => (
            <div key={item.href} className="mobile-section">
              <Link
                href={item.href}
                className="mobile-category"
                style={{ color: item.colour }}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
              <div className="mobile-divider" style={{ backgroundColor: item.colour || '#231F20' }} />
              {item.children && (
                <div className="mobile-grid">
                  {item.children.map(child => (
                    <Link key={child.href} href={child.href} onClick={() => setMobileOpen(false)}>
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="mobile-actions">
            <Link href="/account" className="mobile-btn" onClick={() => setMobileOpen(false)}>Login</Link>
            <Link href="/cart" className="mobile-btn mobile-btn-accent" onClick={() => setMobileOpen(false)}>
              Cart{cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

const navStyles = `
/* ═══ TOP STRIP ═══ */
.top-strip {
  background: #231F20;
  text-align: center;
  padding: 0.5rem 1rem;
}
.top-strip-text {
  font-family: Mulish, system-ui, sans-serif;
  font-weight: 300;
  font-size: 0.58rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgba(245,243,239,0.5);
}

/* ═══ NAV BAR ═══ */
#mainNav {
  position: sticky; top: 0; z-index: 100;
  background: rgba(245,243,239,0.97);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0,0,0,0.04);
}
.nav-row {
  max-width: 1700px; margin: 0 auto;
  display: grid;
  /* minmax(0, 1fr) instead of 1fr — without this the column refuses to shrink
     below its intrinsic content width, so an asymmetric nav (more items on right
     than left) pushes the logo off-center. With minmax(0, 1fr) both side columns
     are guaranteed equal width and the auto-sized logo stays dead centre. */
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  padding: 0.75rem 1rem;
  gap: 0.3rem;
  position: relative;
}
.nav-left {
  display: flex; align-items: center; justify-content: flex-end; gap: 0;
  min-width: 0; /* allow grid 1fr to shrink past content's intrinsic min */
}
.nav-right-wrap {
  display: flex; align-items: center; justify-content: flex-start; gap: 0.5rem;
  min-width: 0;
}
.nav-right {
  display: flex; align-items: center; gap: 0;
}
.nav-center-logo {
  text-align: center; padding: 0.2rem 0.5rem; flex-shrink: 0;
}
.nav-logo {
  display: block;
  text-decoration: none;
  line-height: 0;
}
.nav-logo-img {
  height: 56px;
  width: auto;
  display: block;
}

/* ═══ NAV ITEMS ═══ */
.nav-item { position: relative; }
.nav-item > a {
  font-family: Mulish, sans-serif;
  font-weight: 400;
  font-size: 0.62rem;
  letter-spacing: 0.035em;
  text-transform: uppercase;
  padding: 0.5rem 0.3rem;
  transition: opacity 0.3s;
  position: relative;
  white-space: nowrap;
  text-decoration: none;
}
.nav-item > a::after {
  content: '';
  position: absolute;
  bottom: 0; left: 50%;
  width: 60%; height: 2px;
  transform: translateX(-50%);
  background: currentColor;
  opacity: 0;
  transition: opacity 0.3s;
}
.nav-item:hover > a::after { opacity: 1; }

/* ═══ DROPDOWN ═══ */
.nav-dropdown {
  display: none;
  position: absolute;
  top: 100%; left: 0;
  background: rgba(255,255,255,0.98);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 6px;
  padding: 0.6rem 0;
  min-width: 200px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  z-index: 200;
}
.nav-right .nav-dropdown { left: auto; right: 0; }
.nav-item:hover .nav-dropdown { display: block; }
.nav-item.nav-item-dismiss .nav-dropdown { display: none !important; }
.nav-dropdown a {
  display: block;
  padding: 0.45rem 1.2rem;
  font-family: 'EB Garamond', Georgia, serif;
  font-weight: 400;
  font-size: 0.9rem;
  color: #3D3D3A;
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.2s, background 0.2s;
}
.nav-dropdown a::after { display: none !important; }
.nav-dropdown a:hover {
  background: rgba(0,0,0,0.03);
  color: var(--hover-color, #231F20);
}

/* ═══ NAV ACTIONS ═══ */
.nav-actions {
  display: flex; gap: 0.5rem; align-items: center;
  flex-shrink: 0;
}
.nav-action-btn {
  font-family: Mulish, sans-serif;
  font-weight: 400;
  font-size: 0.48rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #3D3D3A;
  padding: 0.25rem 0.45rem;
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 3px;
  transition: all 0.3s;
  text-decoration: none;
  white-space: nowrap;
}
.nav-action-btn:hover { border-color: #6E3A5A; color: #6E3A5A; }
.nav-action-accent { border-color: #6E3A5A; color: #6E3A5A; background: #6E3A5A; color: #fff; }
.nav-action-accent:hover { background: #5A2E4A; border-color: #5A2E4A; color: #fff; }
.nav-cart-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 5px;
  margin-left: 0.4rem;
  background: #F280AA;
  color: #fff;
  border-radius: 10px;
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0;
}

/* ═══ HAMBURGER ═══ */
.hamburger {
  display: none;
  background: none; border: none; cursor: pointer;
  width: 26px; height: 18px;
  position: relative; z-index: 1001;
  padding: 0;
}
.hamburger span {
  display: block; width: 100%; height: 1.5px;
  background: #231F20;
  position: absolute; left: 0;
  transition: all 0.3s;
}
.hamburger span:nth-child(1) { top: 0; }
.hamburger span:nth-child(2) { top: 50%; transform: translateY(-50%); }
.hamburger span:nth-child(3) { bottom: 0; }
.hamburger.open span:nth-child(1) { top: 50%; transform: translateY(-50%) rotate(45deg); }
.hamburger.open span:nth-child(2) { opacity: 0; }
.hamburger.open span:nth-child(3) { bottom: 50%; transform: translateY(50%) rotate(-45deg); }

/* ═══ MOBILE MENU ═══ */
.mobile-menu {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  z-index: 9999;
  background: #F5F3EF;
  overflow-y: auto;
  padding: 0 1.5rem 2rem;
}
.mobile-menu-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 0; margin-bottom: 0.5rem;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  position: sticky; top: 0;
  background: #F5F3EF; z-index: 1;
}
.mobile-logo {
  font-family: 'Work Sans', 'Helvetica Neue', sans-serif;
  font-weight: 400;
  font-size: 1.1rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #231F20;
  text-decoration: none;
}
.mobile-close {
  background: none; border: none; cursor: pointer;
  font-size: 2rem; line-height: 1; color: #231F20;
  width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.mobile-section {
  padding: 1.5rem 0 0.6rem;
}
.mobile-category {
  font-family: 'EB Garamond', Georgia, serif;
  font-weight: 400;
  font-size: 1.35rem;
  text-decoration: none;
  display: block;
  padding-bottom: 0.6rem;
}
.mobile-divider {
  height: 2px;
  width: 100%;
  margin-bottom: 1rem;
  opacity: 0.4;
}
.mobile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem 1.5rem;
  padding-bottom: 0.6rem;
}
.mobile-grid a {
  font-family: Mulish, sans-serif;
  font-weight: 400;
  font-size: 0.95rem;
  color: #3D3D3A;
  text-decoration: none;
  padding: 0.55rem 0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.mobile-grid a:hover { color: #231F20; }
.mobile-actions {
  display: flex; gap: 1rem; justify-content: center;
  padding: 2rem 0 1.5rem;
  border-top: 1px solid rgba(0,0,0,0.06);
  margin-top: 0.5rem;
}
.mobile-btn {
  font-family: Mulish, sans-serif;
  font-weight: 400;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 0.7rem 2rem;
  border-radius: 3px;
  text-decoration: none;
  background: #231F20;
  color: #F5F3EF;
  border: 1px solid #231F20;
}
.mobile-btn-accent {
  background: #6E3A5A;
  border-color: #6E3A5A;
  color: #fff;
}

/* ═══ RESPONSIVE ═══ */
/* Larger screens have room for bigger nav text — bump font/padding/gap once
   viewport is comfortably wide enough that 1280px constraint no longer applies. */
@media (min-width: 1500px) {
  .nav-item > a { font-size: 0.72rem; letter-spacing: 0.05em; padding: 0.5rem 0.45rem; }
  .nav-action-btn { font-size: 0.52rem; padding: 0.28rem 0.55rem; }
  .nav-logo-img { height: 48px; }
  .nav-right-wrap { gap: 0.7rem; }
}

/* Min viewport for full nav (9 items + logo + login + cart) is ~1280px CSS pixels.
   That covers HP ProBook 14" at 125% Windows scaling (1536 effective), MacBook Pro
   14" at default (1512 effective), and Dell XPS 13 (1536 effective).
   Below 1280 (iPad landscape ~1180, MacBook Air 13" default 1280-borderline)
   we go hamburger. */
@media (max-width: 1279px) {
  .nav-left, .nav-right { display: none; }
  .nav-right-wrap { gap: 0; }
  .nav-row {
    display: flex;
    justify-content: space-between;
    padding: 0.7rem 1.2rem;
  }
  .nav-center-logo { padding: 0; }
  .nav-action-btn { display: none; }
  .hamburger { display: block; }
  .nav-dropdown { display: none !important; }
}
@media (max-width: 480px) {
  .nav-logo-img { height: 48px; }
  .top-strip-text { font-size: 0.45rem; letter-spacing: 0.15em; }
}
`;
