'use client';

import { useRef } from 'react';
import type { MouseEvent } from 'react';
import { PROJECTS } from '@/data';
import type { Project } from '@/data';
import { gsap, REDUCED } from '@/lib/motion';
import { useReveal } from '@/hooks/useReveal';
import Heading from './Heading';
import Ext from './Ext';
import SkillChip from './SkillChip';

/* Little CSS planet with an orbiting moon, tinted by the project's hue. */
function Orb({ hue }: { hue: number }) {
  return (
    <div
      className="relative h-full min-h-[9.5rem] overflow-hidden"
      style={{ background: `radial-gradient(90% 120% at 85% -10%, hsl(${hue} 55% 20% / .9), transparent 65%), #060814` }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-24 w-24">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle at 32% 28%, hsl(${hue} 95% 82%), hsl(${hue} 80% 48%) 48%, hsl(${hue} 70% 10%) 100%)`,
              boxShadow: `0 0 60px hsl(${hue} 90% 55% / .4)`
            }}
          ></div>
          <div
            className="absolute left-1/2 top-1/2"
            style={{ width: '11rem', height: '11rem', marginLeft: '-5.5rem', marginTop: '-5.5rem', transform: 'rotate(-18deg) scaleY(.3)' }}
          >
            <div className="orbit relative h-full w-full rounded-full border border-white/25">
              <i className="absolute -top-1 left-1/2 -ml-1 h-2 w-2 rounded-full bg-white"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ p, i }: { p: Project; i: number }) {
  const ref = useRef<HTMLElement>(null);
  const feat = !!p.featured;

  const move = (e: MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--gx', (x + 0.5) * 100 + '%');
    el.style.setProperty('--gy', (y + 0.5) * 100 + '%');
    if (!REDUCED) gsap.to(el, { rotateY: x * 8, rotateX: -y * 8, transformPerspective: 900, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
  };
  const leave = () => {
    if (ref.current) gsap.to(ref.current, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'elastic.out(1,0.6)', overwrite: 'auto' });
  };

  return (
    <div data-reveal="" data-delay={i * 0.08} className={feat ? 'md:col-span-2' : ''}>
      <article
        ref={ref}
        onMouseMove={move}
        onMouseLeave={leave}
        className={'glass glowcard h-full overflow-hidden rounded-3xl flex flex-col ' + (feat ? 'md:flex-row' : '')}
      >
        <div className={feat ? 'md:w-[38%] shrink-0' : 'h-40 shrink-0'}><Orb hue={p.hue} /></div>
        <div className="flex flex-1 flex-col p-6 md:p-8">
          <p className="text-sm text-slate-400">{p.kind}</p>
          <h3 className={'mt-1 font-display font-medium text-white ' + (feat ? 'text-2xl md:text-3xl' : 'text-xl')}>{p.title}</h3>
          <p className={'mt-3 leading-relaxed text-slate-300 ' + (feat ? 'max-w-xl text-base' : 'text-[0.95rem]')}>{p.desc}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {p.tags.map((t) => <SkillChip key={t} name={t} />)}
          </div>
          {(p.live || p.code) && (
            <div className="mt-auto flex gap-5 pt-6 text-sm font-medium">
              {p.live && <Ext href={p.live} className="accent-text underline underline-offset-4 decoration-1">Live site</Ext>}
              {p.code && <Ext href={p.code} className="text-slate-200 underline underline-offset-4 decoration-1 decoration-white/30 hover:decoration-white">Source code</Ext>}
            </div>
          )}
        </div>
      </article>
    </div>
  );
}

export default function Projects() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section id="projects" ref={ref} className="relative min-h-[100svh] px-6 md:px-16 py-28">
      <div className="w-full max-w-7xl mx-auto">
        <Heading title="Selected projects" blurb="Personal and class projects, from a mobile app to a full-stack LAMP application." />
        <div className="grid gap-5 md:grid-cols-2">
          {PROJECTS.map((p, i) => <ProjectCard key={p.title} p={p} i={i} />)}
        </div>
      </div>
    </section>
  );
}
