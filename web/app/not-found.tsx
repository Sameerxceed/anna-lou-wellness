import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="min-h-[80vh] flex items-center justify-center px-8" style={{ background: 'linear-gradient(180deg, #231F20 0%, #3D3D3A 100%)' }}>
      <div className="text-center max-w-[550px]">
        <p className="font-sans font-extralight text-[0.6rem] tracking-[0.35em] uppercase text-white/30 mb-4">Page not found</p>
        <h1 className="font-display font-light text-white mb-3" style={{ fontSize: 'clamp(4rem, 10vw, 8rem)', letterSpacing: '0.1em', lineHeight: 1 }}>404</h1>
        <p className="font-serif italic font-normal text-white/60 mb-2" style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', lineHeight: 1.6 }}>
          Sometimes the path takes an unexpected turn.
        </p>
        <p className="font-sans font-extralight text-[0.7rem] text-white/35 mb-8 leading-relaxed">
          The page you&apos;re looking for has moved, been renamed, or doesn&apos;t exist yet.<br />
          Let&apos;s guide you back.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/" className="btn btn-outline-light">Return Home</Link>
          <Link href="/the-work" className="btn btn-outline-light" style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }}>Explore Work with Anna</Link>
          <Link href="/shop" className="btn btn-outline-light" style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }}>Visit the Shop</Link>
        </div>
        <p className="font-sans font-extralight text-[0.55rem] text-white/20 mt-8 tracking-wide">
          If you think this is a mistake, email <a href="mailto:hello@annalouwellness.com" className="underline hover:text-white/40 transition-colors">hello@annalouwellness.com</a>
        </p>
      </div>
    </section>
  );
}
