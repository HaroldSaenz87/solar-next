# Third Portfolio

The personal portfolio of **Harold Saenz**, where scrolling is a tour of the solar system. Each section flies a 3D camera to a different planet: the hero sits at the Sun, skills on Earth, experience on Mars, projects on Jupiter and contact on Saturn.

Built with Next.js, TypeScript, Three.js, GSAP and Tailwind CSS.

## Features

- **Interactive 3D solar system.** Eight planets on their orbits, an asteroid belt, Earth's moon and Saturn's rings, drawn with Three.js. Every planet texture is generated in code, so there are no image files to download.
- **Scroll-driven camera.** GSAP ScrollTrigger flies the camera between planets as you scroll. The page accent color changes with each planet.
- **GSAP animations.** A letter-by-letter hero title, scroll-triggered reveals, skill chips that pop in, and an experience timeline that draws itself as you scroll.
- **Brand icons on every technology** in the skills section and on the project cards.
- **Fast and searchable.** Content is rendered on the server, and Three.js loads only in the browser, after the page appears.
- **Responsive and accessible.** Works on phones and desktops, has visible keyboard focus, and respects the reduced-motion setting.
- **Contact form without a backend.** It opens the visitor's mail app with the message filled in.

## Tech stack

| Area       | Tools                                                         |
| ---------- | ------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router), React 19, TypeScript                 |
| 3D         | Three.js 0.128                                                |
| Animation  | GSAP with ScrollTrigger and ScrollToPlugin                    |
| Styling    | Tailwind CSS 3                                                |
| Icons      | react-icons                                                   |
| Fonts      | Unbounded and Instrument Sans, self-hosted through `next/font` |

## Getting started

You need Node.js 20.9 or newer.

```bash
git clone https://github.com/YOUR-USERNAME/Third-Portfolio.git
cd Third-Portfolio
npm install
npm run dev
```

Then open http://localhost:3000. The first `dev` or `build` needs an internet connection, because Next downloads the Google Fonts and self-hosts them.

### Scripts

| Command             | What it does                        |
| ------------------- | ----------------------------------- |
| `npm run dev`       | Start the development server        |
| `npm run build`     | Create a production build           |
| `npm run start`     | Serve the production build          |
| `npm run typecheck` | Check TypeScript without building   |

## Project structure

```
src/
  app/
    layout.tsx        fonts, metadata, <html>
    page.tsx          renders <Portfolio />
    globals.css       Tailwind and custom CSS
    icon.svg          favicon
  components/
    Portfolio.tsx     client component: loads the 3D scene, ties scrolling to the camera
    Header, SideNav, Hud, Loader, Hero, Skills, Experience, Projects, Contact
  three/createSolarSystem.ts   the whole 3D scene
  hooks/                       useReveal, useIsoLayoutEffect
  lib/
    motion.ts                  GSAP setup and smooth scrolling
    skillIcons.ts              icon and color for each skill
  data.ts                      all content (name, skills, experience, projects)
```

## Customizing

- **Content:** everything on the page comes from `src/data.ts`.
- **Skill icons:** add a skill name to `SKILLS` in `src/data.ts`, then add a matching line in `src/lib/skillIcons.ts`. A skill with no entry shows a generic package icon.
- **Planets and camera:** planet sizes and orbits are in `DEFS`, and the planet each section flies to is in `FOCUS`, both in `src/three/createSolarSystem.ts`.

## How it works

- Every component that uses hooks, GSAP or the browser is a client component. Next still renders their HTML on the server, so the text is in the page source for search engines and link previews.
- Three.js is loaded with a dynamic `import()` in `Portfolio.tsx`. It only runs in the browser and downloads as its own file.
- With JavaScript turned off, a `<noscript>` rule hides the loader and shows the text.

## Notes

- `three` is pinned to **0.128.0**, with `@types/three` 0.128.0. Newer versions changed lighting units and color management, so the planets would look different until retuned.
- Tailwind is on v3 on purpose. v4 uses a different config and reset.
