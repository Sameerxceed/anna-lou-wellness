import type { Metadata } from 'next';
import Link from 'next/link';
import { stripe } from '@/lib/stripe';
import { fetchRecordingById } from '@/lib/strapi-admin';
import YouTubeThumbLink from '@/components/YouTubeThumbLink';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Watch the recording | The Returning Circle',
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function RecordingWatchPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  let paid = false;
  let email = '';
  let recordingId: number | null = null;

  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      const sourceOk = (session as any)?.metadata?.source === 'returning_circle_recording';
      if (sourceOk && session.payment_status === 'paid') {
        paid = true;
        email = String(
          (session as any)?.customer_details?.email || (session as any)?.customer_email || '',
        );
        const idRaw = (session as any)?.metadata?.recording_id;
        if (idRaw && Number.isFinite(Number(idRaw))) {
          recordingId = Number(idRaw);
        }
      }
    } catch (err: any) {
      console.warn('[watch] stripe retrieve failed:', err?.message);
    }
  }

  const recording = paid && recordingId ? await fetchRecordingById(recordingId) : null;
  const youtubeUrl = recording?.youtube_url || '';
  const weekLabel = recording?.title || '';
  const helpNote = recording?.description || '';

  return (
    <main
      style={{
        maxWidth: 720,
        margin: '3rem auto',
        padding: '0 1.5rem 4rem',
        fontFamily: 'EB Garamond, Georgia, serif',
        color: '#231F20',
      }}
    >
      <p
        style={{
          fontFamily: 'Mulish, sans-serif',
          fontWeight: 500,
          fontSize: '0.6rem',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: '#5DCAA5',
          margin: '0 0 0.8rem',
        }}
      >
        The Returning Circle
      </p>

      {paid ? (
        <>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 500,
              fontSize: '2.2rem',
              lineHeight: 1.2,
              margin: '0 0 0.6rem',
            }}
          >
            Thank you. Here is the recording.
          </h1>
          {weekLabel && (
            <p style={{ fontSize: '1.1rem', color: '#5d6a63', margin: '0 0 1.4rem' }}>
              <em>{weekLabel}</em>
            </p>
          )}

          {youtubeUrl ? (
            <div style={{ margin: '1.4rem 0' }}>
              <YouTubeThumbLink
                url={youtubeUrl}
                label={weekLabel ? `Watch: ${weekLabel}` : 'Watch on YouTube'}
                maxWidth={640}
                size="max"
              />
            </div>
          ) : (
            <p
              style={{
                fontSize: '1rem',
                lineHeight: 1.6,
                background: '#FFF6E5',
                border: '1px solid #EEDFB4',
                borderRadius: 8,
                padding: '1rem 1.2rem',
                margin: '1.4rem 0',
              }}
            >
              Your payment has been received. Anna is uploading this week&apos;s
              recording — the link will land in your inbox as soon as it is
              ready, and it will also appear in your library.
            </p>
          )}

          <div
            style={{
              marginTop: '1.6rem',
              padding: '1.2rem 1.3rem',
              background: '#F1FAF5',
              border: '1px solid #5DCAA540',
              borderRadius: 8,
            }}
          >
            <p
              style={{
                fontFamily: 'Mulish, sans-serif',
                fontWeight: 500,
                fontSize: '0.6rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#5DCAA5',
                margin: '0 0 0.4rem',
              }}
            >
              Your library
            </p>
            <p
              style={{
                fontSize: '1rem',
                lineHeight: 1.6,
                margin: '0 0 0.7rem',
                color: '#3D3D3A',
              }}
            >
              We&apos;ve also saved this recording to your account. You can log
              in any time to watch it back — plus any future recordings you buy.
            </p>
            <p style={{ margin: 0 }}>
              <Link
                href="/login?next=/community/reset-room/dashboard"
                style={{
                  color: '#6E3A5A',
                  textDecoration: 'underline',
                  textUnderlineOffset: 3,
                  fontWeight: 500,
                }}
              >
                Log in to your library →
              </Link>
            </p>
          </div>

          {email && (
            <p style={{ fontSize: '0.95rem', color: '#5d6a63', margin: '1.4rem 0 0' }}>
              A copy has also been emailed to <strong>{email}</strong>. First-time
              buyers get a separate email with a link to set your password so you
              can log in.
            </p>
          )}

          {helpNote && (
            <p
              style={{
                marginTop: '1.6rem',
                fontSize: '0.95rem',
                color: '#5d6a63',
                fontStyle: 'italic',
                lineHeight: 1.6,
              }}
            >
              {helpNote}
            </p>
          )}

          <p style={{ marginTop: '2rem' }}>
            <Link
              href="/community/the-returning-circle"
              style={{ color: '#6E3A5A', textUnderlineOffset: 3 }}
            >
              ← Back to the Circle
            </Link>
          </p>
        </>
      ) : (
        <>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 500,
              fontSize: '2rem',
              margin: '0 0 0.8rem',
            }}
          >
            We couldn&apos;t verify your payment.
          </h1>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.6, margin: '0 0 1.2rem' }}>
            If you have just paid and landed here by accident, check your inbox
            for the recording email — it usually arrives within a minute.
          </p>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
            If nothing has arrived, please email{' '}
            <a href="mailto:hello@annalouwellness.com" style={{ color: '#6E3A5A' }}>
              hello@annalouwellness.com
            </a>{' '}
            with the email address you paid with and we will sort it right away.
          </p>
          <p style={{ marginTop: '2rem' }}>
            <Link
              href="/community/the-returning-circle"
              style={{ color: '#6E3A5A', textUnderlineOffset: 3 }}
            >
              ← Back to the Circle
            </Link>
          </p>
        </>
      )}
    </main>
  );
}
