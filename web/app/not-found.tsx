import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="min-h-[80vh] flex items-center justify-center px-8" style={{ background: 'linear-gradient(180deg, #231F20 0%, #3D3D3A 100%)' }}>
      <div className="text-center max-w-[500px]">
        <p className="font-sans font-extralight text-[0.6rem] tracking-[0.35em] uppercase text-white/30 mb-4">Page not found</p>
        <h1 className="font-display font-light text-white mb-4" style={{ fontSize: 'clamp(4rem, 10vw, 8rem)', letterSpacing: '0.1em', lineHeight: 1 }}>404</h1>
        <p className="font-display italic font-light text-white/50 mb-8" style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)' }}>
          This page doesn&apos;t exist &mdash; yet.<br />Let&apos;s get you back on track.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/" className="btn btn-outline-light">Return Home</Link>
          <Link href="/shop" className="btn btn-outline-light" style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }}>Visit the Shop</Link>
        </div>
      </div>
    </section>
  );
}
