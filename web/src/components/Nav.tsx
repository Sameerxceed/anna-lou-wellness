'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
// CartIcon replaced with text Login/Cart buttons per V8 design

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
}

export default function Nav({ transparent = false, navigation, siteSettings }: NavProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenAccordion(null);
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
        <p className="top-strip-text">Stories &middot; The Work &middot; Experiences &middot; Community</p>
      </div>

      {/* Main nav */}
      <nav id="mainNav" className={navCls}>
        <div className="nav-row">
          {/* Left nav items (desktop) */}
          <div className="nav-left">
            {leftNav.map((item, i) => (
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
                      <Link key={child.href} href={child.href} style={{ '--hover-color': item.colour } as any}>
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
            <Link href="/" className="nav-logo">
              {siteSettings?.siteName || 'Anna Lou Wellness'}
            </Link>
          </div>

          {/* Right nav items (desktop) */}
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
                      <Link key={child.href} href={child.href} style={{ '--hover-color': item.colour } as any}>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions (desktop: cart + login, mobile: hamburger) */}
          <div className="nav-actions">
            <Link href="/account" className="nav-action-btn">Login</Link>
            <Link href="/cart" className="nav-action-btn nav-action-accent">Cart</Link>
            <button
              className={`hamburger${mobileOpen ? ' open' : ''}`}
              aria-label="Menu"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-header">
            <Link href="/" className="mobile-logo" onClick={() => setMobileOpen(false)}>
              {siteSettings?.siteName || 'Anna Lou Wellness'}
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
            <div key={item.href} className={`mobile-section${openAccordion === i ? ' open' : ''}`}>
              <button
                className="mobile-toggle"
                style={{ color: item.colour }}
                onClick={() => setOpenAccordion(openAccordion === i ? null : i)}
              >
                {item.label}
                <span className="mobile-arrow">&#9660;</span>
              </button>
              {item.children && openAccordion === i && (
                <div className="mobile-sub">
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
            <Link href="/cart" className="mobile-btn mobile-btn-accent" onClick={() => setMobileOpen(false)}>Cart</Link>
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
  max-width: 1400px; margin: 0 auto;
  display: flex; justify-content: center; align-items: center;
  padding: 1rem 8rem 1rem 1.5rem;
  position: relative;
}
.nav-left, .nav-right {
  display: flex; align-items: center; gap: 0.1rem;
}
.nav-center-logo {
  text-align: center; padding: 0.2rem 1.5rem; flex-shrink: 0;
}
.nav-logo {
  font-family: 'Work Sans', 'Helvetica Neue', sans-serif;
  font-weight: 400;
  font-size: 1.9rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #231F20;
  text-decoration: none;
  display: block;
  line-height: 1.1;
}

/* ═══ NAV ITEMS ═══ */
.nav-item { position: relative; }
.nav-item > a {
  font-family: Mulish, sans-serif;
  font-weight: 400;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.5rem 0.4rem;
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
  top: 100%; left: 50%;
  transform: translateX(-50%);
  background: rgba(255,255,255,0.98);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 6px;
  padding: 0.6rem 0;
  min-width: 200px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  z-index: 200;
}
.nav-item:hover .nav-dropdown { display: block; }
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
  position: absolute; right: 1.2rem; top: 50%;
  transform: translateY(-50%);
  display: flex; gap: 0.5rem; align-items: center;
}
.nav-action-btn {
  font-family: Mulish, sans-serif;
  font-weight: 400;
  font-size: 0.5rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #3D3D3A;
  padding: 0.25rem 0.5rem;
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 3px;
  transition: all 0.3s;
  text-decoration: none;
  white-space: nowrap;
}
.nav-action-btn:hover { border-color: #6E3A5A; color: #6E3A5A; }
.nav-action-accent { border-color: #6E3A5A; color: #6E3A5A; }

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
  border-bottom: 1px solid rgba(0,0,0,0.06);
}
.mobile-toggle {
  display: flex; justify-content: space-between; align-items: center;
  width: 100%; padding: 0.9rem 0;
  background: none; border: none; cursor: pointer;
  font-family: Mulish, sans-serif;
  font-weight: 400;
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.mobile-arrow {
  font-size: 0.6rem;
  transition: transform 0.3s;
  color: #8C8880;
}
.mobile-section.open .mobile-arrow { transform: rotate(180deg); }
.mobile-sub {
  padding: 0 0 0.6rem 1rem;
}
.mobile-sub a {
  display: block; padding: 0.4rem 0;
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 0.95rem;
  color: #3D3D3A;
  text-decoration: none;
  transition: color 0.2s;
}
.mobile-sub a:hover { color: #231F20; }
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
@media (max-width: 900px) {
  .nav-left, .nav-right { display: none; }
  .nav-row { padding: 0.8rem 1.2rem; justify-content: space-between; }
  .nav-center-logo { order: 0; padding: 0; }
  .nav-actions { position: static; transform: none; display: flex; gap: 0.6rem; align-items: center; }
  .nav-action-btn { display: none; }
  .hamburger { display: block; }
  .nav-dropdown { display: none !important; }
}
@media (max-width: 480px) {
  .nav-logo { font-size: 1.1rem; letter-spacing: 0.12em; }
  .top-strip-text { font-size: 0.45rem; letter-spacing: 0.15em; }
}
`;
