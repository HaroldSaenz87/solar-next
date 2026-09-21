import type { ReactNode } from 'react';

interface ExtProps {
  href: string;
  className?: string;
  children: ReactNode;
}

/* External link. A href of "#" is treated as a placeholder and does nothing. */
export default function Ext({ href, className, children }: ExtProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={(e) => { if (href === '#') e.preventDefault(); }}
    >
      {children}
    </a>
  );
}
