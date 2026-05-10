import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
export const metadata: Metadata = { title: 'Client Stories', description: 'What happens when you come home to yourself. Real stories from real clients.' };
export default function ClientStoriesPage() {
  return <SubPage kicker="The Work" kickerColour="#F280AA" title="Client Stories" parentLabel="The Work" parentHref="/the-work"
    paragraphs={[
      'These are not testimonials. They are editorial pieces \u2014 real stories from real clients about what happens when you come home to yourself.',
      '\u201CThe thing about Anna is she doesn\u2019t let you stay comfortable. Not in a confrontational way. In a way where your body suddenly shows you what you\u2019ve been avoiding, and you realise you\u2019re ready.\u201D \u2014 Claudine, London',
      '\u201CI thought I needed a business coach. Turns out I needed someone who could see that my nervous system was making every business decision for me. The Reset changed how I show up in my company.\u201D \u2014 Susan, New York',
      '\u201CShe sees things in you that you\u2019ve been too close to see yourself. The houseboat, the water, the space \u2014 it all holds you. I left feeling like I\u2019d put something down that I\u2019d been carrying for years.\u201D \u2014 Nicky, Melbourne',
      'More stories are coming. If you have worked with Anna and would like to share your experience, please get in touch.',
    ]}
    cta={{ label: 'Start your story', href: '/contact' }}
  />;
}
