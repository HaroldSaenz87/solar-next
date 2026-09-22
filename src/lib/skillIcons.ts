import type { IconType } from 'react-icons';
import {
  SiC, SiDocker, SiExpo, SiExpress, SiGit, SiGithub, SiGreensock, SiHtml5, SiJavascript,
  SiKubernetes, SiMongodb, SiMysql, SiNestjs, SiNextdotjs, SiNginx, SiNodedotjs, SiPhp,
  SiPostgresql, SiPython, SiReact, SiTailwindcss, SiTurborepo, SiTypescript
} from 'react-icons/si';
import { FaDatabase, FaJava } from 'react-icons/fa';
import { TbApi, TbBrandCss3, TbBrandReactNative, TbPackage } from 'react-icons/tb';

export interface IconSpec { icon: IconType; color: string }

/* Icon and colour for each skill, keyed by the exact name used in SKILLS (src/data.ts).
   Colours are the brand colours, lightened where the brand colour is too dark to see on a dark page.
   A skill can have several icons (see HTML/CSS). Skills with no entry get FALLBACK. */
const LIGHT = '#f1f5f9';
const MUTED = '#94a3b8';

export const FALLBACK: IconSpec = { icon: TbPackage, color: MUTED };

export const SKILL_ICONS: Record<string, IconSpec[]> = {
  // Languages
  'Java':        [{ icon: FaJava,       color: '#f89820' }],
  'C':           [{ icon: SiC,          color: '#a8b9cc' }],
  'Python':      [{ icon: SiPython,     color: '#3776ab' }],
  'JavaScript':  [{ icon: SiJavascript, color: '#f7df1e' }],
  'TypeScript':  [{ icon: SiTypescript, color: '#3178c6' }],
  'PHP':         [{ icon: SiPhp,        color: '#777bb4' }],
  'SQL':         [{ icon: FaDatabase,   color: MUTED }],
  'HTML/CSS':    [{ icon: SiHtml5,      color: '#e34f26' }, { icon: TbBrandCss3, color: '#2d8fe0' }],
  'CSS':    [{ icon: TbBrandCss3, color: '#2d8fe0' }],

  // Frameworks and libraries
  'React':        [{ icon: SiReact,           color: '#61dafb' }],
  'React Native': [{ icon: TbBrandReactNative, color: '#61dafb' }],
  'Next.js':      [{ icon: SiNextdotjs,       color: LIGHT }],
  'NestJS':       [{ icon: SiNestjs,          color: '#e0234e' }],
  'Node.js':      [{ icon: SiNodedotjs,       color: '#5fa04e' }],
  'Express':      [{ icon: SiExpress,         color: LIGHT }],
  'Zustand':      [{ icon: TbPackage,         color: '#c08a5a' }],
  'GSAP':         [{ icon: SiGreensock,       color: '#88ce02' }],
  'Tailwind CSS': [{ icon: SiTailwindcss,     color: '#06b6d4' }],

  // Infrastructure and DevOps
  'Docker':     [{ icon: SiDocker,     color: '#2496ed' }],
  'Kubernetes': [{ icon: SiKubernetes, color: '#4f86f0' }],
  'NGINX':      [{ icon: SiNginx,      color: '#10b04e' }],
  'Turborepo':  [{ icon: SiTurborepo,  color: '#ff1e56' }],
  'Git':        [{ icon: SiGit,        color: '#f05033' }],
  'GitHub':     [{ icon: SiGithub,     color: LIGHT }],

  // Databases and tools
  'PostgreSQL': [{ icon: SiPostgresql, color: '#5b82ea' }],
  'MongoDB':    [{ icon: SiMongodb,    color: '#4fb350' }],
  'MySQL':      [{ icon: SiMysql,      color: '#5b9bc7' }],
  'REST APIs':  [{ icon: TbApi,        color: MUTED }],
  'Expo':       [{ icon: SiExpo,       color: LIGHT }]
};
