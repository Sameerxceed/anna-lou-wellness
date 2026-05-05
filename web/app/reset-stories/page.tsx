import { Metadata } from 'next';
import EditorialFeed from '@/components/EditorialFeed';

export const metadata: Metadata = {
  title: 'Reset Stories',
  description: 'Honest stories about coming back to yourself. Somatic coaching, healing, and the return to self. Anna Lou Wellness.',
  openGraph: {
    title: 'Reset Stories — Anna Lou Wellness',
    description: 'Honest stories about coming back to yourself.',
  },
};

const articles = [
  {
    slug: 'youre-holding-everything',
    title: 'You are not overwhelmed. You are holding everything.',
    category: 'Reset Stories',
    categoryColour: '#6E3A5A',
    date: 'April 2026 · 6 min read',
    excerpt: 'The distinction that changed how I work, how I move, and how I sleep. I spent years thinking I was overwhelmed. But what I was actually doing was not overwhelm. I was holding. Everything.',
    imageGradient: 'linear-gradient(160deg,#e8ddd0,#d4c5b3)',
  },
  {
    slug: 'the-strong-one',
    title: 'The problem with being the strong one.',
    category: 'Reset Stories',
    categoryColour: '#6E3A5A',
    date: 'March 2026',
    excerpt: '',
    imageGradient: 'linear-gradient(160deg,#e2d6ca,#d4c6b8)',
  },
  {
    slug: 'signal-vs-noise',
    title: 'Signal vs Noise. How to tell the difference between intuition and anxiety.',
    category: 'Reset Stories',
    categoryColour: '#6E3A5A',
    date: 'March 2026',
    excerpt: '',
    imageGradient: 'linear-gradient(160deg,#ddd2c6,#cfc0b2)',
  },
  {
    slug: 'houseboat-life',
    title: 'Living on Taggs Island. What the water teaches you about letting go.',
    category: 'Houseboat Life',
    categoryColour: '#6E3A5A',
    date: 'February 2026',
    excerpt: '',
    imageGradient: 'linear-gradient(160deg,#d8ccc0,#cabcae)',
  },
  {
    slug: 'emotional-anchors',
    title: 'Emotional anchors. The objects that hold us when nothing else does.',
    category: 'Emotional Anchors',
    categoryColour: '#6E3A5A',
    date: 'January 2026',
    excerpt: '',
    imageGradient: 'linear-gradient(160deg,#e0d4c8,#d2c4b6)',
  },
];

const subcategories = [
  { label: "You're Holding Everything", href: '/reset-stories/youre-holding-everything' },
  { label: 'The Strong One', href: '/reset-stories/the-strong-one' },
  { label: 'Signal vs Noise', href: '/reset-stories/signal-vs-noise' },
  { label: 'Houseboat Life', href: '/reset-stories/houseboat-life' },
  { label: 'Emotional Anchors', href: '/reset-stories/emotional-anchors' },
];

export default function ResetStoriesPage() {
  return (
    <EditorialFeed
      kicker="Reset Stories"
      kickerColour="#6E3A5A"
      title="Come back to yourself."
      intro="Honest stories about what it actually feels like to live in full alignment with who you are. Not the managed version. Not the performing one. The whole one."
      articles={articles}
      sectionHref="/reset-stories"
      subcategories={subcategories}
    />
  );
}
