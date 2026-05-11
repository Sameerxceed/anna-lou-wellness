'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px 0px 0px' }
    );

    // Observe all reveal elements on this page
    const elements = document.querySelectorAll('.reveal:not(.visible)');
    elements.forEach((el) => observer.observe(el));

    // Safety net: force-reveal any element that is already in viewport on mount
    // and as a final fallback, reveal everything after 800ms so the page never stays blank
    const immediateCheck = setTimeout(() => {
      document.querySelectorAll('.reveal:not(.visible)').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('visible');
        }
      });
    }, 50);

    const finalFallback = setTimeout(() => {
      document.querySelectorAll('.reveal:not(.visible)').forEach((el) => {
        el.classList.add('visible');
      });
    }, 800);

    return () => {
      observer.disconnect();
      clearTimeout(immediateCheck);
      clearTimeout(finalFallback);
    };
  }, [pathname]);

  return null;
}
