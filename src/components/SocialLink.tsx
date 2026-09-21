import type { CSSProperties } from 'react';
import type { IconType } from 'react-icons';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { TbLink } from 'react-icons/tb';
import type { Social } from '@/data';

/* Icon and colour for each social link, keyed by its `label` in DATA.socials. */
const SOCIAL_ICONS: Record<string, { icon: IconType; color: string }> = {
  GitHub:   { icon: FaGithub,   color: '#f1f5f9' },
  LinkedIn: { icon: FaLinkedin, color: '#4a9de8' },
  X:        { icon: FaXTwitter, color: '#f1f5f9' }
};
const FALLBACK = { icon: TbLink, color: '#94a3b8' };

export default function SocialLink({ label, href }: Social) {
  const { icon: Icon, color } = SOCIAL_ICONS[label] ?? FALLBACK;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="skill skill-lg"
      style={{ '--c': color } as CSSProperties}
    >
      <Icon size={18} color={color} aria-hidden="true" />
      {label}
    </a>
  );
}
