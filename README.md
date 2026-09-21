# Solar System Portfolio (Next.js + TypeScript)

Next.js (App Router), React, TypeScript, Three.js, GSAP and Tailwind CSS.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run start        # serve the production build
npm run typecheck    # TypeScript check without building
```

Needs Node 20.9 or newer. The first `dev` or `build` needs an internet connection because
`next/font` downloads the Google Fonts (Unbounded and Instrument Sans) and self-hosts them.

## Where to edit

| I want to change...                          | Edit this file                             |
| -------------------------------------------- | ------------------------------------------ |
| Name, intro, email, socials                  | `src/data.ts` (`DATA`)                     |
| Skills                                       | `src/data.ts` (`SKILLS`)                   |
| Skill icons and their colours                | `src/lib/skillIcons.ts`                    |
| Experience                                   | `src/data.ts` (`JOBS`)                     |
| Projects and their links                     | `src/data.ts` (`PROJECTS`)                 |
| Section labels, accent colours, planet names | `src/data.ts` (`SECTIONS`)                 |
| Which planet each section flies to           | `src/three/createSolarSystem.ts` (`FOCUS`) |
| Planet sizes, orbit distances, speeds        | `src/three/createSolarSystem.ts` (`DEFS`)  |
| Layout and wording of a section              | `src/components/<Section>.tsx`             |
| Page title, description, link preview        | `src/app/layout.tsx` (`metadata`)          |
| Fonts                                        | `src/app/layout.tsx` + `tailwind.config.ts` |
| Global styles, glass panels, timeline        | `src/app/globals.css`                      |
| Tab icon                                     | `src/app/icon.svg`                         |

## Structure

```
src/
  app/
    layout.tsx        fonts, metadata, <html>
    page.tsx          renders <Portfolio />
    globals.css       Tailwind + custom CSS
    icon.svg          favicon
  components/
    Portfolio.tsx     client component: loads the 3D scene, wires scroll -> camera
    Header, SideNav, Hud, Loader, Hero, Skills, Experience, Projects, Contact
  three/createSolarSystem.ts   the whole 3D scene
  hooks/                       useReveal, useIsoLayoutEffect
  lib/motion.ts                GSAP setup, goTo()
  data.ts                      all editable content, plus its types
```

## How it works with Next.js

- Every component that uses hooks, GSAP or the browser is a client component.
  Next still renders their HTML on the server, so your name, experience and projects
  are in the page source for search engines and link previews.
- Three.js is loaded with a dynamic `import()` inside `Portfolio.tsx`, so it only runs in
  the browser and is split into its own file that downloads after the page appears.
- With JavaScript turned off, a `<noscript>` rule hides the loader and shows the text.

## Notes

- `three` is pinned to **0.128.0** (with `@types/three` 0.128.0). Newer versions changed lighting
  units and colour-management APIs, so the planets would look different until retuned.
- Skill icons come from `react-icons`. To add a skill, put its name in `SKILLS` (`src/data.ts`) and add a matching
  line in `src/lib/skillIcons.ts`. A skill with no entry shows a generic package icon.
- Tailwind is v3 on purpose. v4 uses a different config and reset.
- The contact form has no backend. It opens the visitor's mail app (`mailto:`).
- After deploying, add `metadataBase: new URL('https://your-domain.com')` to `metadata` in
  `layout.tsx` so link previews use absolute URLs.

## Deploy

Push to GitHub and import the repo on Vercel. No settings need to change.
