import { redirect } from 'next/navigation';

/**
 * /the-work/client-stories — single source of truth is now /testimonials.
 *
 * The dedicated testimonials page (built 27 May) is CMS-driven from the
 * Testimonial / Review collection and renders the 3-col + banner magazine
 * layout Anna asked for. Keeping this URL alive via a permanent redirect
 * preserves any existing inbound links / nav references.
 */
export default function ClientStoriesRedirect() {
  redirect('/testimonials');
}
