import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
import { getSubPage } from '@/lib/cms';

const fallback = {
  kicker: 'Shop',
  kickerColour: '#5DCAA5',
  title: 'New In',
  parentLabel: 'Shop',
  parentHref: '/shop',
  paragraphs: [
    'The latest arrivals. New pieces designed with intention, made to be worn every day. Every piece is handmade in Anna’s Design Lab on Taggs Island, using ethically sourced materials.',
    'Anna moved all manufacturing to the UK to uphold quality and ethical production. Each piece is crafted as a cherished keepsake, vibrant, personalised designs that empower you to express your unique style.',
    'New pieces are added regularly. Sign up to Reset Letters for first access and behind-the-scenes stories about each new collection.',
  ],
  ctaLabel: 'Browse all jewellery',
  ctaUrl: '/shop',
};

export async function generateMetadata(): Promise<Metadata> {
  const page = await getSubPage('/shop-new-in-page', fallback);
  return {
    title: page.title,
    description: page.paragraphs[0] ?? '',
  };
}

export default async function NewInPage() {
  const page = await getSubPage('/shop-new-in-page', fallback);
  return (
    <SubPage
      kicker={page.kicker}
      kickerColour={page.kickerColour}
      title={page.title}
      parentLabel={page.parentLabel}
      parentHref={page.parentHref}
      paragraphs={page.paragraphs}
      cta={{ label: page.ctaLabel, href: page.ctaUrl }}
    />
  );
}
