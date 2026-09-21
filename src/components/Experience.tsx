'use client';

import { useRef } from 'react';
import { JOBS } from '@/data';
import { gsap } from '@/lib/motion';
import { useReveal } from '@/hooks/useReveal';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import Heading from './Heading';

export default function Experience() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  /* Timeline: the line draws and the marker travels as you scroll (scrub); each entry pops in when reached. */
  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      const timeline = root.querySelector('.tl');
      const fill = root.querySelector('.tl-fill');
      const ship = root.querySelector('.tl-ship');
      if (!timeline || !fill || !ship) return;

      const st = { trigger: timeline, start: 'top 62%', end: 'bottom 62%', scrub: 0.6 };
      gsap.fromTo(fill, { scaleY: 0, transformOrigin: 'top center' }, { scaleY: 1, ease: 'none', scrollTrigger: st });
      gsap.fromTo(ship, { top: '0%' }, { top: '100%', ease: 'none', scrollTrigger: st });

      root.querySelectorAll<HTMLElement>('[data-job]').forEach((item) => {
        const t = gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 72%' } });
        t.from(item.querySelector('.tl-node'), { scale: 0, duration: 0.5, ease: 'back.out(3)' })
          .from(item.querySelector('[data-body]'), { x: 60, opacity: 0, duration: 0.9, ease: 'power3.out' }, '<0.1');
        const bullets = item.querySelectorAll('li');
        if (bullets.length) t.from(bullets, { x: 24, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }, '-=0.5');
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="experience" ref={ref} className="relative min-h-[100svh] px-6 md:px-16 py-28 flex items-center">
      <div className="w-full max-w-7xl mx-auto">
        <div className="md:ml-auto md:w-[62%]">
          <Heading title="Experience" />
          <div className="glass rounded-3xl p-6 md:p-10">
            <div className="tl">
              <div className="tl-line"></div>
              <div className="tl-fill"></div>
              <div className="tl-ship"></div>
              {JOBS.map((j, i) => (
                <article key={j.company} data-job="" className={'relative ' + (i < JOBS.length - 1 ? 'pb-12' : '')}>
                  <span className="tl-node"></span>
                  <div data-body="">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h3 className="font-display text-base md:text-lg font-medium text-white">{j.role}</h3>
                      <span className="num accent-text text-sm font-medium">{j.period}</span>
                    </div>
                    <p className="mt-1 text-slate-300">{j.company}{j.place ? ', ' + j.place : ''}</p>
                    {j.points.length > 0 && (
                      <ul className="mt-4 space-y-2 text-[0.95rem] leading-relaxed text-slate-300/95">
                        {j.points.map((p, k) => (
                          <li key={k} className="flex gap-3">
                            <span className="accent-bg mt-[0.6rem] h-1 w-1 shrink-0 rounded-full"></span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {j.stack.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {j.stack.map((t) => <span key={t} className="chip">{t}</span>)}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
