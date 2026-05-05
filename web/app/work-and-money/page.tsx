import { Metadata } from 'next';
import EditorialFeed from '@/components/EditorialFeed';

export const metadata: Metadata = {
  title: 'Work & Money',
  description: 'Founder reset, burnout and nervous system, Signal Method, career and direction, money and worth. Anna Lou Wellness.',
  openGraph: {
    title: 'Work & Money — Anna Lou Wellness',
    description: 'Founder reset, burnout, career, and money.',
  },
};

const articles = [
  {
    slug: 'founder-burnout',
    title: 'The founder who stopped. What burnout actually looks like from the inside.',
    category: 'Burnout and Nervous System',
    categoryColour: '#FFD07A',
    date: 'April 2026 · 8 min read',
    excerpt: 'I did not collapse. I did not have a dramatic breakdown. I just stopped being able to feel excited about anything. The business was growing. The numbers were good. And I felt nothing.',
    imageGradient: 'linear-gradient(160deg,#e8ddd0,#d4c5b3)',
  },
  {
    slug: 'signal-method-explained',
    title: 'The Signal Method\u2122. What it is and why it works.',
    category: 'Signal Method\u2122',
    categoryColour: '#FFD07A',
    date: 'March 2026',
    excerpt: '',
    imageGradient: 'linear-gradient(160deg,#ddd2c6,#cfc0b2)',
  },
  {
    slug: 'money-and-worth',
    title: 'Money and worth. Why charging what you are worth has nothing to do with money.',
    category: 'Money and Worth',
    categoryColour: '#FFD07A',
    date: 'February 2026',
    excerpt: '',
    imageGradient: 'linear-gradient(160deg,#e4d8cc,#d0c2b4)',
  },
  {
    slug: 'career-pivot',
    title: 'The career pivot nobody prepared you for. When the thing you built stops being the thing you want.',
    category: 'Career and Direction',
    categoryColour: '#FFD07A',
    date: 'January 2026',
    excerpt: '',
    imageGradient: 'linear-gradient(160deg,#d8ccc0,#cabcae)',
  },
];

const subcategories = [
  { label: 'Founder Reset', href: '/work-and-money/founder-reset' },
  { label: 'Burnout and Nervous System', href: '/work-and-money/burnout-and-nervous-system' },
  { label: 'Signal Method\u2122', href: '/work-and-money/signal-method' },
  { label: 'Career and Direction', href: '/work-and-money/career-and-direction' },
  { label: 'Money and Worth', href: '/work-and-money/money-and-worth' },
];

export default function WorkAndMoneyPage() {
  return (
    <EditorialFeed
      kicker="Work & Money"
      kickerColour="#FFD07A"
      title="The work that matters."
      intro="Founder reset, burnout and the nervous system, the Signal Method\u2122, career and direction, and the relationship between money and worth."
      articles={articles}
      sectionHref="/work-and-money"
      subcategories={subcategories}
    />
  );
}
