import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
export const metadata: Metadata = { title: 'Press', description: 'Media features, credentials, and press kit. Harrods, Selfridges, QVC Japan, Disney, Hello Kitty, Ray-Ban.' };
export default function PressPage() { return <SubPage kicker="About" kickerColour="#231F20" title="Press" parentLabel="About" parentHref="/about" description="Twenty-five years of press coverage. From the first piece about someone selling handmade jewellery on Portobello Road, to Harrods, Selfridges, QVC Japan, Disney, Hello Kitty, and Ray-Ban. Media features, credentials, and press kit." />; }
