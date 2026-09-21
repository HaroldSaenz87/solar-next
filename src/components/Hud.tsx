import { SECTIONS } from '@/data';

/* Bottom-left "now orbiting" readout. The key remounts it so the fade-in replays on every change. */
export default function Hud({ active }: { active: number }) {
  const s = SECTIONS[active];
  return (
    <div key={active} className="fixed left-6 md:left-10 bottom-6 z-40 hidden md:block fade-in tshadow" aria-live="polite">
      <div className="flex items-center gap-2 text-xs text-slate-300">
        <span className="accent-bg h-1.5 w-1.5 rounded-full"></span>Now orbiting
      </div>
      <div className="mt-1 font-display text-xl font-medium text-white">{s.body}</div>
      <div className="mt-1 text-xs text-slate-300 num">{s.au} AU from the Sun</div>
      <div className="text-xs text-slate-400">{s.fact}</div>
    </div>
  );
}
