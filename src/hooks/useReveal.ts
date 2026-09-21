import type { RefObject } from 'react';
import { gsap } from '@/lib/motion';
import { useIsoLayoutEffect } from './useIsoLayoutEffect';

/* Scroll-driven entrances. Mark elements inside a section with:
   data-mask (heading wipe) and data-reveal (+ optional data-delay in seconds). */
export function useReveal(ref: RefObject<HTMLElement | null>) {
  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>('[data-mask]').forEach((el) => {
        gsap.from(el.children[0], { yPercent: 110, duration: 1.1, ease: 'power4.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
      });
      root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, { opacity: 0, y: 36, duration: 1, delay: parseFloat(el.dataset.delay || '0'), ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
      });
    }, root);
    return () => ctx.revert();
  }, [ref]);
}
