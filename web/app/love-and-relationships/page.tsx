import { Metadata } from 'next';
import EditorialFeed from '@/components/EditorialFeed';

export const metadata: Metadata = {
  title: 'Love & Relationships',
  description: 'Dating and patterns, breakups and reset, friendship, motherhood, self worth and identity. Anna Lou Wellness.',
  openGraph: {
    title: 'Love & Relationships — Anna Lou Wellness',
    description: 'Dating, breakups, friendship, motherhood, and self worth.',
  },
};

const articles = [
  {
    slug: 'dating-after-healing',
    title: 'Dating after healing. What changes when you stop performing and start choosing.',
    category: 'Dating and Patterns',
    categoryColour: '#F280AA',
    date: 'April 2026 · 7 min read',
    excerpt: 'The pattern used to be invisible. I would meet someone, feel the pull, and follow it without questioning what was underneath. After doing the body work, everything changed. Not the desire. The discernment.',
    imageGradient: 'linear-gradient(160deg,#e8ddd0,#d4c5b3)',
  },
  {
    slug: 'the-friendship-edit',
    title: 'The friendship edit. How to know when a relationship has run its course.',
    category: 'Friendship',
    categoryColour: '#F280AA',
    date: 'March 2026',
    excerpt: '',
    imageGradient: 'linear-gradient(160deg,#ddd2c6,#cfc0b2)',
  },
  {
    slug: 'motherhood-and-identity',
    title: 'Motherhood and the identity you did not plan to lose.',
    category: 'Motherhood',
    categoryColour: '#F280AA',
    date: 'February 2026',
    excerpt: '',
    imageGradient: 'linear-gradient(160deg,#e4d8cc,#d0c2b4)',
  },
  {
    slug: 'self-worth-is-not-confidence',
    title: 'Self worth is not confidence. It is something quieter.',
    category: 'Self Worth and Identity',
    categoryColour: '#F280AA',
    date: 'January 2026',
    excerpt: '',
    imageGradient: 'linear-gradient(160deg,#d8ccc0,#cabcae)',
  },
];

const subcategories = [
  { label: 'Dating and Patterns', href: '/love-and-relationships/dating-and-patterns' },
  { label: 'Breakups and Reset', href: '/love-and-relationships/breakups-and-reset' },
  { label: 'Friendship', href: '/love-and-relationships/friendship' },
  { label: 'Motherhood', href: '/love-and-relationships/motherhood' },
  { label: 'Self Worth and Identity', href: '/love-and-relationships/self-worth-and-identity' },
];

export default function LoveAndRelationshipsPage() {
  return (
    <EditorialFeed
      kicker="Love & Relationships"
      kickerColour="#F280AA"
      title="The people who shape us."
      intro="Dating and patterns, breakups and reset, friendship, motherhood, and the quiet work of understanding your own worth."
      articles={articles}
      sectionHref="/love-and-relationships"
      subcategories={subcategories}
    />
  );
}
