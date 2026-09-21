/* All portfolio content lives here. Edit freely. */

export interface Social { label: string; href: string }

export const DATA = {
  name: 'Harold Saenz',
  firstLine: 'Curious',
  secondLine: 'by design',
  intro: 'Aspiring software engineer and UCF computer science student focused on websites, mobile apps, machine learning and AI. I want to know how it all works.',
  email: 'joshu4nick19@gmail.com',
  socials: [
    { label: 'GitHub', href: 'https://github.com/HaroldSaenz87' },
    { label: 'LinkedIn', href: 'www.linkedin.com/in/harold-saenz-29250517a' }
  ] as Social[]
};

/* Each section flies the camera to a planet. */
export type SectionId = 'home' | 'skills' | 'experience' | 'projects' | 'contact';

export interface Section {
  id: SectionId;
  label: string;   // nav text
  body: string;    // planet name shown in the "now orbiting" readout
  au: string;
  fact: string;
  color: string;   // accent colour while this section is active
}

export const SECTIONS: Section[] = [
  { id: 'home',       label: 'Home',        body: 'The Sun',  au: '0.00', fact: 'A G-type star at 5,778 K',         color: '#ffb547' },
  { id: 'skills',     label: 'Tech skills', body: 'Earth',    au: '1.00', fact: 'Home base, with one moon',         color: '#5ec2ff' },
  { id: 'experience', label: 'Experience',  body: 'Mars',     au: '1.52', fact: 'Home to Olympus Mons, 22 km high', color: '#ff6b3d' },
  { id: 'projects',   label: 'Projects',    body: 'Jupiter',  au: '5.20', fact: 'The Great Red Spot storm',         color: '#e7b27c' },
  { id: 'contact',    label: 'Contact',     body: 'Saturn',   au: '9.54', fact: 'Rings span about 280,000 km',      color: '#f2dc9a' }
];

/* Grouped exactly as on the resume. */
export interface SkillGroup { title: string; items: string[] }

export const SKILLS: SkillGroup[] = [
  { title: 'Languages',                items: ['Java', 'C', 'JavaScript', 'TypeScript', 'PHP', 'SQL', 'HTML/CSS'] },
  { title: 'Frameworks and libraries', items: ['React', 'React Native', 'Next.js', 'NestJS', 'Node.js', 'Express', 'Zustand', 'GSAP', 'Tailwind CSS'] },
  { title: 'Infrastructure and DevOps', items: ['Docker', 'Kubernetes', 'NGINX', 'Turborepo', 'Git', 'GitHub'] },
  { title: 'Databases and tools',      items: ['PostgreSQL', 'MongoDB', 'MySQL', 'REST APIs', 'Expo'] }
];

/* Experience, newest first. `points` and `stack` can be empty. */
export interface Job {
  role: string;
  company: string;
  place?: string;
  period: string;
  points: string[];
  stack: string[];
}

export const JOBS: Job[] = [
  {
    role: 'Software Engineering Intern',
    company: 'Global Radio Outreach (GRO)',
    place: 'Remote',
    period: 'May 2026 \u2013 Present',
    points: [
      'Contributing to the full-stack modernization of a multilingual missions CMS, built as a Turborepo monorepo with a Next.js dashboard, a Next.js seeker-facing frontend and a NestJS/Express API.',
      'Building React components and custom hooks for the dashboard and the seeker-facing site, turning UX/UI mockups into production Next.js components styled with Tailwind CSS.',
      'Integrating i18n utilities and configuring NGINX for multilingual routing across seeker-facing locales.',
      'Working in a multi-container Docker and Kubernetes setup where each language runs as its own container built from a shared codebase, so features stay consistent across locales.',
      'Adding Plausible and Umami analytics to track engagement across locales, and helping move the backend from MongoDB to PostgreSQL.'
    ],
    stack: ['Next.js', 'NestJS', 'Turborepo', 'Docker', 'Kubernetes', 'NGINX', 'Tailwind CSS']
  },
  {
    role: 'Frontend Developer Intern',
    company: 'IPMD',
    period: 'Aug 2026 \u2013 Present',
    points: [
      'Supporting front-end development for IPMD\u2019s emotion-AI products, including EchoAI, Emotion Sphere, FineArts and the XR Virtual Gallery. These platforms are built to support people with intellectual disabilities.',
      'Building user-facing features and improving UI/UX on production products used by real users.',
      'Integrating APIs and contributing to the stability and scalability of the platforms.',
      'Working directly with senior engineers and leadership in a fast-paced team.'
    ],
    stack: []
  },
];

/* Leave live/code empty to hide a link. Add your URLs when you have them. */
export interface Project {
  title: string;
  kind: string;
  hue: number;          // 0-360, tints the little planet on the card
  featured?: boolean;   // the featured project gets the wide card
  desc: string;
  tags: string[];
  live?: string;
  code?: string;
}

export const PROJECTS: Project[] = [
  {
    title: 'BookDrop',
    kind: 'Personal project, May 2026',
    hue: 210,
    featured: true,
    desc: 'A cross-platform social discovery app. Zustand keeps authentication and sessions in sync, and cursor-based pagination behind an infinite community feed cut the initial data payload by 60%. A custom layer on the React Native Animated API keeps the UI smooth during slow API calls, and JWT auth with encrypted local storage keeps users signed in across screens.',
    tags: ['React Native', 'Expo', 'TypeScript', 'Zustand', 'Node.js', 'MongoDB'],
    live: '',
    code: 'https://github.com/HaroldSaenz87/BookDrop'
  },
  {
    title: 'LesChic',
    kind: 'Team project, April 2026',
    hue: 320,
    desc: 'A luxury wardrobe manager. I built cinematic interactions with GSAP ScrollTriggers and SVG masking, led an optimistic UI strategy so large asset libraries feel instant, and wrote a recursive transform that normalizes color metadata for faster, more accurate filters.',
    tags: ['React', 'TypeScript', 'GSAP', 'Tailwind CSS', 'Node.js', 'MongoDB'],
    live: '',
    code: 'https://github.com/HaroldSaenz87/LesChic'
  },
  {
    title: 'SeaYourContacts',
    kind: 'Class project, February 2026',
    hue: 160,
    desc: 'A LAMP-stack contact manager built with an Agile team. Normalized SQL schemas handle concurrent CRUD operations, a client-side search filters contacts without extra server calls, and a CSS Grid and Flexbox layout holds up on mobile and desktop.',
    tags: ['JavaScript', 'PHP', 'MySQL', 'CSS'],
    live: '',
    code: 'https://github.com/HaroldSaenz87/SeaYourContacts'
  }
];
