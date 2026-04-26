"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"

function StarField() {
  const stars = useRef(
    Array.from({ length: 250 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.7 + 0.2,
      delay: Math.random() * 6,
      dur: Math.random() * 4 + 4,
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

function NebulaBg() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div
        className="nebula absolute"
        style={{
          width: "80vw",
          height: "80vw",
          top: "-20%",
          left: "-20%",
          background:
            "radial-gradient(ellipse at center, rgba(0,100,200,0.06) 0%, rgba(0,50,150,0.03) 40%, transparent 70%)",
        }}
      />
      <div
        className="nebula absolute"
        style={{
          width: "60vw",
          height: "60vw",
          bottom: "-10%",
          right: "-10%",
          background:
            "radial-gradient(ellipse at center, rgba(0,212,255,0.05) 0%, rgba(0,100,200,0.02) 40%, transparent 70%)",
          animationDelay: "8s",
        }}
      />
    </div>
  )
}

export default function NotFound() {
  const [glitch, setGlitch] = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      setGlitch(true)
      setTimeout(() => setGlitch(false), 150)
    }, 3500)
    return () => clearInterval(id)
  }, [])

  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#000510", color: "#e8f4f8", fontFamily: "var(--font-orbitron), monospace" }}
    >
      <StarField />
      <NebulaBg />

      {/* HUD corner brackets */}
      <div className="fixed top-6 left-6 pointer-events-none z-10">
        <div className="w-8 h-8 border-t border-l" style={{ borderColor: "rgba(0,212,255,0.4)" }} />
      </div>
      <div className="fixed top-6 right-6 pointer-events-none z-10">
        <div className="w-8 h-8 border-t border-r" style={{ borderColor: "rgba(0,212,255,0.4)" }} />
      </div>
      <div className="fixed bottom-6 left-6 pointer-events-none z-10">
        <div className="w-8 h-8 border-b border-l" style={{ borderColor: "rgba(0,212,255,0.4)" }} />
      </div>
      <div className="fixed bottom-6 right-6 pointer-events-none z-10">
        <div className="w-8 h-8 border-b border-r" style={{ borderColor: "rgba(0,212,255,0.4)" }} />
      </div>

      {/* Lost planet visual */}
      <div className="relative z-10 mb-10">
        <motion.div
          className="relative"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Glow ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle at center, rgba(0,212,255,0.15) 0%, transparent 70%)",
              transform: "scale(2)",
            }}
          />
          {/* Planet body */}
          <div
            className="relative rounded-full"
            style={{
              width: 120,
              height: 120,
              background:
                "radial-gradient(circle at 38% 32%, #e8eaf6 0%, #9fa8da 12%, #3949ab 26%, #1a237e 46%, #0d1470 64%, #050a4a 82%, #020520 100%)",
              boxShadow: "inset -6px -5px 18px rgba(0,0,0,0.6), 0 0 40px rgba(0,212,255,0.2)",
            }}
          />
          {/* Orbit ring */}
          <div
            className="absolute"
            style={{
              width: 200,
              height: 50,
              border: "1px solid rgba(0,212,255,0.2)",
              borderRadius: "50%",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) rotateX(70deg)",
              boxShadow: "0 0 10px rgba(0,212,255,0.05)",
            }}
          />
        </motion.div>
      </div>

      {/* Error code */}
      <div className="relative z-10 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Scanline 404 */}
          <div className="scanline inline-block mb-4">
            <h1
              className="glow-text"
              style={{
                fontSize: "clamp(5rem, 20vw, 9rem)",
                fontWeight: 900,
                letterSpacing: "0.05em",
                color: "rgba(0,212,255,0.9)",
                filter: glitch ? "blur(2px) hue-rotate(40deg)" : "none",
                transition: "filter 0.05s",
                lineHeight: 1,
              }}
            >
              404
            </h1>
          </div>

          {/* HUD label */}
          <div
            className="hud-border inline-block px-5 py-2 mb-6 tracking-widest text-xs uppercase"
            style={{ color: "rgba(0,212,255,0.7)" }}
          >
            SIGNAL LOST — COORDINATES UNKNOWN
          </div>

          <p
            className="mb-2 text-base tracking-wide"
            style={{ color: "rgba(232,244,248,0.6)", maxWidth: 380, margin: "0 auto 0.5rem" }}
          >
            This region of space doesn't exist in our star charts.
          </p>
          <p
            className="mb-10 text-sm tracking-wide"
            style={{ color: "rgba(232,244,248,0.35)", maxWidth: 340, margin: "0 auto 2.5rem" }}
          >
            The page you're looking for may have drifted beyond the Aphelion.
          </p>

          {/* Return button */}
          <Link href="/" passHref>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="hud-border scanline px-8 py-3 tracking-widest text-sm uppercase"
              style={{
                background: "rgba(0,212,255,0.06)",
                color: "rgba(0,212,255,0.9)",
                cursor: "pointer",
                letterSpacing: "0.18em",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "rgba(0,212,255,0.14)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "rgba(0,212,255,0.06)")
              }
            >
              ← Return to Solar System
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* Bottom status bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-10 px-8 py-2 flex items-center justify-between text-xs tracking-widest"
        style={{
          borderTop: "1px solid rgba(0,212,255,0.12)",
          background: "rgba(0,5,16,0.8)",
          color: "rgba(0,212,255,0.4)",
        }}
      >
        <span>APHELION v1.0</span>
        <span>ERR_ROUTE_NOT_FOUND</span>
        <span>STATUS: 404</span>
      </div>
    </main>
  )
}
