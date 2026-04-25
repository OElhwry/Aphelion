"use client"

import { Suspense, useState, useEffect, useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { CameraControls, Stars } from "@react-three/drei"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Ruler, Clock, Compass, ArrowDown, Thermometer, Moon, Weight, Calendar, Star, MousePointer2, RotateCcw, Sparkles } from "lucide-react"
import * as THREE from "three"
import { PlanetMesh, type PlanetKey } from "@/components/planet-3d"
import { AphelionLogo } from "@/components/aphelion-logo"
import { cn } from "@/lib/utils"

interface TourPlanet {
  name: string
  tagline?: string
  stats?: { label: string; value: string }[]
  facts?: string[]
  color?: string
  accentColor?: string
}

type CompletionMap = Record<string, { factsRead?: boolean; quizCompleted?: boolean }>

const SERIF = "'Playfair Display', 'Cormorant Garamond', 'Times New Roman', serif"

// Per-planet 3D positions — varied across X (progression), Y (height), Z (depth)
// so flying between them feels like traversing real space, not sliding sideways.
const PLANET_POSITIONS: Record<string, [number, number, number]> = {
  Sun:     [0,   0,    0],
  Mercury: [16,  1.5, -2],
  Venus:   [32, -2,    3],
  Earth:   [48,  1.8, -1.5],
  Mars:    [64, -1.2,  4],
  Jupiter: [82,  2.5, -3],
  Saturn:  [100, -2.5, 2.5],
  Uranus:  [116, 1.8, -4],
  Neptune: [132, -1.5, 3.5],
  Pluto:   [146, 0.5, -2.5],
}

// Real-ish proportions, compressed so distant planets stay visible
const REAL_SCALE: Record<string, number> = {
  Sun: 2.6,
  Mercury: 0.35,
  Venus: 0.82,
  Earth: 0.88,
  Mars: 0.48,
  Jupiter: 1.9,
  Saturn: 1.65,
  Uranus: 1.1,
  Neptune: 1.05,
  Pluto: 0.18,
}

const camDistance = (scale: number) => scale * 3.4 + 1.0
const positionFor = (name: string): [number, number, number] => PLANET_POSITIONS[name] ?? [0, 0, 0]
const scaleFor = (name: string) => REAL_SCALE[name] ?? 1

function triggerHaptic(pattern: number | number[] = 10) {
  if (typeof window === "undefined") return
  const isTouch = window.matchMedia("(pointer: coarse)").matches
  if (!isTouch || !("vibrate" in navigator)) return
  navigator.vibrate(pattern)
}

function getStatIcon(label: string) {
  const l = label.toLowerCase()
  if (l.includes("diameter") || l.includes("size")) return Ruler
  if (l.includes("period") || l.includes("orbit") || l.includes("year") || l.includes("day")) return Clock
  if (l.includes("age")) return Calendar
  if (l.includes("distance")) return Compass
  if (l.includes("gravity")) return ArrowDown
  if (l.includes("temp")) return Thermometer
  if (l.includes("moon")) return Moon
  if (l.includes("mass") || l.includes("weight")) return Weight
  return Star
}

