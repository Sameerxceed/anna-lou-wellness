import { Metadata } from 'next';
import Link from 'next/link';
import { stripe } from '@/lib/stripe';
import { fetchPurchasable, type PurchasableType } from '@/lib/strapi-purchasable';

export const metadata: Metadata = {
  title: 'Thank you — Anna Lou Wellness',
  description: 'Payment confirmed. What happens next.',
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

function formatAmount(pence: number, currency: string): string {
  const symbol = currency.toLowerCase() === 'gbp' ? '£' : currency.toUpperCase() + ' ';
  return symbol + (pence / 100).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default async function ThankYouPage({ searchParams }: PageProps) {
  const { session_id } = await searchParams;

  let productName: string | null = null;
  let amount: string | null = null;
  let email: string | null = null;

  // Best-effort: load session details. If anything fails, fall back to generic message.
  if (session_id && session_id.startsWith('cs_')) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      email = session.customer_email || session.customer_details?.email || null;
      const meta = session.metadata as { strapi_type?: PurchasableType; strapi_id?: string };
      if (meta?.strapi_type && meta?.strapi_id) {
        const purchasable = await fetchPurchasable(meta.strapi_type, meta.strapi_id);
        if (purchasable) {
          productName = purchasable.name;
          amount = formatAmount(purchasable.pricePence, purchasable.currency);
        }
      }
    } catch {
      // Stripe lookup or Strapi lookup failed — show generic confirmation
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <section className="ty-page">
        <div className="ty-inner">
          <p className="ty-eyebrow">Payment confirmed</p>
          <h1 className="ty-title">Thank you.</h1>
          {productName ? (
            <p className="ty-summary">
              Your booking for <strong>{productName}</strong>{amount ? <> · <strong>{amount}</strong></> : null} is confirmed.
            </p>
          ) : (
            <p className="ty-summary">Your payment was received.</p>
          )}
          {email ? (
            <p className="ty-detail">A receipt has been sent to <strong>{email}</strong>.</p>
          ) : null}

          <div className="ty-next">
            <p className="ty-section-label">What happens next</p>
            <ol className="ty-list">
              <li>You will receive a welcome email from Anna with the next steps within 24 hours.</li>
              <li>If your booking includes a discovery or scoping call, a calendar link will follow shortly.</li>
              <li>For any questions, reply to that email or write to <a href="mailto:hello@annalouwellness.com">hello@annalouwellness.com</a>.</li>
            </ol>
          </div>

          <div className="ty-actions">
            <Link href="/" className="ty-btn-secondary">Return home</Link>
            <Link href="/the-work" className="ty-btn-primary">Explore Work with Anna</Link>
          </div>
        </div>
      </section>
    </>
  );
}

const pageStyles = `
.ty-page { background: linear-gradient(160deg, #F1EAE0 0%, #FFFFFF 100%); min-height: 70vh; padding: 4rem 2rem 5rem; }
.ty-inner { max-width: 680px; margin: 0 auto; text-align: center; }
.ty-eyebrow { font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.6rem; letter-spacing: 0.28em; text-transform: uppercase; color: #5DCAA5; margin-bottom: 0.8rem; }
.ty-title { font-family: 'Work Sans', sans-serif; font-weight: 300; font-size: clamp(2.6rem, 6vw, 3.8rem); color: #231F20; letter-spacing: 0.04em; line-height: 1.15; margin-bottom: 1rem; }
.ty-summary { font-family: 'EB Garamond', Georgia, serif; font-size: 1.15rem; line-height: 1.7; color: #3D3D3A; margin-bottom: 0.5rem; }
.ty-detail { font-family: 'EB Garamond', Georgia, serif; font-size: 1rem; line-height: 1.7; color: #6E6A62; margin-bottom: 2.5rem; }
.ty-next { background: #fff; border-radius: 8px; padding: 1.8rem 2rem; margin: 1.5rem 0 2.5rem; text-align: left; box-shadow: 0 4px 18px rgba(0,0,0,0.04); }
.ty-section-label { font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase; color: #6E3A5A; margin-bottom: 0.8rem; }
.ty-list { font-family: 'EB Garamond', Georgia, serif; font-size: 1rem; line-height: 1.7; color: #3D3D3A; padding-left: 1.3rem; }
.ty-list li { padding: 0.4rem 0; }
.ty-list a { color: #6E3A5A; text-decoration: underline; }
.ty-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
.ty-btn-primary, .ty-btn-secondary { font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase; padding: 0.85rem 1.6rem; border-radius: 4px; text-decoration: none; transition: background 0.2s; }
.ty-btn-primary { background: #6E3A5A; color: #fff; }
.ty-btn-primary:hover { background: #4F2940; }
.ty-btn-secondary { background: transparent; color: #6E3A5A; border: 1px solid #6E3A5A; }
.ty-btn-secondary:hover { background: rgba(110,58,90,0.08); }
@media (max-width: 600px) {
  .ty-page { padding: 2.5rem 1.2rem 3rem; }
  .ty-next { padding: 1.4rem 1.2rem; }
}
`;
