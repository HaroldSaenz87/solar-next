'use client';

import { SECTIONS } from '@/data';
import { goTo } from '@/lib/motion';

export default function SideNav({ active }: { active: number }) {
  return (
    <nav className="fixed right-4 md:right-7 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-5" aria-label="Section dots">
      {SECTIONS.map((s, i) => (
        <a key={s.id} href={'#' + s.id} onClick={goTo(s.id)} aria-label={s.label} className="group relative flex items-center justify-end">
          <span className="pointer-events-none absolute right-6 hidden md:block whitespace-nowrap rounded-full glass px-3 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
            {s.label}
          </span>
          <span className={'dot ' + (i === active ? 'is-active' : '')}></span>
        </a>
      ))}
    </nav>
  );
}
