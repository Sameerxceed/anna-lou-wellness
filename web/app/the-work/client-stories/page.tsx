import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
import { getGenericPageBySlug, genericPageProps } from '@/lib/generic-page';

export const metadata: Metadata = {
  title: 'Client Stories',
  description: 'What happens when you come home to yourself. Real stories from real clients.',
};

export default async function ClientStoriesPage() {
  const cms = await getGenericPageBySlug('the-work-client-stories');
  const props = genericPageProps(cms, {
    title: 'Client Stories',
    kicker: 'The Work',
    kickerColour: '#F280AA',
    parentLabel: 'The Work',
    parentHref: '/the-work',
    stockCategory: 'reset-stories',
    stockSeed: 'client-stories',
    paragraphs: [
      'These are not testimonials. They are editorial pieces — real stories from real clients about what happens when you come home to yourself.',
      '“The thing about Anna is she doesn’t let you stay comfortable. Not in a confrontational way. In a way where your body suddenly shows you what you’ve been avoiding, and you realise you’re ready.” — Claudine, London',
      '“I thought I needed a business coach. Turns out I needed someone who could see that my nervous system was making every business decision for me. The Reset changed how I show up in my company.” — Susan, New York',
      '“She sees things in you that you’ve been too close to see yourself. The houseboat, the water, the space — it all holds you. I left feeling like I’d put something down that I’d been carrying for years.” — Nicky, Melbourne',
      'More stories are coming. If you have worked with Anna and would like to share your experience, please get in touch.',
    ],
    cta: { label: 'Start your story', href: '/contact' },
  });
  return <SubPage {...props} />;
}
