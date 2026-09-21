'use client';

import { SECTIONS, DATA } from '@/data';
import { goTo } from '@/lib/motion';

export default function Header({ active }: { active: number }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 header-pad px-5 md:px-10 flex items-center justify-between pointer-events-none">
      <a href="#home" onClick={goTo('home')} className="pointer-events-auto flex items-center gap-3">
        <span className="sun-dot block h-6 w-6 rounded-full"></span>
        <span className="font-display text-sm font-medium tracking-tight text-white">{DATA.name}</span>
      </a>
      <nav className="hidden md:flex pointer-events-auto glass rounded-full p-1.5 gap-1" aria-label="Sections">
        {SECTIONS.map((s, i) => (
          <a key={s.id} href={'#' + s.id} onClick={goTo(s.id)} className={'nav-link ' + (i === active ? 'is-active' : '')}>
            {s.label}
          </a>
        ))}
      </nav>
      <a href="#contact" onClick={goTo('contact')} className="md:hidden pointer-events-auto glass rounded-full px-4 py-2 text-sm text-white">
        Contact
      </a>
    </header>
  );
}
