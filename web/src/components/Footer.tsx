import Link from 'next/link';
import type { FooterData, NavItem } from '@/lib/cms';

interface FooterProps {
  siteSettings: any;
  footer: FooterData;
  /** Same navigation tree as the top nav. Used to render the sitemap
   *  section so footer + header can never drift out of sync — Anna edits
   *  Navigation once, both places update. */
  navigation: NavItem[];
}

// Inline SVG icons for footer social row (PDF 6.2). Self-contained so we don't
// need an icon library dependency. Each renders at 18px and inherits currentColor.
//
// `currentColor` lets the parent <a> control the colour via CSS, so the hover
// state on the link tints the icon at the same time. The viewBox / paths come
// from each platform's official brand guidelines (simplified single-colour glyphs).

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
    <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.31-1.46.72-2.13 1.39C1.34 2.69.93 3.36.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.39 2.13.67.67 1.34 1.08 2.13 1.39.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.31 1.46-.72 2.13-1.39.67-.67 1.08-1.34 1.39-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.31-.79-.72-1.46-1.39-2.13C21.31 1.34 20.64.93 19.86.63 19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/>
  </svg>
);

const IconLinkedIn = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/>
  </svg>
);

const IconSubstack = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
    <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
  </svg>
);

const IconYouTube = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const IconPodcast = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
    <path d="M12 0a12 12 0 0 0-3.78 23.39c-.18-.94-.34-2.39.07-3.42.37-.94 2.4-15.27 2.4-15.27s-.62-1.24-.62-3.07c0-2.88 1.67-5.03 3.74-5.03 1.77 0 2.62 1.33 2.62 2.92 0 1.78-1.13 4.44-1.72 6.91-.49 2.07.86 3.76 2.9 3.76 3.48 0 6.16-3.67 6.16-8.97 0-4.69-3.37-7.97-8.18-7.97A8.49 8.49 0 0 0 3.5 8.93c0 1.66.64 3.44 1.43 4.41a.58.58 0 0 1 .13.55c-.14.6-.46 1.86-.52 2.12-.08.34-.27.41-.62.25-2.32-1.08-3.77-4.47-3.77-7.2C.15 5.21 5.32.62 11.84.62 18.04.62 23 5.05 23 11.27c0 6.14-3.87 11.07-9.24 11.07-1.8 0-3.5-.94-4.08-2.04l-1.11 4.23c-.4 1.55-1.49 3.49-2.22 4.67A12 12 0 1 0 12 0z"/>
  </svg>
);

type SocialEntry = {
  key: string;
  label: string;
  url: string | undefined;
  Icon: () => JSX.Element;
};

