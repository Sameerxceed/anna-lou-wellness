import { Metadata } from 'next';
import Link from 'next/link';
import { getAboutPage, getFAQs } from '@/lib/cms';
import FAQAccordion from '@/components/FAQAccordion';
import { BreadcrumbSchema, SpeakableSchema } from '@/components/StructuredData';
import UpsellBlockForSingleton from '@/components/UpsellBlockForSingleton';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'About',
  description: 'Anna Lou Scaife. Twenty-five years of jewellery, coaching, and the return to self. Harrods, Selfridges, QVC Japan, Disney. Anna Lou Wellness.',
  openGraph: {
    title: 'About — Anna Lou Wellness',
    description: 'Anna Lou Scaife. Twenty-five years of jewellery, coaching, and the return to self.',
  },
};

const defaultPressLogos: { name: string; logo?: string }[] = [
  { name: 'Harrods' },
  { name: 'Selfridges' },
  { name: 'Harvey Nichols' },
  { name: 'Liberty' },
  { name: 'QVC Japan' },
  { name: 'Disney' },
  { name: 'The Telegraph' },
  { name: 'Stylist' },
  { name: 'SheerLuxe' },
];

const defaultCertifications: { name: string; colour: string; badge?: string }[] = [
  { name: 'ICF\nAccredited', colour: '#1a5276' },
  { name: 'CPD\nCertified', colour: '#c0392b' },
  { name: 'TRE®\nProvider', colour: '#27ae60' },
];

const defaultStory1 = `From the first piece about someone selling handmade jewellery on Portobello Road, to the Drapers feature when the brand hit Harrods, Selfridges, and Harvey Nichols simultaneously, to QVC Japan appearances, to trade press coverage across two decades. For most of those years the press was about the brand and the jewellery. More recently the coverage has shifted. The coaching, the houseboat, the pivot. The question is no longer just how did you build it but what did building it cost you, what did you learn, and who are you now.`;

const defaultStory2 = `Anna Lou is a multifaceted entrepreneur, designer, and wellness advocate based on Taggs Island, London. She is the founder of Anna Lou of London — a jewellery brand known for vibrant, personalised designs that has been featured in Harrods, Selfridges, Liberty, Harvey Nichols, Isetan and Hankyu in Tokyo, and Henri Bendel in New York. To uphold quality and ethical production, Anna moved all manufacturing to the UK from her Design Lab on Taggs Island.`;

const defaultAdditionalBio = `Anna Lou Wellness grew from her personal journey of overcoming significant challenges — narcissistic abuse, anxiety, and depression — while balancing single parenthood and business. Through her experiences, Anna became a somatic trauma-informed coach, offering support to women recovering from similar traumas. She provides one-on-one and group workshops that focus on holistic healing for mind, body, and spirit.\n\nBeyond coaching, Anna is a podcaster, author, and the creative force behind "Kirra Kirra" — an animated children's show promoting mental health, resilience, and empathy. She is also creating Narc Abuse Aid, a charity focused on providing resources and community for victims of narcissistic abuse.\n\nAcross all her ventures, Anna inspires others to embrace their unique identities, heal from past traumas, and pursue lives filled with purpose and creativity.`;

