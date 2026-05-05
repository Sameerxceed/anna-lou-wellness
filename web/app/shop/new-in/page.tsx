import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
export const metadata: Metadata = { title: 'New In', description: 'Latest arrivals. New jewellery from Anna Lou of London.' };
export default function NewInPage() { return <SubPage kicker="Shop" kickerColour="#5DCAA5" title="New In" parentLabel="Shop" parentHref="/shop" description="The latest arrivals. New pieces designed with intention, made to be worn every day." />; }