// Cinematic camera flight — bezier curve through space (arc up + pull back)
// rather than straight-line slide.
function CinematicCameraRig({
  positions,
  scales,
  planetIndex,
}: {
  positions: [number, number, number][]
  scales: number[]
  planetIndex: number
}) {
  const ref = useRef<CameraControls>(null)

  const animRef = useRef({
    isAnimating: false,
    startTime: 0,
    duration: 1.6,
    fromPos: new THREE.Vector3(),
    fromTarget: new THREE.Vector3(),
    toPos: new THREE.Vector3(),
    toTarget: new THREE.Vector3(),
    midOffset: new THREE.Vector3(),
  })

  const lastIndex = useRef<number | null>(null)

  useEffect(() => {
    const ctrl = ref.current
    if (!ctrl) return

    const targetPos = positions[planetIndex]
    const targetScale = scales[planetIndex]
    const dist = camDistance(targetScale)

    const camEndX = targetPos[0]
    const camEndY = targetPos[1]
    const camEndZ = targetPos[2] + dist

    if (lastIndex.current === null) {
      // First mount — snap into place, no flight
      ctrl.setLookAt(camEndX, camEndY, camEndZ, targetPos[0], targetPos[1], targetPos[2], false)
      lastIndex.current = planetIndex
      return
    }

    if (lastIndex.current === planetIndex) return

    const a = animRef.current
    const camPos = new THREE.Vector3()
    const camTarget = new THREE.Vector3()
    ctrl.getPosition(camPos)
    ctrl.getTarget(camTarget)

    a.fromPos.copy(camPos)
    a.fromTarget.copy(camTarget)
    a.toPos.set(camEndX, camEndY, camEndZ)
    a.toTarget.set(targetPos[0], targetPos[1], targetPos[2])

    // Mid-offset for the bezier control point: pull back & arc up
    const distance = a.fromPos.distanceTo(a.toPos)
    a.midOffset.set(0, distance * 0.18, distance * 0.18)

    // Duration scales with distance so big jumps still feel paced
    a.duration = THREE.MathUtils.clamp(distance * 0.04, 1.0, 2.4)

    // NOTE: do NOT set ctrl.enabled = false here — drei's CameraControls
    // wrapper skips controls.update(delta) when disabled, which means our
    // per-frame setLookAt calls would never propagate to the three.js camera
    // and the camera would teleport at animation end.

    a.isAnimating = true
    a.startTime = performance.now() / 1000
    lastIndex.current = planetIndex
  }, [planetIndex, positions, scales])

  useFrame((_, delta) => {
    const ctrl = ref.current
    const a = animRef.current
    if (!a.isAnimating || !ctrl) return

    const now = performance.now() / 1000
    const t = Math.min((now - a.startTime) / a.duration, 1)

    // Ease in-out cubic
    const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

    // Quadratic bezier: from -> mid -> to
    const mid = new THREE.Vector3().lerpVectors(a.fromPos, a.toPos, 0.5).add(a.midOffset)
    const oneMinusT = 1 - eased
    const camPos = new THREE.Vector3()
      .addScaledVector(a.fromPos, oneMinusT * oneMinusT)
      .addScaledVector(mid, 2 * oneMinusT * eased)
      .addScaledVector(a.toPos, eased * eased)

    // The look-at also lerps so the camera continuously points roughly forward,
    // creating the perspective shift the user feels mid-flight.
    const lookAt = new THREE.Vector3().lerpVectors(a.fromTarget, a.toTarget, eased)

    ctrl.setLookAt(camPos.x, camPos.y, camPos.z, lookAt.x, lookAt.y, lookAt.z, false)
    // Force camera-controls to apply the new state to the three.js camera this frame
    ctrl.update(delta)

    if (t >= 1) {
      a.isAnimating = false
    }
  })

  return <CameraControls ref={ref} minDistance={1.5} maxDistance={25} smoothTime={0.4} truckSpeed={0} />
}

