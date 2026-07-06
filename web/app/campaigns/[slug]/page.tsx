import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCustomHtmlLanding } from '@/lib/cms';
import CampaignFrame from './CampaignFrame';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getCustomHtmlLanding(slug);
  if (!entry) {
    return { title: 'Not found', robots: { index: false, follow: false } };
  }
  return {
    title: entry.seoTitle || entry.title,
    description: entry.seoDescription || undefined,
    alternates: { canonical: `/campaigns/${entry.slug}` },
    openGraph: {
      title: entry.seoTitle || entry.title,
      description: entry.seoDescription || undefined,
      url: `/campaigns/${entry.slug}`,
      images: entry.heroImage ? [{ url: entry.heroImage, width: 1200, height: 630 }] : undefined,
    },
  };
}

/**
 * /campaigns/[slug] — renders an Anna-editable, iframe-sandboxed HTML page.
 *
 * Anna pastes raw HTML into the Custom HTML Landing entry (from a Google
 * Sites export, a Codepen, whatever) and we render it in a sandboxed
 * iframe via srcDoc. The iframe isolates CSS + JS entirely — her pasted
 * page can carry scripts, forms, custom fonts, whatever, without any
 * risk of collision with the surrounding site styles.
 *
 * If show_site_nav is false, the CampaignFrame client component adds a
 * `body.campaign-bare` class that our global CSS uses to hide the nav
 * + footer, giving a distraction-free landing (recommended for competitions).
 */
export default async function CampaignPage({ params }: Props) {
  const { slug } = await params;
  const entry = await getCustomHtmlLanding(slug);
  if (!entry) return notFound();

  return (
    <CampaignFrame
      html={entry.rawHtml}
      height={entry.iframeHeight}
      hideChrome={!entry.showSiteNav}
      title={entry.title}
    />
  );
}
