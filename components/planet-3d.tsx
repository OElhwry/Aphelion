"use client"

import { Suspense, useRef, useMemo, useEffect } from "react"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { OrbitControls, Stars, Html } from "@react-three/drei"
import { useReducedMotion } from "framer-motion"
import * as THREE from "three"

// Local 2K textures from Solar System Scope (CC-BY-4.0) in public/textures/planets/.
// Earth's normal + specular maps come from three.js examples (Solar System Scope
// ships those as TIFF which browsers can't decode).
// Pluto isn't in Solar System Scope's set, so it falls back to threex.planets.
const LOCAL = "/textures/planets"
const THREE_EX = "https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/planets"
const THREEX = "https://cdn.jsdelivr.net/gh/jeromeetienne/threex.planets@master/images"

export type PlanetKey = "sun" | "mercury" | "venus" | "earth" | "mars" | "jupiter" | "saturn" | "uranus" | "neptune" | "pluto" | "moon"

const PLANET_TEXTURES: Record<PlanetKey, { map: string; bump?: string; normal?: string; specular?: string; clouds?: string; ring?: string; night?: string; emissive?: boolean }> = {
  sun: { map: `${LOCAL}/2k_sun.jpg`, emissive: true },
  mercury: { map: `${LOCAL}/2k_mercury.jpg` },
  venus: { map: `${LOCAL}/2k_venus_atmosphere.jpg` },
  earth: {
    map: `${LOCAL}/2k_earth_daymap.jpg`,
    normal: `${THREE_EX}/earth_normal_2048.jpg`,
    specular: `${THREE_EX}/earth_specular_2048.jpg`,
    clouds: `${LOCAL}/2k_earth_clouds.jpg`,
    night: `${LOCAL}/earth_lights.jpg`,
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

// Exact sky textures from satellitemap.space, derived from NASA's public-domain
// Deep Star Maps 2020 (Gaia DR2). STARMAP is a dense, pure-black-background star
// field with the Milky Way baked in (their default sky); MILKYWAY is a smooth
// galaxy-glow variant. Their renderer just samples the map and multiplies by ~0.9.
export const SKY_STARMAP = "/textures/space/starmap-4k.jpg"
export const SKY_MILKYWAY = "/textures/space/milkyway-4k.jpg"

// Raw equirectangular sky sampling — no tone mapping, no sRGB auto-convert, so it
// matches satellitemap's "texture as-is" output. The gamma curve crushes each
// star's soft halo to a tight point (finer stars) and quiets the faint speckle,
// while the broad Milky Way glow survives.
const SKY_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const SKY_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D u_tex;
  uniform float u_brightness;
  uniform float u_gamma;
  uniform float u_opacity;
  void main() {
    vec3 c = texture2D(u_tex, vUv).rgb;
    c = pow(c, vec3(u_gamma)) * u_brightness;
    gl_FragColor = vec4(c, u_opacity);
  }
`

/** One equirectangular sky sphere (band or stars), rendered with the raw shader. */
function SkyLayer({
  textureUrl,
  gamma,
  brightness,
  radius,
  renderOrder,
  additive = false,
}: {
  textureUrl: string
  gamma: number
  brightness: number
  radius: number
  renderOrder: number
  additive?: boolean
}) {
  const texture = useLoader(THREE.TextureLoader, textureUrl)
  const uniforms = useMemo(
    () => ({
      u_tex: { value: texture },
      u_brightness: { value: brightness },
      u_gamma: { value: gamma },
      u_opacity: { value: 1 },
    }),
    // created once; values synced below
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useEffect(() => {
    texture.colorSpace = THREE.NoColorSpace
    uniforms.u_tex.value = texture
    uniforms.u_brightness.value = brightness
    uniforms.u_gamma.value = gamma
  }, [texture, brightness, gamma, uniforms])

  return (
    <mesh renderOrder={renderOrder}>
      <sphereGeometry args={[radius, 60, 40]} />
      <shaderMaterial
        side={THREE.BackSide}
        uniforms={uniforms}
        vertexShader={SKY_VERT}
        fragmentShader={SKY_FRAG}
        depthWrite={false}
        fog={false}
        transparent={additive}
        blending={additive ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </mesh>
  )
}

/**
 * Camera-following sky. Two layers like satellitemap: a smooth Milky Way band
 * underneath + a gamma-tightened star field added on top, so the galaxy stays
 * lush while the stars read as fine, quiet points. Drop INSIDE a <Canvas>.
 */
export function MilkyWaySkybox({
  radius = 400,
  rotationSpeed = 0.006,
  // Milky Way band layer
  brightness = 0.2,
  gamma = 1.0,
  bandTexture = SKY_MILKYWAY,
  // Star layer
  showStars = true,
  starBrightness = 1.5,
  starGamma = 1.9,
  starTexture = SKY_STARMAP,
  meteors = true,
  yaw = 0,
  tilt = 0.45,
}: {
  radius?: number
  rotationSpeed?: number
  /** Milky Way band level. */
  brightness?: number
  /** Band gamma (1 = raw smooth glow). */
  gamma?: number
  /** Texture for the smooth galaxy band. */
  bandTexture?: string
  /** Overlay the fine star field on top of the band. */
  showStars?: boolean
  /** Star layer level. */
  starBrightness?: number
  /** >1 shrinks stars to tight points & quiets haze. */
  starGamma?: number
  /** Texture for the star field. */
  starTexture?: string
  /** Occasional meteor streaks across the sky. */
  meteors?: boolean
  /** Initial spin (radians) — pick which slice of sky faces the camera. */
  yaw?: number
  /** Roll the galactic plane (radians) so the Milky Way reads as a long diagonal. */
  tilt?: number
}) {
  const group = useRef<THREE.Group>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    // Roll on z gives the diagonal band; yaw on y frames the bright core.
    if (group.current) group.current.rotation.set(0, yaw, tilt)
  }, [yaw, tilt])

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    g.position.copy(state.camera.position)
    if (!prefersReduced) g.rotation.y += delta * rotationSpeed
  })

  return (
    <group ref={group}>
      <SkyLayer textureUrl={bandTexture} gamma={gamma} brightness={brightness} radius={radius} renderOrder={-2} />
      {showStars && (
        <SkyLayer
          textureUrl={starTexture}
          gamma={starGamma}
          brightness={starBrightness}
          radius={radius * 0.999}
          renderOrder={-1}
          additive
        />
      )}
      {meteors && <Meteors radius={radius * 0.7} />}
    </group>
  )
}

function PlanetLoader() {
  return (
    <Html center>
      <div className="rounded-xl border border-white/15 bg-black/55 px-4 py-3 text-center backdrop-blur-sm">
        <div className="mx-auto mb-2 h-6 w-6 rounded-full border border-cyan-200/40 border-t-cyan-300 animate-spin" />
        <div className="text-[10px] uppercase tracking-[0.22em] text-white/80">Loading planet</div>
        <div className="mt-2 h-1.5 w-28 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-cyan-300/75 to-white/70" />
        </div>
      </div>
    </Html>
  )
}

// City lights on Earth's night side. A thin additive shell whose lights only show
// where the surface faces away from the sun. The shell spins with the surface, so
// cities light up as they rotate into darkness, while the terminator stays put.
const NIGHT_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  void main() {
    vUv = uv;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const NIGHT_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  uniform sampler2D u_lights;
  uniform vec3 u_lightDir;
  uniform float u_intensity;
  void main() {
    float day = dot(normalize(vWorldNormal), normalize(u_lightDir));
    float night = smoothstep(0.12, -0.12, day);
    vec3 c = pow(texture2D(u_lights, vUv).rgb, vec3(1.3)); // lift contrast a touch
    gl_FragColor = vec4(c * u_intensity * night, 1.0);
  }
`

function NightLights({ map, lightDir }: { map: THREE.Texture; lightDir: [number, number, number] }) {
  const uniforms = useMemo(
    () => ({
      u_lights: { value: map },
      u_lightDir: { value: new THREE.Vector3(...lightDir).normalize() },
      u_intensity: { value: 1.4 },
    }),
    [map, lightDir],
  )
  return (
    <mesh scale={1.002}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={NIGHT_VERT}
        fragmentShader={NIGHT_FRAG}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

// Occasional meteor streaks. Each meteor is a short additive line that launches
// from a random point on the sky, travels along a tangent, fades, then waits.
function Meteors({ count = 6, radius = 280 }: { count?: number; radius?: number }) {
  const { lines, data } = useMemo(() => {
    const lines: THREE.Line[] = []
    const data = [] as {
      t: number
      active: boolean
      age: number
      dur: number
      pos: THREE.Vector3
      vel: THREE.Vector3
    }[]
    for (let i = 0; i < count; i++) {
      const geom = new THREE.BufferGeometry()
      geom.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3))
      const mat = new THREE.LineBasicMaterial({
        color: 0xcfe3ff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      })
      const line = new THREE.Line(geom, mat)
      line.frustumCulled = false
      lines.push(line)
      data.push({
        t: 2 + Math.random() * 10,
        active: false,
        age: 0,
        dur: 0,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
      })
    }
    return { lines, data }
  }, [count])

  useEffect(() => {
    return () => lines.forEach((l) => (l.geometry.dispose(), (l.material as THREE.Material).dispose()))
  }, [lines])

  const tmp = useMemo(() => ({ tail: new THREE.Vector3(), a: new THREE.Vector3(), b: new THREE.Vector3() }), [])

  useFrame((_, delta) => {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const m = data[i]
      const mat = line.material as THREE.LineBasicMaterial
      if (!m.active) {
        m.t -= delta
        line.visible = false
        if (m.t <= 0) {
          m.active = true
          m.age = 0
          m.dur = 0.5 + Math.random() * 0.6
          m.pos.copy(tmp.a.randomDirection()).multiplyScalar(radius)
          // tangent velocity: cross product of position dir with a random dir
          m.vel.copy(tmp.b.randomDirection()).cross(m.pos).normalize().multiplyScalar(radius * (1.0 + Math.random()))
        }
        continue
      }
      m.age += delta
      const k = m.age / m.dur
      if (k >= 1) {
        m.active = false
        m.t = 4 + Math.random() * 12
        line.visible = false
        continue
      }
      line.visible = true
      m.pos.addScaledVector(m.vel, delta)
      tmp.tail.copy(m.pos).addScaledVector(m.vel, -0.06) // short trailing tail
      const pos = line.geometry.attributes.position as THREE.BufferAttribute
      pos.setXYZ(0, m.pos.x, m.pos.y, m.pos.z)
      pos.setXYZ(1, tmp.tail.x, tmp.tail.y, tmp.tail.z)
      pos.needsUpdate = true
      mat.opacity = Math.sin(k * Math.PI) * 0.9 // fade in then out
    }
  })

  return (
    <group>
      {lines.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
    </group>
  )
}

export function PlanetMesh({
  planetKey,
  autoRotate,
  rotationSpeed = 0.05,
  position = [0, 0, 0],
  lightDir = [5, 2, 3],
}: {
  planetKey: PlanetKey
  autoRotate: boolean
  rotationSpeed?: number
  position?: [number, number, number]
  /** World direction of the dominant light, for Earth's day/night terminator. */
  lightDir?: [number, number, number]
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
    if (tex.night) urls.push(tex.night)
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
  const night = tex.night ? loaded[idx++] : null

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

      {night && <NightLights map={night} lightDir={lightDir} />}
    </group>
  )
}

export function Planet3D({
  name = "earth",
  showStars = true,
  showMilkyWay = false,
  enableControls = true,
  enableZoom = true,
  autoRotate = true,
  rotationSpeed = 0.05,
  position = [0, 0, 0],
  cameraZ = 3,
}: {
  name?: string
  showStars?: boolean
  /** Opt-in textured galaxy band behind the procedural stars. */
  showMilkyWay?: boolean
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

      {showMilkyWay && (
        <Suspense fallback={null}>
          <MilkyWaySkybox />
        </Suspense>
      )}
      {showStars && <Stars radius={80} depth={40} count={3500} factor={3} saturation={0} fade speed={0.4} />}

      <Suspense fallback={<PlanetLoader />}>
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
