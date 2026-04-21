interface PageHeroProps {
  label?: string;
  title: string;
  subtitle?: string;
  bgClass?: string;
  bgImage?: string;
  height?: string;
}

export default function PageHero({ label, title, subtitle, bgClass = 'hero-gardens', bgImage, height = '55vh' }: PageHeroProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: heroStyles }} />
      <div className="page-hero" style={{ height, minHeight: 320 }}>
        <div
          className={`page-hero-bg ${bgClass}`}
          style={bgImage ? { backgroundImage: `url('${bgImage}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        />
        <div className="page-hero-overlay" />
        <div className="page-hero-content">
          {label && <p className="page-hero-label">{label}</p>}
          <h1 className="page-hero-title" dangerouslySetInnerHTML={{ __html: title }} />
          {subtitle && <p className="page-hero-sub">{subtitle}</p>}
        </div>
      </div>
    </>
  );
}

const heroStyles = `
.page-hero { position: relative; display: flex; align-items: flex-end; justify-content: center; overflow: hidden; }
.page-hero-bg { position: absolute; inset: 0; background-size: cover; background-position: center; }
.page-hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(30,40,25,0.15) 0%, rgba(30,40,25,0.05) 30%, rgba(20,25,18,0.6) 100%);
}
.page-hero-content { position: relative; z-index: 2; text-align: center; padding: 0 2rem 5vh; }
.page-hero-label {
  font-family: 'Josefin Sans', sans-serif; font-weight: 200; font-size: 0.7rem;
  letter-spacing: 0.35em; text-transform: uppercase; color: rgba(255,255,255,0.55); margin-bottom: 1rem;
}
.page-hero-title {
  font-family: 'Cormorant Garamond', serif; font-weight: 300;
  font-size: clamp(2.5rem, 6vw, 5rem); color: #faf8f4; letter-spacing: 0.08em; line-height: 1.15;
}
.page-hero-sub {
  font-family: 'Cormorant Garamond', serif; font-weight: 300; font-style: italic;
  font-size: clamp(1.1rem, 2.5vw, 1.5rem); color: rgba(255,255,255,0.7);
  margin-top: 1rem; max-width: 600px; margin-left: auto; margin-right: auto;
}
.hero-gardens { background: linear-gradient(135deg, #3a4a32, #2a3528, #4a5c3e); }
.hero-bloom { background: linear-gradient(135deg, #5a6c4e, #7a8c6e, #4a6a4c); }
.hero-visit { background: linear-gradient(135deg, #4a5c3e, #3a5a3a, #6e8a6c); }
.hero-stay { background: linear-gradient(135deg, #2c3a28, #1e2818, #3a4a32); }
.hero-events { background: linear-gradient(135deg, #4a5a42, #6e7a62, #3a4a32); }
.hero-about { background: linear-gradient(135deg, #6e8a8c, #4a6a6c, #5a7a7c); }
.hero-contact { background: linear-gradient(135deg, #1a1a18, #2c3a28, #1e2818); }
.hero-shop { background: linear-gradient(135deg, #5a6c4e, #4a5c3e, #7a8c6e); }
@media (max-width: 768px) { .page-hero { height: 45vh !important; min-height: 280px !important; } }
`;
