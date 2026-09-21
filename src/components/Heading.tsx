interface HeadingProps {
  title: string;
  blurb?: string;
}

export default function Heading({ title, blurb }: HeadingProps) {
  return (
    <div className="mb-8 md:mb-12 tshadow">
      <h2 data-mask="" className="overflow-hidden pb-2 font-display text-3xl md:text-5xl font-medium tracking-tight text-white">
        <span className="block">{title}</span>
      </h2>
      {blurb && (
        <p data-reveal="" className="mt-4 max-w-md text-base md:text-lg leading-relaxed text-slate-200/90">{blurb}</p>
      )}
    </div>
  );
}
