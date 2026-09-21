'use client';

import { Fragment, useEffect, useRef } from 'react';
import { gsap, goTo } from '@/lib/motion';
import { DATA } from '@/data';

/* One line of the big title, split into words and letters so GSAP can stagger the letters.
   Words stay whole; a long line can only wrap between words. */
function Line({ text }: { text: string }) {
  const words = text.split(' ');
  return (
    <span className="h-line h-hide block overflow-hidden pt-[0.06em] -mt-[0.06em] pb-[0.22em] -mb-[0.14em]">
      {words.map((word, w) => (
        <Fragment key={w}>
          {w > 0 && ' '}
          <span className="inline-block whitespace-nowrap">
            {Array.from(word).map((c, i) => (
              <span key={i} className="h-char inline-block">{c}</span>
            ))}
          </span>
        </Fragment>
      ))}
    </span>
  );
}

export default function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.6 });
      tl.set('.h-line', { visibility: 'visible' })
        .fromTo('.h-char', { yPercent: 115 }, { yPercent: 0, duration: 1.2, ease: 'power4.out', stagger: 0.05 })
        .fromTo('.h-in', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.12 }, '-=0.6');
    }, root);
    return () => ctx.revert();
  }, [ready]);

  return (
    <section id="home" ref={root} className="relative min-h-[100svh] px-6 md:px-16 flex items-center">
      <div className="w-full max-w-7xl mx-auto">
        <div className="md:max-w-[56%] tshadow">
          <h1 className="hero-title text-white" aria-label={`${DATA.firstLine} ${DATA.secondLine}`}>
            <Line text={DATA.firstLine} />
            <Line text={DATA.secondLine} />
          </h1>
          <p className="h-in mt-7 max-w-xl text-lg md:text-xl leading-relaxed text-slate-200">{DATA.intro}</p>
          <div className="h-in mt-9 flex flex-wrap gap-3">
            <a href="#projects" onClick={goTo('projects')} className="btn btn-primary">See my work</a>
            <a href="#contact" onClick={goTo('contact')} className="btn btn-ghost">Get in touch</a>
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-7 flex justify-center">
        <div className="h-in flex flex-col items-center gap-3 text-xs text-slate-300">
          <span>Scroll to leave orbit</span>
          <span className="cue"></span>
        </div>
      </div>
    </section>
  );
}
