"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Planet3D } from "@/components/planet-3d"

const SERIF = "'Playfair Display', 'Cormorant Garamond', 'Times New Roman', serif"

function StarField() {
  const stars = useRef(
    Array.from({ length: 220 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.6 + 0.15,
      delay: Math.random() * 6,
      dur: Math.random() * 4 + 5,
    }))
  )

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {stars.current.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, opacity: s.opacity }}
          animate={{ opacity: [s.opacity, s.opacity * 0.2, s.opacity] }}
          transition={{ duration: s.dur, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  )
}

export default function NotFound() {
  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#030710] text-white"
      style={{ fontFamily: "var(--font-orbitron), monospace" }}
    >
      <StarField />

      {/* Background gradients matching the intro screen */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(20,56,110,0.28)_0%,rgba(3,7,16,0.96)_55%,#02050b_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(35,81,162,0.22)_0%,transparent_52%)]" />

      {/* Lost planet — drifting Neptune */}
      <motion.div
        className="absolute inset-0 z-0"
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Planet3D
          name="neptune"
          showStars={false}
          enableControls={false}
          enableZoom={false}
          autoRotate
          rotationSpeed={0.025}
          position={[0, -1.6, 0]}
          cameraZ={3.2}
        />
      </motion.div>

      {/* Gradient fade over planet so text reads clearly */}
      <div className="absolute inset-0 z-10 bg-[linear-gradient(to_bottom,rgba(3,7,16,0.22)_0%,rgba(3,7,16,0.62)_44%,rgba(3,7,16,0.92)_100%)]" />
      <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_26%,rgba(3,7,16,0.52)_68%,rgba(3,7,16,0.94)_100%)]" />

      {/* Content */}
      <motion.div
        className="relative z-20 flex min-h-screen flex-col items-center justify-center px-6 text-center"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="text-[10px] tracking-[0.38em] text-white/70 sm:text-xs uppercase mb-2">
          Navigation Error
        </div>

        <h1
          style={{
            fontFamily: SERIF,
            fontSize: "clamp(5.5rem, 22vw, 10rem)",
            letterSpacing: "0.12em",
            lineHeight: 1,
            color: "rgba(255,255,255,0.93)",
          }}
        >
          404
        </h1>

        <div className="mt-4 h-px w-12 bg-cyan-300/80" />

        <p className="mt-5 text-xs leading-relaxed text-white/65 sm:text-sm max-w-xs">
          This region of space isn't in our star charts. The page you're looking for has drifted
          beyond the Aphelion.
        </p>

        <Link href="/" passHref>
          <motion.button
            className="mt-8 rounded-full border border-white/25 bg-white px-8 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-black shadow-[0_0_45px_rgba(80,170,255,0.25)] transition hover:bg-white/90"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Return to Solar System
          </motion.button>
        </Link>

        <div className="mt-5 text-[10px] uppercase tracking-[0.28em] text-white/35">
          coordinates unknown
        </div>
      </motion.div>
    </main>
  )
}
