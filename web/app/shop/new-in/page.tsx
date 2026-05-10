import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
export const metadata: Metadata = { title: 'New In', description: 'Latest arrivals. New jewellery from Anna Lou of London.' };
export default function NewInPage() {
  return <SubPage kicker="Shop" kickerColour="#5DCAA5" title="New In" parentLabel="Shop" parentHref="/shop"
    paragraphs={[
      'The latest arrivals. New pieces designed with intention, made to be worn every day. Every piece is handmade in Anna\u2019s Design Lab on Taggs Island, using ethically sourced materials.',
      'Anna moved all manufacturing to the UK to uphold quality and ethical production. Each piece is crafted as a cherished keepsake \u2014 vibrant, personalised designs that empower you to express your unique style.',
      'New pieces are added regularly. Sign up to Reset Letters for first access and behind-the-scenes stories about each new collection.',
    ]}
    cta={{ label: 'Browse all jewellery', href: '/shop' }}
  />;
}