function ClickablePlanet({
  name,
  position,
  scale,
  onClick,
}: {
  name: string
  position: [number, number, number]
  scale: number
  onClick: () => void
}) {
  const planetKey = name.toLowerCase() as PlanetKey
  return (
    <group position={position} scale={scale}>
      <PlanetMesh planetKey={planetKey} autoRotate rotationSpeed={0.05} />
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = "pointer"
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default"
        }}
      >
        <sphereGeometry args={[1.15, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
}

export function TourView({
  planets,
  onSelectPlanet,
  completion = {},
}: {
  planets: TourPlanet[]
  onSelectPlanet: (p: TourPlanet) => void
  completion?: CompletionMap
}) {
  const prefersReducedMotion = useReducedMotion()
  const startIdx = useMemo(() => {
    const i = planets.findIndex((p) => p.name === "Earth")
    return i === -1 ? 0 : i
  }, [planets])

  const [index, setIndex] = useState(startIdx)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(0)
  const current = planets[index]
  const onboardingSteps = [
    {
      title: "Navigate in 3D",
      description: "Drag with mouse or swipe to rotate and explore each planet from different angles.",
    },
    {
      title: "Open Planet Details",
      description: "Click any planet or press Get Started to jump straight into facts and quizzes.",
    },
    {
      title: "Enjoy the Journey",
      description: "Continue exploring the solar system and discover new details on every world.",
    },
  ] as const

  // Lock body overflow so the page never scrolls — bottom nav must stay visible
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    const key = "aphelion.tour-onboarding-seen"
    const seen = window.sessionStorage.getItem(key) === "1"
    if (seen) return
    setShowOnboarding(true)
    setOnboardingStep(0)
    window.sessionStorage.setItem(key, "1")
  }, [])

  useEffect(() => {
    if (!showOnboarding) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowOnboarding(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [showOnboarding])

  const positions = useMemo(() => planets.map((p) => positionFor(p.name)), [planets])
  const scales = useMemo(() => planets.map((p) => scaleFor(p.name)), [planets])

  // Initial camera position (avoids fly-in on mount)
  const initialCam = useMemo(() => {
    const p = positions[startIdx]
    const d = camDistance(scales[startIdx])
    return [p[0], p[1], p[2] + d] as [number, number, number]
  }, [positions, scales, startIdx])

  const description = useMemo(() => {
    if (current.facts && current.facts.length) return current.facts.slice(0, 2)
    if (current.tagline) return [current.tagline]
    return ["Explore this fascinating world in our solar system."]
  }, [current])

  return (
    <main className="fixed inset-0 z-0 overflow-hidden bg-[#05070d] text-white">
      {/* Wordmark */}
      <div className="absolute left-6 top-5 z-30 sm:left-10 sm:top-6">
        <AphelionLogo wordmarkClassName="text-[12px] tracking-[0.32em]" iconClassName="h-6 w-6" />
      </div>

      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: initialCam, fov: 45 }} dpr={[1, 2]}>
          <ambientLight intensity={0.1} />
          <directionalLight position={[10, 5, 10]} intensity={1.4} color="#ffffff" />
          {/* Sun's local point light */}
          <pointLight position={positionFor("Sun")} intensity={2.5} color="#ffaa44" distance={50} decay={1.5} />

          {/* Layered starfield: distant haze + crisp foreground for depth */}
          <Stars radius={400} depth={120} count={9000} factor={2.2} saturation={0} fade speed={0.15} />
          <Stars radius={180} depth={60} count={2200} factor={4.5} saturation={0} fade speed={0.4} />

          <Suspense fallback={null}>
            {planets.map((p, i) => (
              <ClickablePlanet
                key={p.name}
                name={p.name}
                position={positions[i]}
                scale={scales[i]}
                onClick={() => {
                  triggerHaptic([8, 12, 8])
                  onSelectPlanet(p)
                }}
              />
            ))}
          </Suspense>

          <CinematicCameraRig positions={positions} scales={scales} planetIndex={index} />
        </Canvas>
      </div>


      {/* Stats — left side */}
      <div className="pointer-events-none absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 md:block sm:left-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.4 }}
            className="space-y-4 sm:space-y-5"
          >
            {current.stats?.slice(0, 6).map((s) => {
              const Icon = getStatIcon(s.label)
              return (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="whitespace-nowrap text-[10px] tracking-wide text-white/85 sm:text-[11px]">
                    {s.value} {s.label}
                  </span>
                  <Icon className="h-3 w-3 shrink-0 text-white/40" strokeWidth={1.5} />
                </div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Description — right side */}
      <div className="pointer-events-none absolute right-4 top-1/2 z-20 hidden max-w-[280px] -translate-y-1/2 md:block sm:right-10 sm:max-w-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.name}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.4 }}
          >
            <h2
              className="mb-4 flex items-center justify-end gap-3 text-xl tracking-[0.5em] text-white/95 sm:text-2xl"
              style={{ fontFamily: SERIF }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.5)" }}
                aria-hidden
              />
              {current.name.toUpperCase()}
            </h2>
            <div className="space-y-3 rounded-md border border-white/10 bg-black/30 p-4 text-[11px] leading-relaxed text-white/65 backdrop-blur-sm sm:text-xs">
              {description.map((d, i) => (
                <p key={i}>{d}</p>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Get Started CTA */}
      <div className="absolute bottom-24 right-4 z-30 sm:bottom-28 sm:right-10">
        <button
          onClick={() => {
            triggerHaptic([8, 12, 8])
            onSelectPlanet(current)
          }}
          className="min-h-11 rounded-full bg-white px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-black shadow-lg transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 sm:px-6 sm:py-2.5 sm:tracking-[0.3em]"
          aria-label={`Open ${current.name} details`}
        >
          Get Started
        </button>
      </div>

      {/* Mobile condensed details card */}
      <div className="absolute inset-x-4 bottom-24 z-20 md:hidden">
        <div className="rounded-xl border border-white/15 bg-black/45 p-3.5 backdrop-blur-md">
          <div
            className="mb-1.5 flex items-center gap-2 text-sm tracking-[0.22em] text-white/95"
            style={{ fontFamily: SERIF }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.6)" }}
              aria-hidden
            />
            {current.name.toUpperCase()}
          </div>
          <p className="max-h-[2.9em] overflow-hidden text-[12px] leading-relaxed text-white/75">
            {description[0]}
          </p>
        </div>
      </div>

      {/* First-time guided onboarding */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            className="absolute inset-0 z-40 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.15 : 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-label="Quick guide tutorial"
          >
            <motion.div
              className="w-full max-w-xl rounded-3xl border border-white/10 bg-[linear-gradient(155deg,rgba(9,16,28,0.9)_0%,rgba(5,10,18,0.94)_45%,rgba(4,8,14,0.97)_100%)] p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.03),inset_0_1px_0_rgba(255,255,255,0.07)] sm:p-7"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: prefersReducedMotion ? 0.15 : 0.3, ease: "easeOut" }}
            >
              <div className="mb-2 text-[10px] uppercase tracking-[0.28em] text-cyan-200/80">
                Quick Guide
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={onboardingStep}
                  initial={{ opacity: 0, x: 26, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -22, filter: "blur(4px)" }}
                  transition={{ duration: prefersReducedMotion ? 0.15 : 0.32, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <motion.div
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-200/25 bg-cyan-400/10 text-cyan-200"
                      animate={onboardingStep === 0 ? { rotate: [0, -8, 8, 0] } : onboardingStep === 1 ? { scale: [1, 1.08, 1] } : { y: [0, -3, 0] }}
                      transition={{ duration: 1.25, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {onboardingStep === 0 && (
                        <div className="relative flex items-center justify-center">
                          <MousePointer2 className="h-5 w-5" strokeWidth={1.7} />
                          <RotateCcw className="absolute -right-3 -top-3 h-3.5 w-3.5 text-cyan-100/85" strokeWidth={1.8} />
                        </div>
                      )}
                      {onboardingStep === 1 && <Sparkles className="h-5 w-5" strokeWidth={1.7} />}
                      {onboardingStep === 2 && <Compass className="h-5 w-5" strokeWidth={1.7} />}
                    </motion.div>
                    <div className="text-base tracking-wide text-white/95 sm:text-lg">
                      {onboardingSteps[onboardingStep].title}
                    </div>
                  </div>
                  <div className="min-h-[58px] text-sm leading-relaxed text-white/78 sm:text-[15px]">
                    {onboardingSteps[onboardingStep].description}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {[0, 1, 2].map((s) => (
                    <span
                      key={s}
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        onboardingStep === s ? "w-6 bg-cyan-300" : "w-2 bg-white/30",
                      )}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      triggerHaptic(8)
                      setShowOnboarding(false)
                    }}
                    className="min-h-10 rounded-full border border-white/20 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.2em] text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80"
                  >
                    Skip
                  </button>
                  <motion.button
                    onClick={() => {
                      triggerHaptic(8)
                      if (onboardingStep >= 2) {
                        setShowOnboarding(false)
                        return
                      }
                      setOnboardingStep((v) => Math.min(v + 1, 2))
                    }}
                    className="min-h-10 rounded-full bg-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80"
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {onboardingStep >= 2 ? "Start" : "Next"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom planet navigation — minimal inline list */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-3 pb-4 pt-3 sm:px-4 sm:pb-6 sm:pt-4">
        <div className="mx-auto flex max-w-5xl items-end justify-start gap-3 overflow-x-auto rounded-lg border border-white/10 bg-black/35 px-3 py-2.5 backdrop-blur-sm sm:justify-center sm:gap-5 sm:border-none sm:bg-transparent sm:px-0 sm:py-0">
          <span className="hidden shrink-0 pb-[2px] text-[10px] tracking-[0.25em] text-white/35 sm:inline">
            Planets
          </span>
          {planets.map((p, i) => {
            const active = i === index
            return (
              <button
                key={p.name}
                onClick={() => {
                  triggerHaptic(8)
                  setIndex(i)
                }}
                className={cn(
                  "group relative flex min-h-10 shrink-0 flex-col items-center justify-center gap-1 px-1.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80",
                  active ? "text-white" : "text-white/40 hover:text-white/75",
                )}
                aria-label={`Focus ${p.name}`}
                aria-pressed={active}
              >
                {/* Active orbit indicator */}
                <span
                  className={cn(
                    "flex h-3.5 w-3.5 items-center justify-center transition-opacity",
                    active ? "opacity-100" : "opacity-0",
                  )}
                  aria-hidden
                >
                  <span
                    className="h-3 w-3 rounded-full border border-white/70"
                    style={{ boxShadow: "inset 0 0 4px rgba(255,255,255,0.35)" }}
                  />
                </span>
                <span className="whitespace-nowrap text-[10px] tracking-[0.18em] sm:text-[11px]">
                  {p.name}
                </span>
                <span className="mt-0.5 flex items-center gap-1 text-[8px] tracking-[0.12em] text-white/45">
                  <span style={{ opacity: completion[p.name]?.factsRead ? 1 : 0.35 }}>FACTS</span>
                  <span aria-hidden>·</span>
                  <span style={{ opacity: completion[p.name]?.quizCompleted ? 1 : 0.35 }}>QUIZ</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </main>
  )
}
