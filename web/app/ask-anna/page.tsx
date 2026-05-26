import { Metadata } from 'next';
import AskAnnaClient from './AskAnnaClient';

export const metadata: Metadata = {
  title: 'Ask Anna | Personal Coaching Recommendation',
  description: 'Four honest questions, one personal recommendation from Anna. Not sure where to start? Let\'s find out together.',
  alternates: { canonical: '/ask-anna' },
};

export default function AskAnnaPage() {
  return <AskAnnaClient />;
}
