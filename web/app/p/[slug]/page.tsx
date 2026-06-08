import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCustomPageBySlug, getAllCustomPageSlugs } from '@/lib/custom-page';
import { mediaUrl } from '@/lib/strapi';
import PageSections from '@/components/PageSections';
import UpsellBlock, { type UpsellItem } from '@/components/UpsellBlock';

export const dynamic = 'force-dynamic';

type Params = { slug: string };

export async function generateStaticParams() {
  const slugs = await getAllCustomPageSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getCustomPageBySlug(slug);
  if (!page) return { title: 'Page not found' };
  const title = page.seo_title || page.title;
  const description = page.seo_description || page.summary || undefined;
  const ogImage = mediaUrl(page.og_image as { url?: string } | undefined) || mediaUrl(page.hero_image as { url?: string } | undefined);
  return {
    title: `${title} — Anna Lou Wellness`,
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

export default async function CustomPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const page = await getCustomPageBySlug(slug);
  if (!page) notFound();

  const sections = Array.isArray(page.sections) ? page.sections : [];

  return (
    <article>
      {sections.length === 0 ? (
        <section style={{ padding: '4rem 2rem', textAlign: 'center', fontFamily: 'EB Garamond, Georgia, serif', color: '#8C8880', fontStyle: 'italic' }}>
          This page is empty. Open it in the CMS and add some sections.
        </section>
      ) : (
        <PageSections sections={sections} />
      )}
      <UpsellBlock
        items={(page.upsells as UpsellItem[] | undefined) || []}
        title="Where next."
        kicker="Continue your journey"
      />
    </article>
  );
}
