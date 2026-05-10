import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Letters — by Anna Lou Wellness',
  description: 'A weekly wellness magazine for women who have been holding everything. Coaching, crystals, nervous system healing, beauty, recipes, and real talk. Launching 22 June 2026.',
  openGraph: {
    title: 'Reset Letters — by Anna Lou Wellness',
    description: 'A weekly wellness magazine for women who have been holding everything. First 500 subscribers join free, for life.',
    siteName: 'Anna Lou Wellness',
    locale: 'en_GB',
    type: 'website',
    images: [{ url: '/reset-letters-square.jpg', width: 800, height: 800 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reset Letters — by Anna Lou Wellness',
    description: 'A weekly wellness magazine for women who have been holding everything.',
  },
};

export default function HoldingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;900&family=Lora:ital@1&display=swap"
        rel="stylesheet"
      />
      <style dangerouslySetInnerHTML={{ __html: `
        #mainNav, .footer-wrap, .back-to-top, .cookie-banner { display: none !important; }
        main { padding: 0 !important; margin: 0 !important; }
        body { background: #F1EAE0 !important; }
      `}} />
      {children}
    </>
  );
}