export default function Footer({ siteSettings, footer, navigation }: FooterProps) {
  // Anna's PDF 6.2: footer social row in this exact order — Instagram, LinkedIn,
  // Substack, YouTube, Podcast. Each only renders if its URL is set in CMS.
  const socials: SocialEntry[] = [
    { key: 'instagram', label: 'Instagram', url: siteSettings?.instagramUrl, Icon: IconInstagram },
    { key: 'linkedin', label: 'LinkedIn', url: siteSettings?.linkedinUrl, Icon: IconLinkedIn },
    { key: 'substack', label: 'Substack', url: siteSettings?.substackUrl, Icon: IconSubstack },
    { key: 'youtube', label: 'YouTube', url: siteSettings?.youtubeUrl, Icon: IconYouTube },
    { key: 'podcast', label: 'Podcast', url: siteSettings?.podcastUrl, Icon: IconPodcast },
  ];

  return (
    <footer className="footer-wrap">
      {/* Closing message */}
      <p className="footer-message">{footer.closingMessage}</p>

      {/* Tier 0: Sitemap — mirrors the top nav dropdowns so nav + footer
          can never drift. Anna 14 Jul feedback: 'Footer should be consistent
          with the top navigation'. Fix: single source of truth.
          Anna 24 Jul: Contact + Testimonials appended as their own columns
          in the same grid so they sit alongside Shop / Community / About
          instead of a separate helper row. */}
      {(() => {
        const helperColumns: NavItem[] = [
          { label: 'Contact', href: '/contact', colour: '#8C8880' },
          { label: 'Testimonials', href: '/testimonials', colour: '#8C8880' },
        ];
        const sitemapColumns = [...navigation, ...helperColumns];
        return (
          <nav className="footer-sitemap" aria-label="Sitemap">
            {sitemapColumns.map((section) => (
              <div key={section.href} className="footer-sitemap-col">
                <p
                  className="footer-sitemap-heading"
                  style={section.colour ? { color: section.colour } : undefined}
                >
                  <Link href={section.href}>{section.label}</Link>
                </p>
                {section.children && section.children.length > 0 && (
                  <ul className="footer-sitemap-list">
                    {section.children.map((child) => (
                      <li key={child.href}>
                        <Link href={child.href}>{child.label}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </nav>
        );
      })()}

      {/* Tier 1: Primary navigation — kept as a compact reminder row.
          Anna can leave this empty in CMS if the sitemap above is enough. */}
      {(footer.exploreLinks.length > 0 || footer.connectLinks.length > 0) && (
        <nav className="footer-tier1">
          {footer.exploreLinks.map(link => (
            <Link key={link.href} href={link.href}>{link.label}</Link>
          ))}
          {footer.connectLinks.map(link => (
            <Link key={link.href} href={link.href}>{link.label}</Link>
          ))}
        </nav>
      )}

      {/* Tier 2: Social icons — Instagram, LinkedIn, Substack, YouTube, Podcast */}
      <nav className="footer-socials" aria-label="Social media">
        {socials.map(({ key, label, url, Icon }) =>
          url ? (
            <a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-icon"
              aria-label={label}
              title={label}
            >
              <Icon />
            </a>
          ) : null,
        )}
      </nav>

      {/* Tier 3: Legal — hides if Anna hasn't filled the list in CMS.
          Contact + Testimonials moved into the sitemap grid above per
          Anna 24 Jul so they sit alongside the main nav columns. */}
      {footer.legalLinks.length > 0 && (
        <nav className="footer-tier3">
          {footer.legalLinks.map(link => (
            <Link key={link.href} href={link.href}>{link.label}</Link>
          ))}
        </nav>
      )}

      {/* Substack CTA */}
      <div className="footer-substack">
        <a href={footer.substackCtaUrl} target="_blank" rel="noopener noreferrer">{footer.substackCtaLabel}</a>
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
/* Sitemap mirrors the top nav dropdowns so both stay in sync. Grid on
   desktop, stacked columns on mobile. Anna 14 Jul 2026. */
.footer-sitemap {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1.5rem 1.2rem;
  max-width: 1200px;
  margin: 0 auto 1.8rem;
  padding: 0 1.5rem;
}
.footer-sitemap-col { min-width: 0; }
.footer-sitemap-heading {
  font-family: 'Work Sans', sans-serif; font-weight: 500;
  font-size: 0.62rem; letter-spacing: 0.22em; text-transform: uppercase;
  margin: 0 0 0.55rem;
  color: rgba(245,243,239,0.9);
}
.footer-sitemap-heading a { color: inherit; text-decoration: none; }
.footer-sitemap-heading a:hover { color: #FFD07A; }
.footer-sitemap-list { list-style: none; padding: 0; margin: 0; }
.footer-sitemap-list li { margin-bottom: 0.32rem; }
.footer-sitemap-list a {
  font-family: 'EB Garamond', Georgia, serif; font-size: 0.85rem;
  color: rgba(245,243,239,0.55);
  text-decoration: none; line-height: 1.4;
  transition: color 0.2s;
}
.footer-sitemap-list a:hover { color: #FFD07A; }
@media (max-width: 600px) {
  .footer-sitemap { grid-template-columns: repeat(2, 1fr); gap: 1.2rem 0.8rem; }
  .footer-sitemap-heading { font-size: 0.58rem; }
  .footer-sitemap-list a { font-size: 0.8rem; }
}
.footer-tier1 { display:flex; justify-content:center; gap:1.5rem; flex-wrap:wrap; margin-bottom:0.8rem; }
.footer-tier1 a { font-family:'EB Garamond',Georgia,serif; font-size:0.9rem; color:rgba(245,243,239,0.45); transition:color 0.3s; text-decoration:none; }
.footer-tier1 a:hover { color:#FFD07A; }
/* Social icon row — 5 platforms (Instagram, LinkedIn, Substack, YouTube, Podcast).
   Icons inherit currentColor so the hover state tints them at the same time
   as the underlying anchor. */
.footer-socials { display:flex; justify-content:center; gap:1.2rem; flex-wrap:wrap; margin-bottom:1rem; }
.footer-social-icon { display:inline-flex; align-items:center; justify-content:center; width:34px; height:34px; border-radius:50%; color:rgba(245,243,239,0.45); transition:color 0.3s, background 0.3s; text-decoration:none; }
.footer-social-icon:hover { color:#FFD07A; background:rgba(255,255,255,0.04); }
.footer-tier3 { display:flex; justify-content:center; gap:1.2rem; flex-wrap:wrap; margin-bottom:0.8rem; }
.footer-tier3 a { font-family:'EB Garamond',Georgia,serif; font-size:0.82rem; letter-spacing:0.04em; color:rgba(245,243,239,0.2); transition:color 0.3s; text-decoration:none; }
.footer-tier3 a:hover { color:rgba(245,243,239,0.5); }
.footer-substack { text-align:center; margin-bottom:1rem; }
.footer-substack a { font-family:Mulish,sans-serif; font-weight:400; font-size:0.82rem; letter-spacing:0.04em; color:rgba(245,243,239,0.4); padding:0.5rem 1.2rem; border:1px solid rgba(245,243,239,0.1); border-radius:3px; transition:all 0.3s; text-decoration:none; }
.footer-substack a:hover { border-color:#6E3A5A; color:#6E3A5A; }
.footer-bottom { text-align:center; padding-top:1.5rem; border-top:1px solid rgba(245,243,239,0.04); }
.footer-address { font-family:Mulish,sans-serif; font-size:0.78rem; letter-spacing:0.08em; color:rgba(245,243,239,0.25); margin-bottom:0.3rem; }
.footer-copy { font-family:Mulish,sans-serif; font-size:0.72rem; letter-spacing:0.06em; color:rgba(245,243,239,0.15); }
@media (max-width:900px) {
  .footer-tier1 { flex-direction:column; align-items:center; gap:0.5rem; }
  .footer-socials { gap:0.6rem; }
  .footer-social-icon { width:38px; height:38px; }
  .footer-tier3 { flex-wrap:wrap; justify-content:center; gap:0.5rem 0.8rem; }
  .footer-message { font-size:1rem; }
  .footer-wrap { padding:1rem 1rem 0.8rem; }
}
@media (min-width:901px) {
  .footer-wrap { padding:1rem 2rem 0.8rem; }
  .footer-message { margin-bottom:0.8rem; }
}
`;
