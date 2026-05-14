import { Metadata } from 'next';
import ProgrammePage from '@/components/ProgrammePage';

export const metadata: Metadata = {
  title: 'One Day | Private Somatic Coaching Intensive',
  description: 'A full day of private 1:1 somatic coaching with Anna Lou. Houseboat at Hampton or virtual. By enquiry.',
  alternates: { canonical: '/the-work/one-day' },
};

export default function OneDayPage() {
  return (
    <ProgrammePage
      accentColour="#5DCAA5"
      hero={{ title: 'One Day.', tagline: 'A full day. Held, focused, finished.' }}
      intro={[
        'One Day is exactly that. A full day, 1:1, on the houseboat at Taggs Island or online. No multi-week commitment. One concentrated, unhurried, immersive day.',
        'We begin with a full inner guidance system audit. We move through whatever the day calls for: somatic work, belief repatterning, breathwork, Signal Method, pendulum alignment, business strategy if you are building something. You leave with a personalised practice, a completed Signal Method workbook, and a clear direction from your own signal rather than anyone else\'s opinion.',
      ]}
      sections={[
        {
          label: 'What\'s included',
          body: [
            'A full day, 10am to 5pm UK, with breaks',
            'In person at the Hampton studio, or virtual via Zoom',
            'Pre-day intake form and a 30-minute scoping call the week before',
            'The day itself: nervous-system work, somatic enquiry, decision mapping, integration',
            'Lunch and refreshments included if in person',
            'A 60-minute integration call two weeks later',
          ],
        },
      ]}
      pricing={{
        label: 'Investment',
        body: 'By enquiry. Each One Day is shaped around the person it is for.',
      }}
      cta={{ label: 'Enquire about One Day', href: '/contact' }}
    />
  );
}
