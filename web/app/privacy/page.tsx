import { Metadata } from 'next';
import PageHero from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Anna Lou Wellness collects, uses, stores, and protects your personal information. GDPR compliant, UK-based.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero title="Privacy Policy" bgClass="hero-contact" height="35vh" />

      <section className="py-6 px-8">
        <div className="max-w-[900px] mx-auto">
          <p className="section-body mb-4"><em>Last updated: May 2026</em></p>

          <h2 className="section-heading mb-3" style={{ fontSize: '1.6rem' }}>1. Who We Are</h2>
          <p className="section-body mb-6">Anna Lou Wellness is a sole trader based in London, United Kingdom, operated by Anna Lou Scaife. When we refer to &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo; in this policy, we mean Anna Lou Wellness. Our website is annalouwellness.com. For data protection enquiries, contact: hello@annalouwellness.com.</p>

          <h2 className="section-heading mb-3" style={{ fontSize: '1.6rem' }}>2. Information We Collect</h2>
          <p className="section-body mb-4">We may collect the following personal data:</p>
          <ul className="section-body mb-6 list-disc pl-6 space-y-1">
            <li><strong>Identity data:</strong> Name, email address, phone number</li>
            <li><strong>Contact data:</strong> Postal address (for product orders)</li>
            <li><strong>Transaction data:</strong> Purchase history, payment method (card details are processed by Stripe and never stored on our servers)</li>
            <li><strong>Coaching data:</strong> Notes from coaching sessions (stored securely and confidentially)</li>
            <li><strong>Subscription data:</strong> Email address when you subscribe to our Substack newsletter</li>
            <li><strong>Technical data:</strong> IP address, browser type, device information, pages visited (collected via analytics)</li>
            <li><strong>Quiz/form data:</strong> Responses to wellness quizzes or enquiry forms</li>
          </ul>

          <h2 className="section-heading mb-3" style={{ fontSize: '1.6rem' }}>3. How We Use Your Information</h2>
          <p className="section-body mb-4">We use your data to:</p>
          <ul className="section-body mb-6 list-disc pl-6 space-y-1">
            <li>Process orders, payments, and shipping</li>
            <li>Deliver coaching sessions and programme materials</li>
            <li>Manage your Reset Room membership</li>
            <li>Respond to enquiries and provide customer support</li>
            <li>Send order confirmations and shipping updates</li>
            <li>Deliver newsletter content (via Substack, only if you subscribe)</li>
            <li>Improve our website and services through anonymous analytics</li>
          </ul>
          <p className="section-body mb-6">We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>

          <h2 className="section-heading mb-3" style={{ fontSize: '1.6rem' }}>4. Legal Basis for Processing (GDPR)</h2>
          <p className="section-body mb-4">We process your data under the following legal bases:</p>
          <ul className="section-body mb-6 list-disc pl-6 space-y-1">
            <li><strong>Contract:</strong> To fulfil orders, deliver services, and manage memberships</li>
            <li><strong>Consent:</strong> For newsletter subscriptions and non-essential cookies</li>
            <li><strong>Legitimate interest:</strong> To improve our services and website experience</li>
            <li><strong>Legal obligation:</strong> To comply with tax and accounting requirements</li>
          </ul>

          <h2 className="section-heading mb-3" style={{ fontSize: '1.6rem' }}>5. Third-Party Services</h2>
          <p className="section-body mb-4">We use the following third-party services that may process your data:</p>
          <ul className="section-body mb-6 list-disc pl-6 space-y-1">
            <li><strong>Stripe:</strong> Secure payment processing (PCI DSS compliant)</li>
            <li><strong>Substack:</strong> Newsletter delivery and email subscriptions</li>
            <li><strong>YouTube:</strong> Embedded video content (mantra videos)</li>
            <li><strong>Cloudinary:</strong> Image hosting and delivery</li>
            <li><strong>Vercel/Coolify:</strong> Website hosting</li>
            <li><strong>Instagram, Facebook, YouTube:</strong> Social media links (no tracking until you click)</li>
          </ul>
          <p className="section-body mb-6">Each service operates under its own privacy policy. We encourage you to review their policies directly.</p>

          <h2 className="section-heading mb-3" style={{ fontSize: '1.6rem' }}>6. Cookies</h2>
          <p className="section-body mb-4">Our website uses the following cookies:</p>
          <ul className="section-body mb-6 list-disc pl-6 space-y-1">
            <li><strong>Essential cookies:</strong> Session management, cart storage, cookie consent preference &mdash; required for the site to function</li>
            <li><strong>Analytics cookies:</strong> Anonymous usage data to understand how visitors use the site (optional, consent-based)</li>
          </ul>
          <p className="section-body mb-6">You can decline non-essential cookies via the banner shown on your first visit. You can also manage cookies through your browser settings at any time.</p>

          <h2 className="section-heading mb-3" style={{ fontSize: '1.6rem' }}>7. Your Rights (GDPR)</h2>
          <p className="section-body mb-4">Under the UK GDPR, you have the right to:</p>
          <ul className="section-body mb-6 list-disc pl-6 space-y-1">
            <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
            <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
            <li><strong>Erasure:</strong> Request deletion of your data (&ldquo;right to be forgotten&rdquo;)</li>
            <li><strong>Restriction:</strong> Request we limit how we use your data</li>
            <li><strong>Portability:</strong> Request your data in a machine-readable format</li>
            <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
            <li><strong>Withdraw consent:</strong> Unsubscribe from newsletters or withdraw cookie consent at any time</li>
          </ul>
          <p className="section-body mb-6">To exercise any of these rights, email: hello@annalouwellness.com. We will respond within 30 days.</p>

          <h2 className="section-heading mb-3" style={{ fontSize: '1.6rem' }}>8. Data Retention</h2>
          <ul className="section-body mb-6 list-disc pl-6 space-y-1">
            <li><strong>Order data:</strong> Retained for 6 years (UK tax law requirement)</li>
            <li><strong>Coaching session notes:</strong> Retained for 12 months after last session, then securely deleted</li>
            <li><strong>Enquiry form data:</strong> Retained for 12 months</li>
            <li><strong>Newsletter subscribers:</strong> Until you unsubscribe</li>
            <li><strong>Analytics data:</strong> Anonymised, retained for 26 months</li>
          </ul>
          <p className="section-body mb-6">You may request deletion at any time, subject to our legal obligations.</p>

          <h2 className="section-heading mb-3" style={{ fontSize: '1.6rem' }}>9. Data Security</h2>
          <p className="section-body mb-6">We use SSL/HTTPS encryption across our entire website. Payment data is handled by Stripe (PCI DSS Level 1 certified) and is never stored on our servers. Access to personal data is restricted to authorised individuals only. In the unlikely event of a data breach, we will notify affected individuals and the ICO within 72 hours as required by GDPR.</p>

          <h2 className="section-heading mb-3" style={{ fontSize: '1.6rem' }}>10. Children&rsquo;s Privacy</h2>
          <p className="section-body mb-6">Our services are not directed at children under 16. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us and we will delete it promptly.</p>

          <h2 className="section-heading mb-3" style={{ fontSize: '1.6rem' }}>11. Changes to This Policy</h2>
          <p className="section-body mb-6">We may update this policy from time to time. Changes will be posted on this page with an updated date. We encourage you to review this policy periodically.</p>

          <h2 className="section-heading mb-3" style={{ fontSize: '1.6rem' }}>12. Contact &amp; Complaints</h2>
          <p className="section-body mb-4">For questions about this privacy policy or to exercise your data rights:<br />hello@annalouwellness.com</p>
          <p className="section-body mb-6">If you are unsatisfied with how we handle your data, you have the right to lodge a complaint with the Information Commissioner&rsquo;s Office (ICO): ico.org.uk</p>

          <p className="section-body text-[#8C8880] italic text-sm">This is a template privacy policy. Please have it reviewed by a legal professional before publishing.</p>
        </div>
      </section>
    </>
  );
}
