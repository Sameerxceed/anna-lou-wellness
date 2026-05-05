import { Metadata } from 'next';
import EditorialFeed from '@/components/EditorialFeed';

export const metadata: Metadata = {
  title: 'Life',
  description: 'Rituals and energy, home and space, style and beauty, food and nourishment, weekend finds. Anna Lou Wellness.',
  openGraph: {
    title: 'Life — Anna Lou Wellness',
    description: 'Rituals, home, style, food, and weekend finds.',
  },
};

const articles = [
  {
    slug: 'spiritual-hygiene-daily-practice',
    title: 'What spiritual hygiene actually looks like on a Tuesday morning.',
    category: 'Rituals and Energy',
    categoryColour: '#FAA21B',
    date: 'April 2026 · 5 min read',
    excerpt: 'Not the Instagram version. Not the candle-lit ceremony. The real one, where you are late for school run and the dishwasher needs emptying and you still find thirty seconds to check in with yourself.',
    imageGradient: 'linear-gradient(160deg,#e8ddd0,#d4c5b3)',
  },
  {
    slug: 'what-i-wore-this-month',
    title: 'What I wore every day this month, and why it matters.',
    category: 'Style and Beauty',
    categoryColour: '#FAA21B',
    date: 'March 2026',
    excerpt: '',
    imageGradient: 'linear-gradient(160deg,#ddd2c6,#cfc0b2)',
  },
  {
    slug: 'weekend-finds-april',
    title: 'Weekend finds. The things that caught my eye this week.',
    category: 'Weekend Finds',
    categoryColour: '#FAA21B',
    date: 'April 2026',
    excerpt: '',
    imageGradient: 'linear-gradient(160deg,#e4d8cc,#d0c2b4)',
  },
  {
    slug: 'kitchen-as-ritual',
    title: 'The kitchen as ritual space. What cooking teaches about presence.',
    category: 'Food and Nourishment',
    categoryColour: '#FAA21B',
    date: 'March 2026',
    excerpt: '',
    imageGradient: 'linear-gradient(160deg,#d8ccc0,#cabcae)',
  },
];

const subcategories = [
  { label: 'Rituals and Energy', href: '/life/rituals-and-energy' },
  { label: 'Home and Space', href: '/life/home-and-space' },
  { label: 'Style and Beauty', href: '/life/style-and-beauty' },
  { label: 'Food and Nourishment', href: '/life/food-and-nourishment' },
  { label: 'Weekend Finds', href: '/life/weekend-finds' },
];

export default function LifePage() {
  return (
    <EditorialFeed
      kicker="Life"
      kickerColour="#FAA21B"
      title="A life beautifully lived."
      intro="Rituals and energy, home and space, style and beauty, food and nourishment, and the things that catch my eye each week."
      articles={articles}
      sectionHref="/life"
      subcategories={subcategories}
    />
  );
}
