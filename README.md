# Rithin K Varghese | rk-studio portfolio

An interactive portfolio for **Rithin K Varghese**, a freelance web developer in Kerala, India (rk-studio).
It opens with a scrolling-text intro, then a 3D wireframe globe that reacts to scroll, with a full-screen
panel for selected work, services, process and contact.

**Live site:** _add your deployed link here_

## Features

- Intro sequence with a marquee, a "WEB-developer" screen and a slot-machine "RK-studio" reveal
- 3D globe, particles, orbit path and shooting stars (React Three Fiber), driven by scroll
- "View work" panel: projects, services, process, testimonials and a contact call to action
- Works on desktop and phones: mouse wheel, tap, swipe up, or keyboard (Enter, Space, Arrow Down) to move through the intro
- Keyboard-friendly panel (focus stays inside, Esc closes) and respects the reduced-motion setting
- Page title, description, favicon and link-preview (Open Graph) tags in `index.html`

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · Framer Motion · Three.js with React Three Fiber and Drei

## Getting started

Requires Node.js 20.19 or newer (or 22.12 or newer), as required by Vite 7.

```bash
npm install
npm run dev        # start the dev server
npm run build      # type-check and build into dist/
npm run preview    # serve the production build locally
```

## Editing your content

| What | Where |
| --- | --- |
| Projects, services, process steps, testimonials, booking link, email and social links in the panel | `src/sections/data.ts` |
| Hero text, the About section and the footer links (including Instagram) | `src/Globe.tsx` |
| Intro screens | `src/App.tsx` |
| Page title, description, link-preview tags, fonts | `index.html` |
| Favicon and link-preview image | `public/favicon.svg`, `public/og-image.png` |

Notes:

- The three projects in `data.ts` are labelled **Concept**. Replace them with your own work, and add screenshots by
  putting images in `public/projects/` and setting `image: '/projects/name.jpg'` on a project.
- The Testimonials section stays hidden until you add real entries to `testimonials`.
- The "Book a call" button appears once you set `BOOKING_URL` in `data.ts`.

## Deploying

The site is a static build, so any static host works. On Vercel or Netlify use:

- Build command: `npm run build`
- Output directory: `dist`

After deploying, open `index.html`, uncomment the three tags in the "AFTER YOU DEPLOY" comment, and replace
`YOUR-SITE-ADDRESS` with your real address so WhatsApp, LinkedIn and X show the preview image.

## Project structure

```
index.html            page title, meta tags, fonts
public/               favicon and link-preview image
src/
  App.tsx             intro screens and how visitors move through them
  Globe.tsx           3D scene, hero, About and footer
  Stars.tsx           star field and mouse trail
  SlotMachineText.tsx slot-machine letter animation
  useIsTouch.ts       detects touch screens
  sections/           the "View work" panel (Work, Services, Process, Testimonials, Contact)
    data.ts           the content shown in the panel
```

## Contact

rithink604@gmail.com · [LinkedIn](https://www.linkedin.com/in/rithin-k-varghese/) · [GitHub](https://github.com/rkv6)
