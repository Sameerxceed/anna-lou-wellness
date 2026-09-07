import { Metadata } from 'next';
import { getSession } from '@/lib/auth';
import DefaultAddressForm from '@/components/DefaultAddressForm';

export const metadata: Metadata = {
  title: 'Addresses — Anna Lou Wellness',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/**
 * /account/addresses — single default shipping address.
 *
 * Launch scope is one saved default (not a full address book). The
 * DefaultAddressForm client component handles view/edit toggling and
 * POSTs to /api/account/default-address which writes the JSON back to
 * the user's Strapi record.
 */
export default async function AddressesPage() {
  const session = await getSession();
  if (!session) return null;
  const { user } = session;

  return (
    <div>
      <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, fontSize: '0.55rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#c4704a', margin: 0 }}>Addresses</p>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.4rem', color: '#1a1a18', margin: '0.4rem 0 0.6rem', lineHeight: 1.05 }}>
        Default delivery address
      </h1>
      <p style={{ fontFamily: "'Lora', serif", fontSize: '0.95rem', color: '#6e6a62', margin: '0 0 2rem' }}>
        Save one address here to skip the address fields at checkout next time.
        We only keep one on file for now — you can still ship to a different address
        by editing at checkout.
      </p>

      <DefaultAddressForm
        initial={user.default_address || null}
        initialPhone={user.phone || null}
        initialFirstName={user.firstName || null}
        initialLastName={user.lastName || null}
      />
    </div>
  );
}
