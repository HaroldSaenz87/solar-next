'use client';

import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { TbDownload } from 'react-icons/tb';
import { gsap, REDUCED } from '@/lib/motion';

interface ResumeButtonProps {
  href?: string;      // the PDF lives in /public
  filename?: string;  // name the visitor's download gets
  label?: string;
}

/* A download button with two "satellites" orbiting its border.
   Hover: the satellites speed up and the button leans toward the cursor.
   Click: the arrow lands, a signal ring pings and stardust bursts out while the PDF downloads. */
export default function ResumeButton({
  href = '/Harold_Saenz_Resume.pdf',
  filename = 'Harold_Saenz_Resume.pdf',
  label = 'Download resume'
}: ResumeButtonProps) {
  const root = useRef<HTMLAnchorElement>(null);
  const rect = useRef<SVGRectElement>(null);
  const icon = useRef<HTMLSpanElement>(null);
  const ring = useRef<HTMLSpanElement>(null);
  const burst = useRef<HTMLSpanElement>(null);
  const orbit = useRef<gsap.core.Tween | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [busy, setBusy] = useState(false);

  /* Keep the SVG border the same size as the button */
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const measure = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* The orbit: slide the dashes along the border forever */
  const measured = size.w > 0;
  useEffect(() => {
    const r = rect.current;
    if (!r || !measured) return;
    if (REDUCED) {
      gsap.set(r, { strokeDashoffset: -12 });
      return;
    }
    const t = gsap.fromTo(r, { strokeDashoffset: 0 }, { strokeDashoffset: -100, duration: 5, ease: 'none', repeat: -1 });
    orbit.current = t;
    return () => { t.kill(); orbit.current = null; };
  }, [measured]);

  const enter = () => {
    if (orbit.current) gsap.to(orbit.current, { timeScale: 4, duration: 0.4 });
  };
  const move = (e: PointerEvent<HTMLAnchorElement>) => {
    const el = root.current;
    if (!el || REDUCED) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
    const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
    gsap.to(el, { x: dx * 14, y: dy * 10, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
  };
  const leave = () => {
    if (orbit.current) gsap.to(orbit.current, { timeScale: 1, duration: 0.6 });
    if (root.current) gsap.to(root.current, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1,0.5)', overwrite: 'auto' });
  };

  /* The link itself starts the download. This only plays the animation. */
  const click = () => {
    if (busy) return;
    setBusy(true);
    window.setTimeout(() => setBusy(false), 2200);
    if (REDUCED || !icon.current || !ring.current || !burst.current) return;

    gsap.timeline()
      .to(icon.current, { y: 20, opacity: 0, duration: 0.22, ease: 'power2.in' })
      .set(icon.current, { y: -20 })
      .to(icon.current, { y: 0, opacity: 1, duration: 0.7, ease: 'bounce.out' });

    gsap.fromTo(ring.current, { scale: 0.92, opacity: 0.8 }, { scale: 1.6, opacity: 0, duration: 0.9, ease: 'power2.out' });

    const dots = Array.from(burst.current.children);
    gsap.fromTo(
      dots,
      { x: 0, y: 0, scale: 1.2, opacity: 1 },
      {
        x: (i: number) => Math.cos((i / dots.length) * Math.PI * 2) * (26 + Math.random() * 22),
        y: (i: number) => Math.sin((i / dots.length) * Math.PI * 2) * (26 + Math.random() * 22),
        scale: 0, opacity: 0, duration: 0.9, ease: 'power2.out'
      }
    );
  };

  return (
    <a
      ref={root}
      href={href}
      download={filename}
      onClick={click}
      onPointerEnter={enter}
      onPointerMove={move}
      onPointerLeave={leave}
      aria-label="Download resume (PDF)"
      className="resume-btn relative inline-flex min-w-[11.5rem] items-center justify-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-semibold text-white"
    >
      {measured && (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-visible"
          width={size.w}
          height={size.h}
          viewBox={`0 0 ${size.w} ${size.h}`}
          style={{ filter: 'drop-shadow(0 0 5px var(--accent))' }}
        >
          <rect
            ref={rect}
            x={1} y={1}
            width={size.w - 2} height={size.h - 2}
            rx={(size.h - 2) / 2}
            pathLength={100}
            fill="none"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray="10 40"
            style={{ stroke: 'var(--accent)' }}
          />
        </svg>
      )}
      <span ref={ring} className="resume-ring" aria-hidden="true"></span>
      <span ref={icon} className="resume-icon relative inline-flex"><TbDownload size={18} aria-hidden="true" /></span>
      <span className="relative">{busy ? 'Downloading…' : label}</span>
      <span ref={burst} className="pointer-events-none absolute left-[2.15rem] top-1/2" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, i) => (
          <i key={i} className="accent-bg absolute -ml-[2px] -mt-[2px] block h-1 w-1 rounded-full opacity-0"></i>
        ))}
      </span>
    </a>
  );
}
