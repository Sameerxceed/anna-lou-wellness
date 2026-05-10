import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
export const metadata: Metadata = { title: 'The Reset Room', description: 'Monthly membership: live group calls, workshop replays, Signal Method workbook, community. £25/month.' };
export default function MembershipPage() {
  return <SubPage kicker="Community" kickerColour="#6E3A5A" title="The Reset Room" parentLabel="Community" parentHref="/community"
    paragraphs={[
      'The Reset Room is the monthly membership for people who want ongoing access to the work without the commitment of a full programme.',
      'For £25 per month you get: one live group session per month (90 minutes, hosted on Zoom, recorded for those who cannot attend live), full access to the resource library including the Signal Method\u2122 workbook and all past workshop recordings, a monthly Signal Check delivered to your inbox, and the Reset Room community.',
      'It is for people who have done some work and want to keep going. For people who are not ready for 1:1 but know they need more than occasional workshops. For people who want community as part of their practice.',
      'It is also the most natural next step after a workshop. You came to Signal Reset Day. Something shifted. You want to keep that aliveness going. This is where you come.',
      'Cancel any time. First month free for anyone who has attended a paid workshop in the last three months.',
    ]}
    details={[
      { label: 'Price', value: '\u00A325 per month' },
      { label: 'Includes', value: 'Live group session, replay library, workbook, community' },
      { label: 'Commitment', value: 'Cancel any time' },
      { label: 'Trial', value: 'First month free after paid workshop' },
    ]}
    cta={{ label: 'Join the Reset Room', href: '#' }}
  />;
}
