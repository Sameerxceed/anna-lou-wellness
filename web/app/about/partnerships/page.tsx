import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
import EnquiryForm from '@/components/EnquiryForm';
import { getGenericPageBySlug, genericPageProps } from '@/lib/generic-page';

export const metadata: Metadata = {
  title: 'Work With Me — Partnerships',
  description: 'Partnership and collaboration enquiries. Brand collaborations, sponsorship, and joint ventures.',
};

export default async function PartnershipsPage() {
  const cms = await getGenericPageBySlug('about-partnerships');
  const props = genericPageProps(cms, {
    title: 'Work With Me',
    kicker: 'About',
    kickerColour: '#231F20',
    parentLabel: 'About',
    parentHref: '/about',
    stockCategory: 'about',
    stockSeed: 'partnerships',
    paragraphs: [
      "Anna Lou Wellness is open to collaborations that align with the brand's values: honest storytelling, somatic wellbeing, ethical production, and supporting women through real transformation.",
      'Previous collaborations include Harrods, Selfridges, Harvey Nichols, Liberty, Disney, Hello Kitty, Ray-Ban, QVC Japan, and a range of independent retailers worldwide.',
      'We are interested in brand partnerships, product collaborations, editorial sponsorships, and event co-hosting. If what you do supports women coming back to themselves, we want to hear from you.',
      'Fill in the form below and tell us what you have in mind.',
    ],
    // Anna 14 Jul: no longer redirects to Contact page. Dedicated form below.
    cta: undefined,
  });
  return (
    <>
      <SubPage {...props} />
      <section style={{ background: '#F5F3EF', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontFamily: 'Mulish, sans-serif', fontWeight: 500, fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#6E3A5A', marginBottom: '0.5rem' }}>
            Partnership enquiry
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500, fontSize: '2rem', color: '#231F20', marginBottom: '1.5rem' }}>
            Tell us what you have in mind.
          </h2>
          <EnquiryForm
            endpoint="/api/lead/partnership"
            accentColour="#6E3A5A"
            submitLabel="Send partnership enquiry"
            successTitle="Thank you."
            successMessage="Anna will be in touch within 48 hours."
            fields={[
              { name: 'firstName', label: 'Your name', required: true },
              { name: 'organisation', label: 'Organisation / brand', required: true },
              { name: 'email', label: 'Email', type: 'email', required: true },
              { name: 'website', label: 'Website (optional)', required: false },
              { name: 'message', label: 'The collaboration you have in mind', type: 'textarea', required: true, rows: 5 },
            ]}
          />
        </div>
      </section>
    </>
  );
}
