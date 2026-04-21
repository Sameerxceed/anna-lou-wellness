import { Metadata } from 'next';
import PageHero from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Anna Lou Wellness collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero title="Privacy Policy" bgClass="hero-contact" height="35vh" />

      <section className="py-20 px-8">
        <div className="max-w-[800px] mx-auto">
          <p className="section-body mb-6"><em>Last updated: March 2026</em></p>

          <h2 className="section-heading" style={{ fontSize: '1.6rem' }}>1. Who We Are</h2>
          <p className="section-body mb-8">Anna Lou Wellness is based in London, UK. When we refer to &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo; in this policy, we mean Anna Lou Wellness.</p>

          <h2 className="section-heading" style={{ fontSize: '1.6rem' }}>2. Information We Collect</h2>
          <p className="section-body mb-4">We may collect and process the following personal data:</p>
          <p className="section-body mb-8">Name, email address, phone number, and postal address when you make a purchase, submit an enquiry form, or contact us directly. Payment information is processed securely by Stripe and is never stored on our servers.</p>

          <h2 className="section-heading" style={{ fontSize: '1.6rem' }}>3. How We Use Your Information</h2>
          <p className="section-body mb-8">We use your information to process orders and payments, respond to enquiries, send order confirmations and shipping updates, and improve our website. We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>

          <h2 className="section-heading" style={{ fontSize: '1.6rem' }}>4. Cookies</h2>
          <p className="section-body mb-8">Our website uses essential cookies for basic functionality (session management, cart storage) and optional analytics cookies to understand how visitors use the site. You can decline non-essential cookies via the banner shown on your first visit.</p>

          <h2 className="section-heading" style={{ fontSize: '1.6rem' }}>5. Your Rights</h2>
          <p className="section-body mb-8">Under GDPR, you have the right to access, correct, or delete your personal data. You may also object to processing or request data portability. To exercise these rights, contact us at hello@annalouwellness.com.</p>

          <h2 className="section-heading" style={{ fontSize: '1.6rem' }}>6. Data Retention</h2>
          <p className="section-body mb-8">We retain order data for the period required by UK tax law (6 years). Enquiry form data is retained for 12 months. You may request deletion at any time.</p>

          <h2 className="section-heading" style={{ fontSize: '1.6rem' }}>7. Contact</h2>
          <p className="section-body mb-8">For questions about this privacy policy, please contact: hello@annalouwellness.com</p>

          <p className="section-body text-mid-grey italic">This is a template privacy policy. Please have it reviewed by a legal professional before publishing.</p>
        </div>
      </section>
    </>
  );
}
