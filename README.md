<h1 align="center">
  <img src="public\og-image.png" width="800" alt="Aphelion">
  <br>
  Aphelion
</h1>

<p align="center">
  <b>Journey the solar system.</b><br>
  A cinematic interactive space experience with 3D tour navigation,<br>
  orbit view, planet facts, and locked quiz challenges.
</p>

<p align="center">
  <a href="https://aphelion.website"><img src="https://img.shields.io/badge/live-aphelion.website-2563eb?style=for-the-badge" alt="Live website"></a>
  <a href="https://github.com/OElhwry/Aphelion/releases/tag/v1.0.2"><img src="https://img.shields.io/badge/version-1.0.2-7c3aed?style=for-the-badge" alt="Version 1.0.2"></a>
  <img src="https://img.shields.io/badge/license-private-525252?style=for-the-badge" alt="Private">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/next.js-14-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js 14">
  <img src="https://img.shields.io/badge/react-18-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 18">
  <img src="https://img.shields.io/badge/typescript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/tailwindcss-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/framer--motion-latest-ff4d9d?style=flat-square&logo=framer&logoColor=white" alt="Framer Motion">
  <img src="https://img.shields.io/badge/three.js-0.169-000000?style=flat-square&logo=threedotjs&logoColor=white" alt="three.js">
</p>

<p align="center">
  <a href="#features">Features</a> ·
  <a href="#tech-stack">Tech stack</a> ·
  <a href="#project-structure">Project structure</a> ·
  <a href="#getting-started">Getting started</a> ·
  <a href="#scripts">Scripts</a> ·
  <a href="#changelog">Changelog</a>
</p>

---

## Features

- **Cinematic intro:** Animated launch sequence into exploration mode.
- **3D tour mode:** Fly through the solar system in 3D — click an unvisited planet to travel to it; click your current planet to open its detail page.
- **Orrery mode:** Solar system orbit map with animated planets and clickable exploration.
- **Planet detail view:** Planet stats, facts, and focused deep-dive pages.
- **Locked quiz system:** Per-planet quiz flow with one-way progression — answers are locked on selection and cannot be changed or revisited.
- **Session persistence:** Navigation state and progress persist across refreshes.
- **Responsive interactions:** Mobile-friendly controls, touch gestures, haptic feedback, and layout tuning.

---

## Tech stack

- **Framework:** Next.js 14 (App Router)
- **UI:** React 18 + Tailwind CSS + Radix UI primitives
- **Animation:** Framer Motion
- **3D / graphics:** three.js + `@react-three/fiber` + `@react-three/drei`
- **Language:** TypeScript

---

## Project structure

```text
Aphelion/
├── app/
│   ├── page.tsx          # Main experience: intro, journey, orrery, planet details, quiz flow
│   ├── layout.tsx        # Root layout + global wrappers
│   └── globals.css       # Global styles
├── components/
│   ├── aphelion-logo.tsx # Brand mark/wordmark component
│   ├── planet-3d.tsx     # 3D planet rendering helpers
│   ├── tour-view.tsx     # Guided 3D journey with cinematic camera flight
│   └── ui/               # Reusable UI primitives
├── hooks/
│   └── use-mobile.ts     # Mobile breakpoint helper
└── public/
    ├── aphelion-icon.svg
    └── textures/planets/ # Planet texture assets (2K)
```

---

## Getting started

### Prerequisites

- Node.js 18+
- npm

### Local development

```bash
# 1) Install dependencies
npm install

# 2) Start dev server
npm run dev

# 3) Open in browser
# http://localhost:3000
```

---

## Scripts

```bash
npm run dev     # Start development server
npm run build   # Create production build
npm run start   # Run production server
npm run lint    # Run Next.js lint checks
```

---

## Changelog

### 1.0.2
- **Planet navigation:** Clicking a planet you are not currently on in the 3D tour now travels the camera directly to that planet rather than opening its detail page. Clicking your current planet still opens the detail view.
- **Quiz integrity:** Quiz answers are locked immediately on selection. The Previous button has been removed — quiz flow is strictly one-way to prevent score manipulation.
- **Mobile scroll stability:** Fixed jitter/stutter of the Earth animation on the home screen when scrolling on mobile by adding `touch-action: none` to the intro container and promoting the Earth canvas to its own GPU compositor layer.
- **Cleanup:** Removed the development-only planet test page (`/planet-test`). No sensitive data or secrets found in the repository; `.gitignore` coverage verified.

---

## Live site

[https://aphelion.website](https://aphelion.website)
