"use client"

import { Suspense, useRef, useMemo } from "react"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import * as THREE from "three"

// Local 2K textures from Solar System Scope (CC-BY-4.0) in public/textures/planets/.
// Earth's normal + specular maps come from three.js examples (Solar System Scope
// ships those as TIFF which browsers can't decode).
// Pluto isn't in Solar System Scope's set, so it falls back to threex.planets.
const LOCAL = "/textures/planets"
const THREE_EX = "https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/planets"
const THREEX = "https://cdn.jsdelivr.net/gh/jeromeetienne/threex.planets@master/images"

export type PlanetKey = "sun" | "mercury" | "venus" | "earth" | "mars" | "jupiter" | "saturn" | "uranus" | "neptune" | "pluto" | "moon"

const PLANET_TEXTURES: Record<PlanetKey, { map: string; bump?: string; normal?: string; specular?: string; clouds?: string; ring?: string; emissive?: boolean }> = {
  sun: { map: `${LOCAL}/2k_sun.jpg`, emissive: true },
  mercury: { map: `${LOCAL}/2k_mercury.jpg` },
  venus: { map: `${LOCAL}/2k_venus_atmosphere.jpg` },
  earth: {
    map: `${LOCAL}/2k_earth_daymap.jpg`,
    normal: `${THREE_EX}/earth_normal_2048.jpg`,
    specular: `${THREE_EX}/earth_specular_2048.jpg`,
    clouds: `${LOCAL}/2k_earth_clouds.jpg`,
  },
  mars: { map: `${LOCAL}/2k_mars.jpg` },
  jupiter: { map: `${LOCAL}/2k_jupiter.jpg` },
  saturn: { map: `${LOCAL}/2k_saturn.jpg`, ring: `${LOCAL}/2k_saturn_ring_alpha.png` },
  uranus: { map: `${LOCAL}/2k_uranus.jpg` },
  neptune: { map: `${LOCAL}/2k_neptune.jpg` },
  pluto: { map: `${THREEX}/plutomap1k.jpg`, bump: `${THREEX}/plutobump1k.jpg` },
  moon: { map: `${LOCAL}/2k_moon.jpg` },
}

function nameToKey(name: string): PlanetKey {
  return name.toLowerCase() as PlanetKey
}

export function PlanetMesh({
  planetKey,
  autoRotate,
  rotationSpeed = 0.05,
  position = [0, 0, 0],
}: {
  planetKey: PlanetKey
  autoRotate: boolean
  rotationSpeed?: number
  position?: [number, number, number]
}) {
  const groupRef = useRef<THREE.Group>(null)
  const cloudRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)

  const tex = PLANET_TEXTURES[planetKey]

  // Build texture URL list (only those defined), then map back into named slots
  const textureUrls = useMemo(() => {
    const urls: string[] = [tex.map]
    if (tex.bump) urls.push(tex.bump)
    if (tex.normal) urls.push(tex.normal)
    if (tex.specular) urls.push(tex.specular)
    if (tex.clouds) urls.push(tex.clouds)
    if (tex.ring) urls.push(tex.ring)
    return urls
  }, [tex])

  const loaded = useLoader(THREE.TextureLoader, textureUrls)

  let idx = 0
  const map = loaded[idx++]
  const bump = tex.bump ? loaded[idx++] : null
  const normal = tex.normal ? loaded[idx++] : null
  const specular = tex.specular ? loaded[idx++] : null
  const clouds = tex.clouds ? loaded[idx++] : null
  const ring = tex.ring ? loaded[idx++] : null

  useFrame((_, delta) => {
    if (!autoRotate) return
    if (groupRef.current) groupRef.current.rotation.y += delta * rotationSpeed
    if (cloudRef.current) cloudRef.current.rotation.y += delta * (rotationSpeed * 1.4)
  })

  // Ring geometry: a flat torus-like disk for Saturn
  const ringGeometry = useMemo(() => {
    if (!ring) return null
    const inner = 1.3
    const outer = 2.2
    const segments = 96
    const geom = new THREE.RingGeometry(inner, outer, segments)
    // Adjust UVs so a strip texture maps radially
    const pos = geom.attributes.position
    const uv = geom.attributes.uv
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const r = Math.sqrt(x * x + y * y)
      uv.setXY(i, (r - inner) / (outer - inner), 0.5)
    }
    return geom
  }, [ring])

  return (
    <group ref={groupRef} position={position} rotation={[0, 0, 0]}>
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        {tex.emissive ? (
          <meshBasicMaterial map={map} />
        ) : (
          <meshPhongMaterial
            map={map}
            bumpMap={bump || undefined}
            bumpScale={bump ? 0.04 : 0}
            normalMap={normal || undefined}
            specularMap={specular || undefined}
            specular={specular ? new THREE.Color("#222222") : new THREE.Color("#000000")}
            shininess={specular ? 8 : 2}
          />
        )}
      </mesh>

      {clouds && (
        <mesh ref={cloudRef} scale={1.005}>
          <sphereGeometry args={[1, 64, 64]} />
          {/* Cloud JPG has no alpha channel — use it as alphaMap so brightness drives transparency */}
          <meshPhongMaterial
            map={clouds}
            alphaMap={clouds}
            transparent
            opacity={0.85}
            depthWrite={false}
          />
        </mesh>
      )}

      {ring && ringGeometry && (
        <mesh ref={ringRef} rotation={[Math.PI / 2.2, 0, 0]} geometry={ringGeometry}>
          <meshBasicMaterial map={ring} side={THREE.DoubleSide} transparent opacity={0.85} />
        </mesh>
      )}
    </group>
  )
}

export function Planet3D({
  name = "earth",
  showStars = true,
  enableControls = true,
  enableZoom = true,
  autoRotate = true,
  rotationSpeed = 0.05,
  position = [0, 0, 0],
  cameraZ = 3,
}: {
  name?: string
  showStars?: boolean
  enableControls?: boolean
  enableZoom?: boolean
  autoRotate?: boolean
  rotationSpeed?: number
  position?: [number, number, number]
  cameraZ?: number
}) {
  const key = nameToKey(name)
  const isSun = key === "sun"

  return (
    <Canvas camera={{ position: [0, 0, cameraZ], fov: 45 }} dpr={[1, 2]}>
      <ambientLight intensity={isSun ? 1 : 0.06} />
      {!isSun && <directionalLight position={[5, 2, 3]} intensity={2.2} color="#ffffff" />}
      {isSun && <pointLight position={[0, 0, 0]} intensity={3} color="#ffaa44" />}

      {showStars && <Stars radius={80} depth={40} count={3500} factor={3} saturation={0} fade speed={0.4} />}

      <Suspense fallback={null}>
        <PlanetMesh planetKey={key} autoRotate={autoRotate} rotationSpeed={rotationSpeed} position={position} />
      </Suspense>

      {enableControls && (
        <OrbitControls
          enablePan={false}
          enableZoom={enableZoom}
          minDistance={1.6}
          maxDistance={6}
          rotateSpeed={0.5}
          zoomSpeed={0.6}
          target={position}
        />
      )}
    </Canvas>
  )
}
