import type { MouseEvent } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export { gsap, ScrollTrigger };

/* True when the visitor asked their OS for less motion. Only read on the client. */
export const REDUCED: boolean =
  typeof window !== 'undefined' &&
  !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

/* Smooth-scroll to a section id: onClick={goTo('projects')} */
export const goTo = (id: string) => (e?: MouseEvent) => {
  if (e) e.preventDefault();
  gsap.to(window, {
    scrollTo: { y: '#' + id, autoKill: true },
    duration: REDUCED ? 0.01 : 1.6,
    ease: 'power3.inOut'
  });
};
