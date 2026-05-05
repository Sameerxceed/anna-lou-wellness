import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About',
  description: 'Anna Lou Scaife. Twenty-five years of jewellery, coaching, and the return to self. Harrods, Selfridges, QVC Japan, Disney. Anna Lou Wellness.',
  openGraph: {
    title: 'About — Anna Lou Wellness',
    description: 'Anna Lou Scaife. Twenty-five years of jewellery, coaching, and the return to self.',
  },
};

export default function AboutPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: aboutStyles }} />

      {/* Header */}
      <section className="about-header">
        <div className="about-header-inner reveal">
          <p className="about-kicker">About</p>
          <h1 className="about-title">Twenty-five years leaves a trail.</h1>
        </div>
      </section>

      {/* Portrait + Story */}
      <section className="about-story">
        <div className="about-story-inner">
          <div className="about-portrait reveal" />
          <div className="reveal rd1">
            <p className="about-body"><span className="about-drop-cap">F</span>rom the first piece about someone selling handmade jewellery on Portobello Road, to the Drapers feature when the brand hit Harrods, Selfridges, and Harvey Nichols simultaneously, to QVC Japan appearances, to trade press coverage across two decades. For most of those years the press was about the brand and the jewellery. More recently the coverage has shifted. The coaching, the houseboat, the pivot. The question is no longer just how did you build it but what did building it cost you, what did you learn, and who are you now.</p>
            <p className="about-body">Anna Lou Wellness is the next chapter: a space where somatic coaching, honest stories, and the return to self come together for women ready to step into a more aligned version of themselves.</p>
          </div>
        </div>
      </section>

      {/* Press strip */}
      <section className="about-press">
        <p className="about-press-label">As seen in</p>
        <div className="about-press-row">
          <span className="about-press-logo" style={{ fontFamily: 'Georgia,serif', fontWeight: 400, fontSize: '1.1rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>Harrods</span>
          <span className="about-press-logo" style={{ fontFamily: "'Times New Roman',serif", fontWeight: 700, fontSize: '1rem', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Selfridges</span>
          <span className="about-press-logo" style={{ fontFamily: 'Georgia,serif', fontWeight: 400, fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const }}>Harvey Nichols</span>
          <span className="about-press-logo" style={{ fontFamily: "'Arial Narrow',sans-serif", fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>QVC Japan</span>
          <span className="about-press-logo" style={{ fontFamily: 'Georgia,serif', fontWeight: 400, fontStyle: 'italic', fontSize: '1.15rem', letterSpacing: '0.02em' }}>The Telegraph</span>
          <span className="about-press-logo" style={{ fontFamily: "'Helvetica Neue',sans-serif", fontWeight: 300, fontSize: '1rem', letterSpacing: '0.18em', textTransform: 'uppercase' as const }}>Stylist</span>
          <span className="about-press-logo" style={{ fontFamily: "'Helvetica Neue',sans-serif", fontWeight: 300, fontSize: '0.9rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>SheerLuxe</span>
        </div>
        <p className="about-press-label">Certified</p>
        <div className="about-press-row">
          <div className="about-cert" style={{ borderColor: '#1a5276', color: '#1a5276' }}>ICF<br />Accredited</div>
          <div className="about-cert" style={{ borderColor: '#c0392b', color: '#c0392b' }}>CPD<br />Certified</div>
          <div className="about-cert" style={{ borderColor: '#27ae60', color: '#27ae60' }}>TRE&reg;<br />Provider</div>
        </div>
      </section>

      {/* Contact + Links */}
      <section className="about-contact">
        <div className="about-contact-inner">
          <div className="about-contact-card reveal">
            <h3>Contact</h3>
            <p>For enquiries, press, partnerships, and speaking.</p>
            <Link href="/about/contact" className="about-contact-link">Get in touch <span>&rarr;</span></Link>
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
    </>
  );
}

const aboutStyles = `
.about-header { background:#fff; padding:2.5rem 3rem 1.5rem; text-align:center; }
.about-header-inner { max-width:700px; margin:0 auto; }
.about-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.7rem; letter-spacing:0.2em; text-transform:uppercase; color:#3D3D3A; margin-bottom:0.5rem; }
.about-title { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:300; font-size:clamp(2rem,5vw,3.2rem); color:#231F20; letter-spacing:0.05em; line-height:1.1; }

.about-story { background:#fff; padding:1.5rem 3rem 2rem; }
.about-story-inner { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:0.8fr 1.2fr; gap:2.5rem; align-items:center; }
.about-portrait { aspect-ratio:3/4; border-radius:6px; overflow:hidden; max-height:400px; background:linear-gradient(160deg,#d8ccc0,#c4b4a8); position:relative; }
.about-portrait::after { content:'Portrait of Anna. Real photo to be supplied'; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-family:Mulish,sans-serif; font-size:0.5rem; letter-spacing:0.1em; text-transform:uppercase; color:rgba(0,0,0,0.1); text-align:center; max-width:80%; }
.about-body { font-family:'EB Garamond',Georgia,serif; font-size:1.05rem; color:#3D3D3A; line-height:1.85; margin-bottom:1.5rem; }
.about-drop-cap { float:left; font-size:3.2rem; line-height:0.8; color:#6E3A5A; font-family:'EB Garamond',Georgia,serif; font-weight:500; margin-right:0.15rem; margin-top:0.1rem; }

.about-press { background:#F5F3EF; padding:1.5rem 2rem; text-align:center; }
.about-press-label { font-family:Mulish,sans-serif; font-weight:300; font-size:0.65rem; letter-spacing:0.18em; text-transform:uppercase; color:#8C8880; margin-bottom:0.5rem; }
.about-press-row { display:flex; align-items:center; justify-content:center; gap:1.5rem; flex-wrap:wrap; margin-bottom:1rem; }
.about-press-logo { color:#3D3D3A; opacity:0.5; transition:opacity 0.3s; }
.about-press-logo:hover { opacity:0.8; }
.about-cert { width:100px; height:56px; border:2px solid; border-radius:4px; display:flex; align-items:center; justify-content:center; text-align:center; font-family:Mulish,sans-serif; font-weight:600; font-size:0.6rem; letter-spacing:0.04em; line-height:1.5; }

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
  .about-header, .about-story, .about-contact { padding-left:1.2rem; padding-right:1.2rem; }
  .about-press { padding-left:1rem; padding-right:1rem; }
}
`;
