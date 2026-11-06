'use client';
import { useEffect } from 'react';

export default function PageMotion() {
  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ default: gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        // The menu stays steady while browsing; its heading only arrives once.
        gsap.utils.toArray<HTMLElement>('.menu-head h2').forEach(element => {
          gsap.from(element, {
            opacity: 0,
            y: 30,
            duration: .85,
            ease: 'power3.out',
            clearProps: 'opacity,transform',
            scrollTrigger: { trigger: element, start: 'top 92%', once: true },
          });
        });
        // Separate copy from headings to avoid stacking transforms on parents
        // and children. Filtered menu rows remain immediately available.
        gsap.utils.toArray<HTMLElement>('.story-note,.menu-intro,.footer-faq,.cta-note').forEach(element => {
          gsap.from(element, {
            opacity: 0,
            y: 20,
            duration: .8,
            ease: 'power3.out',
            clearProps: 'opacity,transform',
            scrollTrigger: { trigger: element, start: 'top 94%', once: true },
          });
        });
      });
      media.add({
        motion: '(prefers-reduced-motion: no-preference)',
        compact: '(max-width: 760px)',
      }, context => {
        if (!context.conditions?.motion) return;
        const compact = context.conditions.compact;
        const direction = (index: number) => index % 2 === 0 ? -1 : 1;

        // Opposing lines meet, stay still through the reading area, and part
        // only as they leave. The heading itself remains in normal flow.
        gsap.utils.toArray<HTMLElement>('.kinetic-heading').forEach(heading => {
          const parts = Array.from(heading.children);
          if (!parts.length) return;
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: heading,
              start: 'top 94%',
              end: 'bottom -4%',
              scrub: .45,
              invalidateOnRefresh: true,
            },
          });
          timeline.fromTo(parts, {
            x: index => direction(index) * Math.min(innerWidth * (compact ? .1 : .14), compact ? 44 : 190),
          }, {
            x: 0,
            duration: .36,
            ease: 'sine.inOut',
          }, 0).to(parts, {
            x: 0,
            duration: .46,
            ease: 'none',
          }, .36).to(parts, {
            x: index => direction(index) * (compact ? 18 : 48),
            duration: .18,
            ease: 'power1.in',
          }, .82);
        });

      });
      // Also works when the optional WebGL experience cannot initialise.
      // Menu filters change the page length without a window resize.
      let refreshFrame = 0;
      const refreshLayout = () => {
        cancelAnimationFrame(refreshFrame);
        refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
      };
      window.addEventListener('cafe:refresh', refreshLayout);
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      cleanup = () => {
        window.removeEventListener('cafe:refresh', refreshLayout);
        cancelAnimationFrame(refreshFrame);
        media.revert();
      };
    });
    return () => { cancelled = true; cleanup?.(); };
  }, []);
  return null;
}
