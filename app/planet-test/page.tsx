"use client"

import { Planet3D } from "@/components/planet-3d"

export default function PlanetTestPage() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#05070d] text-white">
      {/* Top nav bar (reference style) */}
      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-8 py-5">
        <span className="text-sm font-medium tracking-wide">
          aphelion<span className="text-cyan-300">·</span>
        </span>
        <nav className="flex items-center gap-8 text-xs uppercase tracking-[0.18em] text-white/60">
          <span className="border-b-2 border-cyan-300 pb-1 text-white">Planets</span>
          <span>Trailer</span>
          <span>Tickets</span>
          <span>Blog</span>
          <button className="rounded-full bg-white px-5 py-1.5 text-[11px] font-semibold tracking-[0.18em] text-black">
            Enroll
          </button>
        </nav>
      </header>

      {/* Hero text */}
      <div className="pointer-events-none absolute left-1/2 top-[14%] z-10 -translate-x-1/2 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-white/70">Planet</p>
        <h1
          className="mt-3 text-7xl font-light tracking-wide text-white"
          style={{ fontFamily: "'Playfair Display', 'Times New Roman', serif" }}
        >
          EARTH
        </h1>
        <div className="mx-auto mt-4 h-[2px] w-12 bg-cyan-300" />
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-white/60">
          Learn more about this fascinating miracle that we call our home, Planet Earth.
        </p>
      </div>

      {/* 3D canvas fills the whole screen */}
      <div className="absolute inset-0">
        <Planet3D name="earth" />
      </div>

      {/* Hint */}
      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-[11px] uppercase tracking-[0.3em] text-white/40">
        Drag to rotate · Scroll to zoom
      </div>
    </main>
  )
}
