# Aphelion

[![Deployed](https://img.shields.io/badge/Deployed-Live-brightgreen)](https://aphelion.website/)

**Explore the solar system in a cinematic interactive experience.** Aphelion blends scrolling animation, planet detail cards, and quizzes into a polished space learning adventure.

## ✨ What Aphelion Does

- Guides users through a scroll-driven voyage from the Sun to Pluto
- Presents a dynamic orbital Solar System view with animated planet motion
- Surfaces rich planet facts, statistics, and descriptive cards
- Includes per-planet quiz challenges with instant feedback and score tracking
- Displays travel progress in a distance HUD based on million kilometers from the Sun

## 🚀 Key Features

- **Launch experience:** Dramatic intro animation that flows into the main journey.
- **Journey view:** Scroll across ten solar worlds with motion and distance markers.
- **Solar system view:** Explore planets in orbit and open a dedicated planet detail page.
- **Planet detail cards:** Read facts, view core stats, and jump into quizzes.
- **Quiz mode:** Answer questions, get immediate feedback, and review results.
- **Mission summary:** Completion screen with total worlds visited, distance traveled, and ranking.

## 🛠️ Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **Tailwind CSS**
- **Framer Motion** for smooth animated transitions
- **Radix UI** for accessible UI building blocks

## 📱 Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open the app at:

```bash
http://localhost:3000
```

## ⚙️ Project Structure

- `app/page.tsx` — main interactive experience, planet data, views, and quiz logic
- `app/layout.tsx` — global layout, fonts, and metadata
- `components/ui/` — reusable UI components and Radix wrappers
- `styles/globals.css` — global styling and Tailwind configuration

## 📦 Deployment

Aphelion is deployed live at:

https://aphelion.website/

## 💡 Notes

- Fully client-side experience with no external backend required.
- Designed for a responsive experience with polished transitions and mobile-friendly presentation.
