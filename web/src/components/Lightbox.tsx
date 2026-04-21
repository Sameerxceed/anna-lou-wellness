'use client';

import { useState, useEffect, useCallback } from 'react';

export default function Lightbox() {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  const openLightbox = useCallback((src: string, gallery: string[] = []) => {
    const imgs = gallery.length > 0 ? gallery : [src];
    setImages(imgs);
    setIndex(Math.max(0, imgs.indexOf(src)));
    setOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setOpen(false);
    document.body.style.overflow = '';
  }, []);

  const navigate = useCallback((delta: number) => {
    setIndex(prev => (prev + delta + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    // Expose globally for data-lightbox elements
    (window as any).openLightbox = openLightbox;

    const handleClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest('[data-lightbox]') as HTMLElement | null;
      if (!el) return;
      e.preventDefault();
      const src = el.dataset.lightbox || (el as HTMLImageElement).src;
      const parent = el.closest('[data-lightbox-group]');
      let gallery: string[] = [];
      if (parent) {
        gallery = Array.from(parent.querySelectorAll('[data-lightbox]')).map(
          (item) => (item as HTMLElement).dataset.lightbox || (item as HTMLImageElement).src
        );
      }
      openLightbox(src, gallery);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [openLightbox]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, closeLightbox, navigate]);

  if (!open) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: lbStyles }} />
      <div className="lightbox-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeLightbox(); }}>
        <button className="lightbox-close" onClick={closeLightbox} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        {images.length > 1 && (
          <>
            <button className="lightbox-prev" onClick={(e) => { e.stopPropagation(); navigate(-1); }} aria-label="Previous">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button className="lightbox-next" onClick={(e) => { e.stopPropagation(); navigate(1); }} aria-label="Next">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}
        <img src={images[index]} alt="" className="lightbox-img" />
      </div>
    </>
  );
}

const lbStyles = `
.lightbox-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 9999;
  display: flex; align-items: center; justify-content: center;
}
.lightbox-img { max-width: 90vw; max-height: 90vh; object-fit: contain; box-shadow: 0 0 60px rgba(0,0,0,0.4); }
.lightbox-close {
  position: absolute; top: 1.5rem; right: 1.5rem; background: none; border: none;
  cursor: pointer; padding: 0.5rem; z-index: 10;
}
.lightbox-close svg { width: 24px; height: 24px; stroke: rgba(255,255,255,0.6); transition: stroke 0.3s; }
.lightbox-close:hover svg { stroke: #fff; }
.lightbox-prev, .lightbox-next {
  position: absolute; top: 50%; transform: translateY(-50%);
  background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.15);
  border-radius: 50%; width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.3s; z-index: 10;
}
.lightbox-prev { left: 1.5rem; }
.lightbox-next { right: 1.5rem; }
.lightbox-prev:hover, .lightbox-next:hover { background: rgba(0,0,0,0.5); border-color: rgba(255,255,255,0.3); }
.lightbox-prev svg, .lightbox-next svg { width: 20px; height: 20px; stroke: rgba(255,255,255,0.7); }
`;
