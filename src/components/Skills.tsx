'use client';

import { useRef } from 'react';
import { SKILLS } from '@/data';
import { gsap } from '@/lib/motion';
import { useReveal } from '@/hooks/useReveal';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import Heading from './Heading';
import SkillChip from './SkillChip';

export default function Skills() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  /* Each group's chips pop in one after another when the group scrolls into view. */
  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>('[data-chips]').forEach((group) => {
        gsap.from(group.children, {
          opacity: 0, scale: 0.6, y: 12, duration: 0.5, stagger: 0.045, ease: 'back.out(2)',
          scrollTrigger: { trigger: group, start: 'top 90%' }
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="skills" ref={ref} className="relative min-h-[100svh] px-6 md:px-16 py-28 flex items-center">
      <div className="w-full max-w-7xl mx-auto">
        <div className="md:w-[58%]">
          <Heading title="Tech skills" blurb="A working toolkit, built through coursework, projects and internships." />
          <div data-reveal="" className="glass rounded-3xl p-6 md:p-9">
            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-9">
              {SKILLS.map((g) => (
                <div key={g.title}>
                  <h3 className="mb-4 border-b border-white/10 pb-2 font-display text-sm font-medium text-white">{g.title}</h3>
                  <div data-chips="" className="flex flex-wrap gap-2">
                    {g.items.map((s) => <SkillChip key={s} name={s} />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
