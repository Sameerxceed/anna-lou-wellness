import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
export const metadata: Metadata = { title: 'Workshops', description: 'Group sessions on the houseboat at Taggs Island, online, and in corporate spaces.' };
export default function WorkshopsPage() { return <SubPage kicker="Experiences" kickerColour="#7BAFDD" title="Workshops" parentLabel="Experiences" parentHref="/experiences" description="Group sessions held on the houseboat at Taggs Island, online, and in corporate spaces. Every workshop includes either full access or a recording and summary so you can engage at whatever level feels right." />; }
