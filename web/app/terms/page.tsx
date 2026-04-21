import { Metadata } from 'next';
import PageHero from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and conditions for purchases from the Anna Lou Wellness shop.',
};

export default function TermsPage() {
  return (
    <>
      <PageHero title="Terms &amp; Conditions" bgClass="hero-contact" height="35vh" />

      <section className="py-20 px-8">
        <div className="max-w-[800px] mx-auto">
          <p className="section-body mb-6"><em>Last updated: March 2026</em></p>

          <h2 className="section-heading" style={{ fontSize: '1.6rem' }}>1. General</h2>
          <p className="section-body mb-8">These terms and conditions apply to all purchases made through the Anna Lou Wellness online shop. By placing an order, you agree to these terms.</p>

          <h2 className="section-heading" style={{ fontSize: '1.6rem' }}>2. Orders &amp; Payment</h2>
          <p className="section-body mb-8">All prices are in GBP (&pound;) and include VAT where applicable. Payment is accepted by credit/debit card via Stripe or by bank transfer. Orders are confirmed by email once payment is received. We reserve the right to cancel orders if products are out of stock.</p>

          <h2 className="section-heading" style={{ fontSize: '1.6rem' }}>3. Shipping</h2>
          <p className="section-body mb-8">We ship to the United Kingdom and internationally. Orders are typically dispatched within 2&ndash;3 working days and delivered within 3&ndash;5 working days for UK orders. Shipping costs are calculated at checkout. We are not responsible for delays caused by postal services.</p>

          <h2 className="section-heading" style={{ fontSize: '1.6rem' }}>4. Returns &amp; Refunds</h2>
          <p className="section-body mb-8">If you are not satisfied with your purchase, you may return unused items in their original packaging within 14 days of delivery for a full refund. Digital downloads are non-refundable once accessed. To initiate a return, please contact hello@annalouwellness.com.</p>

          <h2 className="section-heading" style={{ fontSize: '1.6rem' }}>5. Product Descriptions</h2>
          <p className="section-body mb-8">We make every effort to ensure product descriptions and photographs are accurate. As many of our products are handmade or natural, slight variations in appearance are normal and not considered defects.</p>

          <h2 className="section-heading" style={{ fontSize: '1.6rem' }}>6. Intellectual Property</h2>
          <p className="section-body mb-8">All content on this website &mdash; text, photographs, design, and artwork &mdash; is the property of Anna Lou Wellness and may not be reproduced without permission.</p>

          <h2 className="section-heading" style={{ fontSize: '1.6rem' }}>7. Contact</h2>
          <p className="section-body mb-8">For questions about these terms, please contact: hello@annalouwellness.com</p>

          <p className="section-body text-mid-grey italic">This is a template. Please have it reviewed by a legal professional before publishing.</p>
        </div>
      </section>
    </>
  );
}
