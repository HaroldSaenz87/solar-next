'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/motion';

import type { SolarSystem } from '@/three/createSolarSystem';

import Header from './Header';
import SideNav from './SideNav';
import Hud from './Hud';
import Loader from './Loader';
import Hero from './Hero';
import Skills from './Skills';
import Projects from './Projects';
import Contact from './Contact';
import { SectionId, SECTIONS } from '@/data';
import Experience from './Experience';

export default function Portfolio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<SolarSystem | null>(null);
  const activeId = useRef<SectionId>('home');
  const loaderRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [loaderGone, setLoaderGone] = useState(false);
  const [active, setActive] = useState(0);

  /* 1. Build the 3D scene. Three.js is loaded on demand so it never runs on the server
        and stays out of the first JavaScript download. */
  useEffect(() => {
    let cancelled = false;
    let scene: SolarSystem | null = null;

    import('@/three/createSolarSystem')
      .then(({ createSolarSystem }) => {
        if (cancelled || !canvasRef.current) return;
        scene = createSolarSystem(canvasRef.current, {
          onProgress: setProgress,
          onReady: () => setReady(true)
        });
        sceneRef.current = scene;
        scene.focus(activeId.current); // in case the page was already scrolled
      })
      .catch((err: unknown) => {
        console.error('Could not start the 3D scene', err);
        setReady(true);
      });

    return () => {
      cancelled = true;
      sceneRef.current = null;
      if (scene) scene.dispose();
    };
  }, []);

  /* 2. Fade the loader out once the scene is ready */
  useEffect(() => {
    if (!ready || !loaderRef.current) return;
    gsap.to(loaderRef.current, { opacity: 0, duration: 0.9, ease: 'power2.out', onComplete: () => setLoaderGone(true) });
    ScrollTrigger.refresh();
  }, [ready]);

  /* 3. Scrolling drives the camera: each section flies to its planet */
  useEffect(() => {
    gsap.set(barRef.current, { scaleX: 0, transformOrigin: 'left center' });

    const ctx = gsap.context(() => {
      SECTIONS.forEach((s, i) => {
        ScrollTrigger.create({
          trigger: '#' + s.id,
          start: 'top 50%',
          end: 'bottom 50%',
          onToggle: (self) => {
            if (!self.isActive) return;
            activeId.current = s.id;
            setActive(i);
            document.documentElement.style.setProperty('--accent', s.color);
            sceneRef.current?.focus(s.id);
          }
        });
      });
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          gsap.set(barRef.current, { scaleX: self.progress });
          sceneRef.current?.setScrollVelocity(self.getVelocity());
        }
      });
    });

    /* Recalculate scroll positions once fonts and layout have settled */
    const refresh = () => ScrollTrigger.refresh();
    const timers = [300, 1200].map((t) => window.setTimeout(refresh, t));
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh);

    return () => {
      ctx.revert();
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener('load', refresh);
    };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} className="fixed inset-0 h-full w-full" aria-hidden="true"></canvas>
      <div className="veil pointer-events-none fixed inset-0 z-[1]"></div>
      <div ref={barRef} className="accent-bg fixed inset-x-0 top-0 z-[60] h-[2px]"></div>

      <Header active={active} />
      <SideNav active={active} />
      <Hud active={active} />

      <main className="relative z-10">
        <Hero ready={ready} />
        <Skills />
        <Experience />
        <Projects />
        <Contact />
      </main>

      {!loaderGone && <Loader ref={loaderRef} progress={progress} />}
    </div>
  );
}
