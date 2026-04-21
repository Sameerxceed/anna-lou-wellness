import Link from 'next/link';

interface FooterProps {
  siteSettings: any;
  footerLinks: { explore: Array<{ label: string; href: string }>; connect: Array<{ label: string; href: string }> };
}

export default function Footer({ siteSettings, footerLinks }: FooterProps) {
  return (
    <footer className="bg-ink py-20 px-8">
      <div className="max-w-[1200px] mx-auto grid grid-cols-3 gap-12 mb-16 max-md:grid-cols-1">
        <div>
          <p className="font-sans font-light text-[0.6rem] tracking-[0.3em] uppercase text-white/30 mb-6">Explore</p>
          <ul className="flex flex-col gap-3">
            {footerLinks.explore.map(link => (
              <li key={link.href}><Link href={link.href} className="font-body text-[0.9rem] text-white/55 hover:text-gold transition-colors">{link.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-sans font-light text-[0.6rem] tracking-[0.3em] uppercase text-white/30 mb-6">Connect</p>
          <ul className="flex flex-col gap-3">
            {footerLinks.connect.map(link => (
              <li key={link.href}><Link href={link.href} className="font-body text-[0.9rem] text-white/55 hover:text-gold transition-colors">{link.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-sans font-light text-[0.6rem] tracking-[0.3em] uppercase text-white/30 mb-6">Contact</p>
          <p className="font-body text-[0.9rem] text-white/55 mb-2">
            <a href={`mailto:${siteSettings.email}`} className="hover:text-gold transition-colors">{siteSettings.email}</a>
          </p>
          <p className="font-body text-[0.9rem] text-white/55 whitespace-pre-line">{siteSettings.address}</p>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto flex justify-between items-center border-t border-white/5 pt-8 max-md:flex-col max-md:gap-4 max-md:text-center">
        <span className="font-display font-light text-[1.1rem] tracking-[0.3em] uppercase text-white/25">{siteSettings.siteName}</span>
        <div className="flex items-center gap-4">
          <span className="font-sans font-extralight text-[0.6rem] tracking-[0.15em] text-white/15">&copy; {new Date().getFullYear()} {siteSettings.footerCopyright}</span>
          <Link href="/privacy" className="font-sans font-extralight text-[0.5rem] tracking-[0.1em] text-white/20 hover:text-white/40 transition-colors">Privacy</Link>
          <Link href="/terms" className="font-sans font-extralight text-[0.5rem] tracking-[0.1em] text-white/20 hover:text-white/40 transition-colors">Terms</Link>
        </div>
        {siteSettings.instagramUrl && (
          <a href={siteSettings.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white/30 hover:text-gold transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]">
              <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
          </a>
        )}
      </div>
    </footer>
  );
}
