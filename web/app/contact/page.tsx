import { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import FAQAccordion from '@/components/FAQAccordion';
import { getContactInfo, getFAQs } from '@/lib/cms';
import { getGenericPageBySlug } from '@/lib/generic-page';
import { BreadcrumbSchema } from '@/components/StructuredData';
import UpsellBlockForSingleton from '@/components/UpsellBlockForSingleton';
import DiscoveryCallBlock from '@/components/DiscoveryCallBlock';
import EnquiryForm from '@/components/EnquiryForm';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Anna Lou Wellness. Email, location, and enquiry form.',
};

export default async function ContactPage() {
  const [siteConfig, cms, faqs] = await Promise.all([
    getContactInfo(),
    getGenericPageBySlug('contact'),
    getFAQs({ page: 'contact' }),
  ]);

  return (
    <>
      <BreadcrumbSchema items={[{ name: 'Home', href: '/' }, { name: 'Contact', href: '/contact' }]} />
      {/* Header (Anna 14 Jul STRONGER): render only if Anna has filled kicker or title.
          No hardcoded fallback. */}
      {(cms?.kicker || cms?.title) && (
        <PageHero label={cms?.kicker || ''} title={cms?.title || ''} bgClass="hero-contact" height="30vh" />
      )}

      {siteConfig.discoveryCall && (
        <section className="pt-6 pb-2 px-6">
          <DiscoveryCallBlock data={siteConfig.discoveryCall} />
        </section>
      )}

      <section className="py-8 px-8">
        <div className="max-w-[1000px] mx-auto grid grid-cols-2 gap-10 max-md:grid-cols-1 max-md:gap-6">
          <div className="reveal">
            <p className="section-label">Get in Touch</p>
            <h2 className="section-heading mb-3">We&apos;d Love to Hear From You</h2>
            <p className="section-body">Whether you&apos;re interested in coaching, have a question about the shop, or simply want to connect &mdash; reach out anytime.</p>
            <div className="mt-5 space-y-4">
              <div>
                <p className="font-sans font-light text-[0.55rem] tracking-[0.22em] uppercase text-mid-grey mb-1">Email</p>
                <p className="font-body text-dark-grey"><a href="mailto:hello@annalouwellness.com" className="text-ink hover:text-mid-grey transition-colors">hello@annalouwellness.com</a></p>
              </div>
              <div>
                <p className="font-sans font-light text-[0.55rem] tracking-[0.22em] uppercase text-mid-grey mb-1">Location</p>
                <p className="font-body text-dark-grey">London, UK</p>
              </div>
            </div>
          </div>

          <div className="reveal reveal-delay-2">
            <p className="section-label">Send a Message</p>
            <EnquiryForm
              endpoint="/api/lead/contact"
              accentColour="#6E3A5A"
              submitLabel="Send message"
              successTitle="Message sent."
              successMessage="Thank you. Anna will get back to you within 48 hours."
              fields={[
                { name: 'firstName', label: 'Your name', required: true },
                { name: 'email', label: 'Email', type: 'email', required: true },
                {
                  name: 'subject',
                  label: 'Subject',
                  type: 'select',
                  required: true,
                  options: ['Coaching Enquiry', 'Shop / Orders', 'Collaboration', 'General Enquiry'],
                },
                { name: 'message', label: 'Message', type: 'textarea', required: true, rows: 5 },
              ]}
            />
          </div>
        </div>
      </section>

      <FAQAccordion faqs={faqs} accentColour="#6E3A5A" background="#F5F3EF" />
    <UpsellBlockForSingleton endpoint="/contact-page" />
    </>
  );
}
