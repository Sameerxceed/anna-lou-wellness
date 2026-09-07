import { Metadata } from 'next';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import ProfileForm from '@/components/ProfileForm';

export const metadata: Metadata = {
  title: 'Account details — Anna Lou Wellness',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/**
 * /account/details — editable profile (name + phone) + read-only
 * membership summary. Editing name/phone POSTs to /api/account/profile.
 * Email changes still require support (Strapi identifier changes are
 * risky and email doubles as login).
 */
export default async function AccountDetailsPage() {
  const session = await getSession();
  if (!session) return null;
  const { user, isMember, hasRegulatedAccess } = session;

  const memberSince = user.memberSince ? new Date(user.memberSince) : null;

  return (
    <div>
      <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, fontSize: '0.55rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#c4704a', margin: 0 }}>Account details</p>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.4rem', color: '#1a1a18', margin: '0.4rem 0 0.6rem', lineHeight: 1.05 }}>
        Your profile
      </h1>
      <p style={{ fontFamily: "'Lora', serif", fontSize: '0.95rem', color: '#6e6a62', margin: '0 0 2rem' }}>
        Update your name and phone here. To change your email, message us at{' '}
        <a href="mailto:hello@annalouwellness.com" style={{ color: '#c4704a' }}>hello@annalouwellness.com</a>.
      </p>

      <ProfileForm
        initialFirstName={user.firstName}
        initialLastName={user.lastName}
        initialPhone={user.phone}
        email={user.email}
        username={user.username}
      />

      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', color: '#1a1a18', margin: '2.5rem 0 1rem' }}>Access &amp; membership</h2>
      <div style={{ border: '1px solid #ece6dc' }}>
        <Row
          label="Reset Room"
          value={
            isMember
              ? memberSince
                ? `Member since ${memberSince.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
                : 'Member'
              : 'Not a member'
          }
        />
        <Row
          label="REGULATED course"
          value={hasRegulatedAccess ? 'Access granted' : 'Not purchased'}
        />
        {isMember && (
          <Row label="Subscription status" value={user.subscriptionStatus || 'active'} muted />
        )}
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link href="/login/forgot" style={{ padding: '0.75rem 1.2rem', border: '1px solid #c8c4bc', color: '#4a4640', textDecoration: 'none', fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          Reset password
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '1rem', padding: '0.9rem 1.1rem', borderBottom: '1px solid #ece6dc', alignItems: 'baseline' }}>
      <div style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#a89e91' }}>{label}</div>
      <div style={{ fontFamily: "'Lora', serif", fontSize: '0.95rem', color: muted ? '#a89e91' : '#1a1a18' }}>{value}</div>
    </div>
  );
}
