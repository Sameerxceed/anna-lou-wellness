import { Metadata } from 'next';
import SubPage from '@/components/SubPage';
import EnquiryForm from '@/components/EnquiryForm';
import { getGenericPageBySlug, genericPageProps } from '@/lib/generic-page';

export const metadata: Metadata = {
  title: 'Press',
  description: 'Twenty-five years of press coverage. Harrods, Selfridges, QVC Japan, Disney. Media features, credentials, and press kit.',
};

export default async function PressPage() {
  const cms = await getGenericPageBySlug('about-press');
  const props = genericPageProps(cms, {
    title: 'Press',
    kicker: 'About',
    kickerColour: '#231F20',
    parentLabel: 'About',
    parentHref: '/about',
    stockCategory: 'about',
    stockSeed: 'press',
    paragraphs: [
      'Twenty-five years of press coverage. From the first piece about someone selling handmade jewellery on Portobello Road, to Harrods, Selfridges, Liberty, Harvey Nichols, QVC Japan, Disney, and Henri Bendel New York.',
      'For most of those years the press was about the brand and the jewellery. More recently the coverage has shifted. The coaching, the houseboat, the pivot. The question is no longer just how did you build it — but what did building it cost you, what did you learn, and who are you now.',
      'Anna holds ICF coaching accreditation, CPD certification, and is a certified TRE® provider. She is a somatic trauma-informed coach specialising in nervous system regulation and healing from narcissistic abuse.',
      'For press enquiries, interviews, podcast appearances, and media features, please use the form below.',
    ],
    // Anna 14 Jul: press enquiries no longer redirect to Contact page.
    // Dedicated form rendered below the SubPage instead.
    cta: undefined,
  });
  return (
    <>
      <SubPage {...props} />
      <section style={{ background: '#F5F3EF', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontFamily: 'Mulish, sans-serif', fontWeight: 500, fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#6E3A5A', marginBottom: '0.5rem' }}>
            Press enquiry
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500, fontSize: '2rem', color: '#231F20', marginBottom: '1.5rem' }}>
            Get in touch with press.
          </h2>
          <EnquiryForm
            endpoint="/api/lead/press"
            accentColour="#6E3A5A"
            submitLabel="Send press enquiry"
            successTitle="Thank you."
            successMessage="Anna will be in touch within 48 hours for press enquiries."
            fields={[
              { name: 'firstName', label: 'Your name', required: true },
              { name: 'publication', label: 'Publication / outlet', required: true },
              { name: 'email', label: 'Email', type: 'email', required: true },
              { name: 'deadline', label: 'Deadline (if any)', required: false },
              { name: 'message', label: 'What are you working on?', type: 'textarea', required: true, rows: 5 },
            ]}
          />
        </div>
      </section>
    </>
  );
}