export default async function AboutPage() {
  const [page, faqs] = await Promise.all([
    getAboutPage(),
    getFAQs({ page: 'about' }),
  ]);

  const story1 = page.storyParagraph1 || defaultStory1;
  const story2 = page.storyParagraph2 || defaultStory2;
  const additionalBio = page.additionalBio || defaultAdditionalBio;
  const pressLogos = page.pressLogos.length > 0 ? page.pressLogos : defaultPressLogos;
  const certifications = page.certifications.length > 0 ? page.certifications : defaultCertifications;

  return (
    <>
      <BreadcrumbSchema items={[{ name: 'Home', href: '/' }, { name: 'About', href: '/about' }]} />
      {/* Speakable tells voice assistants which text to read when someone
          asks "who is Anna Lou?" or similar. Targets the roles tagline +
          first two story paragraphs — highest-signal intro copy. */}
      <SpeakableSchema url="/about" cssSelectors={['.about-roles', '.about-body']} headline="About Anna Lou Scaife" />
      <style dangerouslySetInnerHTML={{ __html: aboutStyles }} />

      {/* Header */}
      <section className="about-header">
        <div className="about-header-inner reveal">
          <p className="about-kicker">{page.kicker}</p>
          <h1 className="about-title">{page.title}</h1>
          <p className="about-roles">{page.rolesTagline}</p>
        </div>
      </section>

      {/* Portrait + Story */}
      <section className="about-story">
        <div className="about-story-inner">
          <div
            className="about-portrait reveal"
            style={page.portrait ? { backgroundImage: `url(${page.portrait})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
          />
          <div className="reveal rd1">
            <p className="about-body"><span className="about-drop-cap">{story1.charAt(0)}</span>{story1.slice(1)}</p>
            <p className="about-body">{story2}</p>
          </div>
        </div>
      </section>

      {/* Additional Bio */}
      <section className="about-bio">
        <div className="about-bio-inner reveal">
          {additionalBio.split('\n\n').map((para, i) => (
            <p key={i} className="about-body">{para}</p>
          ))}
        </div>
      </section>

      {/* Press strip */}
      <section className="about-press">
        <p className="about-press-label">As seen in</p>
        <div className="about-press-row">
          {pressLogos.map((logo) => (
            logo.logo
              ? <img key={logo.name} src={logo.logo} alt={logo.name} className="about-press-logo-img" />
              : <span key={logo.name} className="about-press-logo">{logo.name}</span>
          ))}
        </div>
        <p className="about-press-label">Certified</p>
        <div className="about-press-row">
          {certifications.map((cert) => (
            cert.badge
              ? <img key={cert.name} src={cert.badge} alt={cert.name} className="about-cert-img" />
              : <div key={cert.name} className="about-cert" style={{ borderColor: cert.colour, color: cert.colour }}>
                  {cert.name.split('\n').map((line, i) => (
                    <span key={i}>{i > 0 && <br />}{line}</span>
                  ))}
                </div>
          ))}
        </div>
      </section>

      {/* Contact + Links */}
      <section className="about-contact">
        <div className="about-contact-inner">
          <div className="about-contact-card reveal">
            <h3>Contact</h3>
            <p>For enquiries, press, partnerships, and speaking.</p>
            <Link href="/contact" className="about-contact-link">Get in touch <span>&rarr;</span></Link>
          </div>
          <div className="about-contact-card reveal rd1">
            <h3>Press</h3>
            <p>Media features, credentials, and press kit.</p>
            <Link href="/about/press" className="about-contact-link">View press <span>&rarr;</span></Link>
          </div>
          <div className="about-contact-card reveal rd2">
            <h3>Work With Me</h3>
            <p>Partnership and collaboration enquiries.</p>
            <Link href="/about/partnerships" className="about-contact-link">Enquire <span>&rarr;</span></Link>
          </div>
        </div>
      </section>

      <FAQAccordion faqs={faqs} accentColour="#6E3A5A" background="#F5F3EF" />
    <UpsellBlockForSingleton endpoint="/about-page" />
    </>
  );
}

const aboutStyles = `
.about-header { background:#fff; padding:2.5rem 3rem 1.5rem; text-align:center; }
.about-header-inner { max-width:900px; margin:0 auto; }
.about-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.7rem; letter-spacing:0.2em; text-transform:uppercase; color:#3D3D3A; margin-bottom:0.5rem; }
.about-title { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:300; font-size:clamp(2rem,5vw,3.2rem); color:#231F20; letter-spacing:0.05em; line-height:1.1; margin-bottom:0.5rem; }
.about-roles { font-family:'EB Garamond',Georgia,serif; font-size:1rem; color:#6E3A5A; font-style:italic; letter-spacing:0.02em; }

.about-story { background:#fff; padding:1.5rem 3rem 1rem; }
.about-story-inner { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:0.8fr 1.2fr; gap:2.5rem; align-items:center; }
.about-portrait { aspect-ratio:3/4; border-radius:6px; overflow:hidden; max-height:400px; background:linear-gradient(160deg,#d8ccc0,#c4b4a8); position:relative; }
.about-portrait::after { content:'Portrait of Anna. Real photo to be supplied'; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-family:Mulish,sans-serif; font-size:0.5rem; letter-spacing:0.1em; text-transform:uppercase; color:rgba(0,0,0,0.1); text-align:center; max-width:80%; }
.about-body { font-family:'EB Garamond',Georgia,serif; font-size:1.05rem; color:#3D3D3A; line-height:1.85; margin-bottom:1.2rem; }
.about-drop-cap { float:left; font-size:3.2rem; line-height:0.8; color:#6E3A5A; font-family:'EB Garamond',Georgia,serif; font-weight:500; margin-right:0.15rem; margin-top:0.1rem; }

.about-bio { background:#F5F3EF; padding:1.5rem 3rem; }
.about-bio-inner { max-width:900px; margin:0 auto; }

.about-press { background:#fff; padding:1.5rem 2rem; text-align:center; }
.about-press-label { font-family:Mulish,sans-serif; font-weight:300; font-size:0.65rem; letter-spacing:0.18em; text-transform:uppercase; color:#8C8880; margin-bottom:0.5rem; }
.about-press-row { display:flex; align-items:center; justify-content:center; gap:1.5rem; flex-wrap:wrap; margin-bottom:1rem; }
.about-press-logo { font-family:Georgia,serif; font-weight:400; font-size:0.95rem; letter-spacing:0.1em; text-transform:uppercase; color:#3D3D3A; opacity:0.5; transition:opacity 0.3s; }
.about-press-logo:hover { opacity:0.8; }
.about-press-logo-img { height:32px; width:auto; opacity:0.7; filter:grayscale(100%); transition:all 0.3s; }
.about-press-logo-img:hover { opacity:1; filter:grayscale(0%); }
.about-cert { width:100px; height:56px; border:2px solid; border-radius:4px; display:flex; align-items:center; justify-content:center; text-align:center; font-family:Mulish,sans-serif; font-weight:600; font-size:0.6rem; letter-spacing:0.04em; line-height:1.5; }
.about-cert-img { height:56px; width:auto; }

.about-contact { background:#fff; padding:2rem 3rem; }
.about-contact-inner { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; }
.about-contact-card { background:#F5F3EF; border-radius:8px; padding:2rem; border-left:3px solid #231F20; }
.about-contact-card h3 { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:400; font-size:1rem; color:#231F20; margin-bottom:0.5rem; }
.about-contact-card p { font-family:'EB Garamond',Georgia,serif; font-size:0.9rem; color:#3D3D3A; line-height:1.6; margin-bottom:1rem; }
.about-contact-link { font-family:Mulish,sans-serif; font-weight:400; font-size:0.6rem; letter-spacing:0.12em; text-transform:uppercase; color:#231F20; text-decoration:none; display:inline-flex; align-items:center; gap:0.3rem; transition:gap 0.3s; }
.about-contact-link:hover { gap:0.6rem; }

@media (max-width:900px) {
  .about-story-inner { grid-template-columns:1fr; gap:1.5rem; }
  .about-contact-inner { grid-template-columns:1fr; }
  .about-header, .about-story, .about-bio, .about-contact { padding-left:1.2rem; padding-right:1.2rem; }
  .about-press { padding-left:1rem; padding-right:1rem; }
}
`;
