import type { CSSProperties } from 'react';
import { SKILL_ICONS, FALLBACK } from '@/lib/skillIcons';

/* A skill pill with its logo(s). The first icon's colour tints the hover state. */
export default function SkillChip({ name }: { name: string }) {
  const specs = SKILL_ICONS[name] ?? [FALLBACK];
  return (
    <span className="skill" style={{ '--c': specs[0].color } as CSSProperties}>
      {specs.map(({ icon: Icon, color }, i) => (
        <Icon key={i} size={16} color={color} aria-hidden="true" />
      ))}
      {name}
    </span>
  );
}
