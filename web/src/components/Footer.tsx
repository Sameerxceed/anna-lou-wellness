import Link from 'next/link';

interface FooterProps {
  siteSettings: any;
  footerLinks: { explore: Array<{ label: string; href: string }>; connect: Array<{ label: string; href: string }> };
}

export default function Footer({ siteSettings, footerLinks }: FooterProps) {
  return (
    <footer className="footer-wrap">
      {/* Closing message */}
      <p className="footer-message">You don&rsquo;t have to hold everything.</p>

      {/* Tier 1: Primary navigation */}
      <nav className="footer-tier1">
        {footerLinks.explore.map(link => (
          <Link key={link.href} href={link.href}>{link.label}</Link>
        ))}
        {footerLinks.connect.map(link => (
          <Link key={link.href} href={link.href}>{link.label}</Link>
        ))}
      </nav>

      {/* Tier 2: Social */}
      <nav className="footer-tier2">
        {siteSettings.instagramUrl && <a href={siteSettings.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram</a>}
        {siteSettings.substackUrl && <a href={siteSettings.substackUrl} target="_blank" rel="noopener noreferrer">Substack</a>}
        {siteSettings.youtubeUrl && <a href={siteSettings.youtubeUrl} target="_blank" rel="noopener noreferrer">YouTube</a>}
        {siteSettings.facebookUrl && <a href={siteSettings.facebookUrl} target="_blank" rel="noopener noreferrer">Facebook</a>}
      </nav>

      {/* Tier 3: Legal */}
      <nav className="footer-tier3">
        <Link href="/about/press">Press</Link>
        <Link href="/about/contact">Contact</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </nav>

      {/* Substack CTA */}
      <div className="footer-substack">
        <a href="#">Join Reset Letters on Substack &rarr;</a>
      </div>

      {/* Bottom */}
      <div className="footer-bottom">
        <p className="footer-address">{siteSettings.siteName} &middot; {siteSettings.address} &middot; annalouwellness.com</p>
        <p className="footer-copy">&copy; {new Date().getFullYear()} {siteSettings.footerCopyright}</p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: footerStyles }} />
    </footer>
  );
}

const footerStyles = `
.footer-wrap { background:#231F20; padding:1.5rem 2rem 1rem; }
.footer-message { font-family:'EB Garamond',Georgia,serif; font-style:italic; font-size:1.2rem; color:rgba(245,243,239,0.3); text-align:center; margin-bottom:1.2rem; }
.footer-tier1 { display:flex; justify-content:center; gap:1.5rem; flex-wrap:wrap; margin-bottom:0.8rem; }
.footer-tier1 a { font-family:'EB Garamond',Georgia,serif; font-size:0.9rem; color:rgba(245,243,239,0.45); transition:color 0.3s; text-decoration:none; }
.footer-tier1 a:hover { color:#FFD07A; }
.footer-tier2 { display:flex; justify-content:center; gap:1.5rem; flex-wrap:wrap; margin-bottom:0.8rem; }
.footer-tier2 a { font-family:'EB Garamond',Georgia,serif; font-size:0.8rem; color:rgba(245,243,239,0.35); transition:color 0.3s; text-decoration:none; }
.footer-tier2 a:hover { color:#FFD07A; }
.footer-tier3 { display:flex; justify-content:center; gap:1.2rem; flex-wrap:wrap; margin-bottom:0.8rem; }
.footer-tier3 a { font-family:'EB Garamond',Georgia,serif; font-size:0.72rem; letter-spacing:0.04em; color:rgba(245,243,239,0.2); transition:color 0.3s; text-decoration:none; }
.footer-tier3 a:hover { color:rgba(245,243,239,0.5); }
.footer-substack { text-align:center; margin-bottom:1rem; }
.footer-substack a { font-family:Mulish,sans-serif; font-weight:400; font-size:0.7rem; letter-spacing:0.04em; color:rgba(245,243,239,0.4); padding:0.5rem 1.2rem; border:1px solid rgba(245,243,239,0.1); border-radius:3px; transition:all 0.3s; text-decoration:none; }
.footer-substack a:hover { border-color:#6E3A5A; color:#6E3A5A; }
.footer-bottom { text-align:center; padding-top:1.5rem; border-top:1px solid rgba(245,243,239,0.04); }
.footer-address { font-family:Mulish,sans-serif; font-size:0.6rem; letter-spacing:0.08em; color:rgba(245,243,239,0.25); margin-bottom:0.3rem; }
.footer-copy { font-family:Mulish,sans-serif; font-size:0.55rem; letter-spacing:0.06em; color:rgba(245,243,239,0.15); }
@media (max-width:900px) {
  .footer-tier1, .footer-tier2 { flex-direction:column; align-items:center; gap:0.5rem; }
  .footer-tier3 { flex-wrap:wrap; justify-content:center; gap:0.5rem 0.8rem; }
  .footer-message { font-size:1rem; }
  .footer-wrap { padding:1rem 1rem 0.8rem; }
}
@media (min-width:901px) {
  .footer-wrap { padding:1rem 2rem 0.8rem; }
  .footer-message { margin-bottom:0.8rem; }
}
`;
