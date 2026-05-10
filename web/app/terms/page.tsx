import { Metadata } from 'next';
import PageHero from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and conditions for Anna Lou Wellness services, products, coaching, retreats, digital downloads, and the Reset Room membership.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <>
      <PageHero title="Terms &amp; Conditions" bgClass="hero-contact" height="35vh" />

      <section className="py-6 px-8">
        <div className="max-w-[900px] mx-auto">
          <p className="section-body mb-4"><em>Last updated: May 2026</em></p>

          <h2 className="section-heading mb-3" style={{ fontSize: '1.6rem' }}>1. General</h2>
          <p className="section-body mb-6">These terms and conditions (&ldquo;Terms&rdquo;) govern all purchases, bookings, and use of services provided through annalouwellness.com, operated by Anna Lou Wellness, a sole trader based in London, United Kingdom. By placing an order, booking a session, or subscribing to a membership, you agree to these Terms in full. If you do not agree, please do not use this website.</p>

          <h2 className="section-heading mb-3" style={{ fontSize: '1.6rem' }}>2. Services</h2>
          <p className="section-body mb-4">Anna Lou Wellness provides the following services:</p>
          <ul className="section-body mb-6 list-disc pl-6 space-y-1">
            <li>One-to-one coaching and therapy sessions (in-person and online)</li>
            <li>Group workshops, retreats, and day experiences</li>
            <li>Corporate wellbeing programmes and speaking engagements</li>
            <li>The Reset Room &mdash; a monthly digital membership</li>
            <li>Online courses and digital downloads</li>
            <li>Handmade jewellery and physical products</li>
          </ul>
          <p className="section-body mb-6">Wellness coaching is not a substitute for medical or psychological treatment. If you are experiencing a mental health crisis, please contact your GP or the Samaritans (116 123). Anna Lou Wellness does not diagnose, treat, or claim to cure any medical condition.</p>

          <h2 className="section-heading mb-3" style={{ fontSize: '1.6rem' }}>3. Orders &amp; Payment</h2>
          <p className="section-body mb-6">All prices are in GBP (&pound;) and include VAT where applicable. Payment is accepted by credit/debit card via Stripe. Orders are confirmed by email once payment is received. We reserve the right to cancel orders if products are out of stock, in which case a full refund will be issued within 5 working days.</p>

          <h2 className="section-heading mb-3" style={{ fontSize: '1.6rem' }}>4. Coaching &amp; Sessions</h2>
          <p className="section-body mb-4">Bookings for one-to-one coaching sessions are confirmed upon full payment. Cancellation policy:</p>
          <ul className="section-body mb-6 list-disc pl-6 space-y-1">
            <li><strong>48+ hours notice:</strong> Full reschedule or refund</li>
            <li><strong>24&ndash;48 hours notice:</strong> One reschedule offered; no refund</li>
            <li><strong>Less than 24 hours / no-show:</strong> No refund or reschedule</li>
          </ul>
          <p className="section-body mb-6">Sessions are confidential. Any information shared remains private unless there is a safeguarding concern, in which case we may be legally required to share information with the appropriate authorities.</p>

          <h2 className="section-heading mb-3" style={{ fontSize: '1.6rem' }}>5. Retreats, Workshops &amp; Events</h2>
          <p className="section-body mb-4">Places on retreats and workshops are secured by a non-refundable deposit unless otherwise stated. Cancellation policy:</p>
          <ul className="section-body mb-6 list-disc pl-6 space-y-1">
            <li><strong>30+ days before:</strong> Full refund minus deposit</li>
            <li><strong>14&ndash;30 days before:</strong> 50% refund</li>
            <li><strong>Less than 14 days:</strong> No refund (transfer to another person permitted)</li>
          </ul>
          <p className="section-body mb-6">We reserve the right to cancel or reschedule events due to low attendance or unforeseen circumstances. In such cases, a full refund including deposit will be issued.</p>

          <h2 className="section-heading mb-3" style={{ fontSize: '1.6rem' }}>6. The Reset Room Membership</h2>
          <p className="section-body mb-6">The Reset Room is a recurring monthly subscription. You may cancel at any time; access continues until the end of the current billing period. No partial refunds are given for the current month. Membership content is for personal use only and may not be shared, reproduced, or distributed.</p>

          <h2 className="section-heading mb-3" style={{ fontSize: '1.6rem' }}>7. Digital Downloads</h2>
          <p className="section-body mb-6">Digital products (guides, workbooks, audios) are delivered electronically. Due to their nature, digital downloads are non-refundable once accessed or downloaded. You receive a personal, non-transferable licence to use the content for your own purposes.</p>

          <h2 className="section-heading mb-3" style={{ fontSize: '1.6rem' }}>8. Physical Products &amp; Shipping</h2>
          <p className="section-body mb-4">We ship to the United Kingdom and internationally. Orders are typically dispatched within 2&ndash;3 working days.</p>
          <ul className="section-body mb-6 list-disc pl-6 space-y-1">
            <li><strong>UK delivery:</strong> 3&ndash;5 working days (Royal Mail)</li>
            <li><strong>International delivery:</strong> 7&ndash;14 working days</li>
          </ul>
          <p className="section-body mb-6">Shipping costs are calculated at checkout. We are not responsible for delays caused by postal services or customs. Risk passes to you upon delivery.</p>

          <h2 className="section-heading mb-3" style={{ fontSize: '1.6rem' }}>9. Returns &amp; Refunds</h2>
          <p className="section-body mb-4">If you are not satisfied with a physical product, you may return unused items in their original packaging within 14 days of delivery for a full refund. To initiate a return, email hello@annalouwellness.com with your order number.</p>
          <p className="section-body mb-6">As many of our products are handmade or contain natural crystals, slight variations in colour, size, and appearance are normal and not considered defects. Personalised items are non-returnable unless faulty.</p>

          <h2 className="section-heading mb-3" style={{ fontSize: '1.6rem' }}>10. Corporate Bookings</h2>
          <p className="section-body mb-6">Corporate wellbeing sessions, speaking engagements, and bespoke programmes are quoted individually. A signed agreement and 50% deposit are required to confirm the booking. The balance is due 7 days before the event. Cancellation by the client within 14 days of the event forfeits the deposit.</p>

          <h2 className="section-heading mb-3" style={{ fontSize: '1.6rem' }}>11. Intellectual Property</h2>
          <p className="section-body mb-6">All content on this website &mdash; including text, photographs, illustrations, video, audio, branding, and design &mdash; is the intellectual property of Anna Lou Wellness and protected by UK copyright law. Reproduction, distribution, or commercial use without written permission is prohibited.</p>

          <h2 className="section-heading mb-3" style={{ fontSize: '1.6rem' }}>12. Limitation of Liability</h2>
          <p className="section-body mb-6">Anna Lou Wellness provides coaching, education, and wellness support. Participation in any programme, session, or event is at your own risk. We accept no liability for any loss, injury, or damage arising from your use of our services, products, or content, to the fullest extent permitted by law.</p>

          <h2 className="section-heading mb-3" style={{ fontSize: '1.6rem' }}>13. Governing Law</h2>
          <p className="section-body mb-6">These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the English courts.</p>

          <h2 className="section-heading mb-3" style={{ fontSize: '1.6rem' }}>14. Contact</h2>
          <p className="section-body mb-6">For questions about these Terms, please contact:<br />hello@annalouwellness.com</p>

          <p className="section-body text-[#8C8880] italic text-sm">This is a template document. Please have it reviewed by a legal professional before publishing.</p>
        </div>
      </section>
    </>
  );
}
