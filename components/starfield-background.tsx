"use client"

import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { Stars } from "@react-three/drei"
import { PlanetMesh, MilkyWaySkybox } from "@/components/planet-3d"
import { cn } from "@/lib/utils"

// MilkyWaySkybox lives in planet-3d.tsx (with the rest of the three.js scene
// code); re-export it here so callers can grab either piece from one module.
export { MilkyWaySkybox }

/**
 * Standalone full-screen starfield: a fixed (or absolute) canvas with the Milky
 * Way skybox + procedural stars. Use behind views that don't already render their
 * own 3D scene (e.g. the orrery). Pointer events pass through to the UI above.
 */
export function StarfieldBackground({
  showStars = true,
  showEarth = false,
  className,
  position = "fixed",
}: {
  /** Procedural twinkle layer on top of the galaxy band. */
  showStars?: boolean
  /** Opt-in globe — off by default so your existing Earth stays the hero. */
  showEarth?: boolean
  className?: string
  position?: "fixed" | "absolute"
}) {
  return (
    <div
      className={cn(
        "pointer-events-none inset-0",
        position === "fixed" ? "fixed" : "absolute",
        className,
      )}
    >
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }} dpr={[1, 1.5]} gl={{ antialias: true }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 2, 3]} intensity={1.6} />

        <Suspense fallback={null}>
          <MilkyWaySkybox />
          {showEarth && (
            <PlanetMesh planetKey="earth" autoRotate rotationSpeed={0.04} position={[0, 0, 0]} />
          )}
        </Suspense>

        {showStars && (
          <Stars radius={140} depth={70} count={4000} factor={3} saturation={0} fade speed={0.25} />
        )}
      </Canvas>
    </div>
  )
}
