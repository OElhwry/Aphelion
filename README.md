# Aphelion

An immersive interactive solar system explorer built with Next.js, Tailwind CSS, and Framer Motion.

Aphelion guides users through our solar system with a cinematic visual journey, planet detail cards, and quizzes for every world. The experience is deployed live at:

https://aphelion.website/

## What Aphelion Does

Aphelion turns space education into an engaging experience by combining:

- A scroll-driven solar system voyage from the Sun to Pluto
- A dynamic orbital "Solar System" view with animated planet motion
- Clickable planet cards with rich statistics, fun facts, and descriptive taglines
- Per-planet quiz challenges with instant feedback and score tracking
- A distance HUD showing travel progress in million kilometers from the Sun

## Key Features

- **Launch experience:** A dramatic intro screen that transitions into the interactive voyage.
- **Journey View:** Scroll through ten solar system worlds with animated planet visuals and distance markers.
- **Solar System View:** Explore the same planets in an orbiting model, then click a planet to dive deeper.
- **Planet detail view:** Read planetary facts, view core statistics, and open a dedicated quiz for each world.
- **Quiz mode:** Answer 50 questions across all planets, see correct/incorrect feedback, and review results.
- **Mission summary:** A completion screen with total worlds visited, total distance traveled, and mission ranking.

## Technologies Used

- **Next.js 14** (App Router)
- **React 18**
- **Tailwind CSS**
- **Framer Motion** for animated transitions and scroll effects
- **Radix UI** and custom UI components for polished layout and controls

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open the app in your browser at:

```bash
http://localhost:3000
```

## Project Structure

- `app/page.tsx` — main interactive experience, planet data, views, and quiz logic
- `app/layout.tsx` — global page layout, font setup, and site metadata
- `components/ui/` — reusable UI components for the application
- `styles/globals.css` — base styling and Tailwind setup

## Deployment

Aphelion is deployed and available online at:

https://aphelion.website/

## Notes

- This project is a client-side interactive experience with no external backend required.
- It is designed for a polished desktop browsing experience with animated transitions and responsive presentation.
