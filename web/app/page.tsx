import Link from 'next/link';

export default async function HomePage() {
  return (
    <>
      {/* ═══ HERO — Anna Lou Wellness ═══ */}
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="hero-label">Anna Lou Wellness</p>
          <h1 className="hero-title">Beautifully Whole</h1>
          <p className="hero-tagline">
            Coaching, healing, and transformation for women ready<br />
            to step into a more aligned version of themselves.
          </p>
          <div className="hero-buttons">
            <Link href="/coaching" className="hero-cta">Work With Me</Link>
            <Link href="/shop" className="hero-cta hero-cta-secondary">Shop</Link>
            <Link href="/blog" className="hero-cta hero-cta-secondary">Reset Stories</Link>
          </div>
        </div>
      </section>

      {/* ═══ Placeholder sections — to be built ═══ */}
      <section className="py-32 px-8 bg-warm-neutral">
        <div className="text-center max-w-[700px] mx-auto reveal">
          <p className="section-label">Coming Soon</p>
          <h2 className="section-heading">The full platform is being built</h2>
          <p className="section-body mx-auto">
            This is the development foundation for annalouwellness.com.
            Editorial content, coaching journeys, the shop, media hub,
            and community features are on the way.
          </p>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .hero { position:relative;height:100vh;min-height:700px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#231F20 }
        .hero-overlay { position:absolute;inset:0;background:linear-gradient(180deg,rgba(35,31,32,0.4) 0%,rgba(35,31,32,0.7) 100%);z-index:1 }
        .hero-content { position:relative;z-index:3;text-align:center;padding:0 2rem;max-width:800px }
        .hero-label { font-family:'Proxima Nova',system-ui,sans-serif;font-weight:300;font-size:0.75rem;letter-spacing:0.35em;text-transform:uppercase;color:rgba(245,243,239,0.5);margin-bottom:1.5rem;opacity:0;animation:fadeUp 1s ease 0.2s forwards }
        .hero-title { font-family:'Nobel','Helvetica Neue',sans-serif;font-weight:300;font-size:clamp(3rem,8vw,6rem);color:#F5F3EF;letter-spacing:0.08em;line-height:1.1;margin-bottom:1.5rem;opacity:0;animation:fadeUp 1.2s cubic-bezier(0.22,1,0.36,1) 0.4s forwards }
        .hero-tagline { font-family:'EB Garamond',Garamond,Georgia,serif;font-weight:400;font-style:italic;font-size:clamp(1.1rem,2.5vw,1.6rem);color:rgba(245,243,239,0.75);line-height:1.7;margin-bottom:2.5rem;opacity:0;animation:fadeUp 1.2s cubic-bezier(0.22,1,0.36,1) 0.6s forwards }
        .hero-buttons { display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;opacity:0;animation:fadeUp 1s ease 0.9s forwards }
        .hero-cta { display:inline-block;font-family:'Proxima Nova',system-ui,sans-serif;font-weight:400;font-size:0.75rem;letter-spacing:0.2em;text-transform:uppercase;color:#F5F3EF;text-decoration:none;border:1px solid rgba(245,243,239,0.35);padding:0.9rem 2.2rem;border-radius:4px;transition:all 0.5s cubic-bezier(0.22,1,0.36,1) }
        .hero-cta:hover { background:#EE312F;border-color:#EE312F;color:#fff }
        .hero-cta-secondary { border-color:rgba(245,243,239,0.15);color:rgba(245,243,239,0.6) }
        .hero-cta-secondary:hover { background:rgba(245,243,239,0.08);border-color:rgba(245,243,239,0.4);color:#F5F3EF }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @media(max-width:768px) { .hero{min-height:600px} }
      `}} />
    </>
  );
}
