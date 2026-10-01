// Google Search Console ownership verification file for
// staging.annalouwellness.com. Google requires the exact filename
// to be reachable at the domain root with its canonical body.
// Harmless to serve on prod too — only means the same Google account
// could also verify prod if ever asked. Added 1 Oct 2026 so we can
// submit the staging URL prefix for Removals.

export const dynamic = 'force-static';

export function GET() {
  return new Response('google-site-verification: google76ed5db1bb11cd57.html\n', {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
