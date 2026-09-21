import type { Ref } from 'react';

interface LoaderProps {
  progress: number;          // 0 to 1
  ref?: Ref<HTMLDivElement>; // React 19 passes ref as a normal prop
}

export default function Loader({ progress, ref }: LoaderProps) {
  return (
    <div id="loader" ref={ref} className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6" style={{ background: '#02030a' }}>
      <div className="relative h-14 w-14">
        <span className="sun-dot absolute inset-4 rounded-full"></span>
        <span className="orbit absolute inset-0 rounded-full border border-white/15">
          <i className="absolute -top-1 left-1/2 -ml-1 h-2 w-2 rounded-full bg-sky-300"></i>
        </span>
      </div>
      <p className="text-sm text-slate-400">Charting the solar system</p>
      <div className="h-px w-56 overflow-hidden bg-white/10">
        <div className="accent-bg h-full" style={{ width: progress * 100 + '%', transition: 'width .3s' }}></div>
      </div>
    </div>
  );
}
