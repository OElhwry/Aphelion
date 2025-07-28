"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

const planets = [
  { name: "Sun", image: "/images/Sun.png", position: 1000, color: "#FDB813", size: 800, distanceFromSun: 0 },
  { name: "Mercury", image: "/images/Mercury.png", position: 1800, color: "#8C7853", size: 320, distanceFromSun: 58 },
  { name: "Venus", image: "/images/Venus.png", position: 2600, color: "#FFC649", size: 380, distanceFromSun: 108 },
  { name: "Earth", image: "/images/Earth.png", position: 3400, color: "#6B93D6", size: 400, distanceFromSun: 150 },
  { name: "Mars", image: "/images/Mars.png", position: 4200, color: "#C1440E", size: 340, distanceFromSun: 228 },
  { name: "Jupiter", image: "/images/Jupiter.png", position: 5200, color: "#D8CA9D", size: 720, distanceFromSun: 778 },
  { name: "Saturn", image: "/images/Saturn.png", position: 6400, color: "#FAD5A5", size: 640, distanceFromSun: 1432 },
  { name: "Uranus", image: "/images/Uranus.png", position: 7600, color: "#4FD0E7", size: 480, distanceFromSun: 2867 },
  { name: "Neptune", image: "/images/Neptune.png", position: 8800, color: "#4B70DD", size: 460, distanceFromSun: 4515 },
  { name: "Pluto", image: "/images/Pluto.png", position: 9600, color: "#D4B896", size: 280, distanceFromSun: 5906 },
]

function StarField() {
  const { scrollYProgress } = useScroll()

  // Create different star brightness based on distance from sun
  const starBrightness = useTransform(scrollYProgress, [0, 0.3, 1], [0.9, 0.4, 0.1])
  const starCount = useTransform(scrollYProgress, [0, 0.5, 1], [400, 200, 50])

  const stars = Array.from({ length: 400 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 0.5,
    baseOpacity: Math.random() * 0.9 + 0.1,
    animationDelay: Math.random() * 5,
    fadeThreshold: Math.random(), // Some stars fade out earlier than others
  }))

  const shouldShow = (fadeThreshold: number) =>
    useTransform(scrollYProgress, [0, fadeThreshold, 1], [1, fadeThreshold > 0.7 ? 1 : 0, 0])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => {
        // Calculate if this star should be visible based on scroll progress

        return (
          <motion.div
            key={star.id}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: useTransform(scrollYProgress, [0, 0.5, 1], ["#ffffff", "#cccccc", "#666666"]),
              opacity: useTransform(
                [starBrightness, shouldShow(star.fadeThreshold)],
                (values: number[]) => star.baseOpacity * values[0] * values[1],
              ),
            }}
            animate={{
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              delay: star.animationDelay,
              ease: "easeInOut",
            }}
          />
        )
      })}
    </div>
  )
}

function Planet({ planet, index }: { planet: (typeof planets)[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="absolute left-1/2 transform -translate-x-1/2 cursor-pointer"
      style={{ top: `${planet.position}px` }}
      initial={{ opacity: 0, scale: 0.2, y: 100 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-300px" }}
      transition={{
        duration: 1.5,
        delay: index * 0.15,
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
      whileHover={{ scale: 1.2, y: -10 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => {
        console.log(`Exploring ${planet.name}`)
      }}
    >
      <div className="text-center">
        <motion.div
          className="relative mx-auto mb-8"
          style={{
            width: `${planet.size}px`,
            height: `${planet.size}px`,
            filter: `drop-shadow(0 0 ${planet.size / 3}px ${planet.color}60)`,
          }}
          animate={{
            filter: isHovered
              ? `drop-shadow(0 0 ${planet.size / 2}px ${planet.color}90) drop-shadow(0 0 ${planet.size}px ${planet.color}40)`
              : `drop-shadow(0 0 ${planet.size / 3}px ${planet.color}60)`,
            rotate: isHovered ? 360 : 0,
          }}
          transition={{
            filter: { duration: 0.5 },
            rotate: { duration: 30, repeat: isHovered ? Number.POSITIVE_INFINITY : 0, ease: "linear" },
          }}
        >
          <img
            src={planet.image || "/placeholder.svg"}
            alt={planet.name}
            className="w-full h-full object-cover rounded-full"
            crossOrigin="anonymous"
            style={{
              filter: "brightness(1.1) contrast(1.1) saturate(1.2)",
            }}
          />
        </motion.div>
        <motion.h2
          className="text-white font-bold mb-4 tracking-wider"
          style={{
            fontSize: planet.name === "Sun" ? "3.5rem" : planet.size > 150 ? "3rem" : "2.5rem",
            lineHeight: 1.2,
          }}
          animate={{
            color: isHovered ? planet.color : "#ffffff",
            textShadow: isHovered ? `0 0 30px ${planet.color}90` : "0 0 10px rgba(255,255,255,0.3)",
          }}
        >
          {planet.name}
        </motion.h2>
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-gray-300 text-lg font-medium">
            {planet.distanceFromSun === 0
              ? "The center of our solar system"
              : `${planet.distanceFromSun.toLocaleString()} million km from Sun`}
          </p>
          <p className="text-blue-400 text-base font-light tracking-wide">Click to explore →</p>
        </motion.div>
      </div>
    </motion.div>
  )
}

function DistanceIndicator({
  fromPlanet,
  toPlanet,
}: { fromPlanet: (typeof planets)[0]; toPlanet: (typeof planets)[0] }) {
  const distance = toPlanet.distanceFromSun - fromPlanet.distanceFromSun
  const midPoint = fromPlanet.position + (toPlanet.position - fromPlanet.position) / 2

  return (
    <motion.div
      className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center z-10"
      style={{ top: `${midPoint}px` }}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-200px" }}
      transition={{ duration: 1, delay: 0.3 }}
    >
      {/* Vertical connecting line */}
      <div className="w-px h-32 bg-gradient-to-b from-transparent via-blue-400/60 to-transparent mb-4" />

      {/* Distance info box */}
      <motion.div
        className="bg-black/80 backdrop-blur-sm border border-blue-400/30 rounded-lg px-4 py-2 text-center glow-border"
        whileHover={{ scale: 1.05, borderColor: "rgba(59, 130, 246, 0.6)" }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-blue-400 text-xs font-medium mb-1 tracking-wider uppercase">Distance</div>
        <div className="text-white text-sm font-bold">{distance.toLocaleString()} million km</div>
        <div className="text-gray-400 text-xs mt-1 font-light">
          {fromPlanet.name} → {toPlanet.name}
        </div>
      </motion.div>

      {/* Bottom connecting line */}
      <div className="w-px h-32 bg-gradient-to-b from-transparent via-blue-400/60 to-transparent mt-4" />
    </motion.div>
  )
}

function DistanceTracker() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const [currentDistance, setCurrentDistance] = useState(0)

  const sunPosition = 1000 // Position of the Sun
  const maxDistance = 5906 // Pluto's distance from Sun

  useEffect(() => {
    const unsubscribe = scrollY.onChange((latest) => {
      // Only start counting distance after passing the Sun
      if (latest > sunPosition) {
        const scrollProgress = (latest - sunPosition) / (9600 - sunPosition) // 9600 is roughly Pluto's position
        const distance = Math.min(scrollProgress * maxDistance, maxDistance)
        setCurrentDistance(Math.round(distance))
      } else {
        setCurrentDistance(0)
      }
    })
    return unsubscribe
  }, [scrollY])

  const progressPercentage = (currentDistance / maxDistance) * 100

  return (
    <motion.div
      className="fixed top-8 right-8 bg-black/80 backdrop-blur-md border border-blue-500/30 rounded-2xl p-6 z-30 glow-border"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 2, duration: 0.8 }}
    >
      <div className="text-blue-400 text-sm font-medium mb-2 tracking-wider uppercase">Distance Traveled</div>
      <div className="text-3xl font-bold text-white mb-2 glow-text">{currentDistance.toLocaleString()}</div>
      <div className="text-xs text-gray-400 mb-4 font-light">million kilometers from Sun</div>

      {/* Vertical Progress Bar */}
      <div className="w-2 h-32 bg-gray-800 rounded-full overflow-hidden mx-auto">
        <motion.div
          className="w-full bg-gradient-to-t from-yellow-500 via-blue-500 to-purple-600 rounded-full"
          style={{ height: `${progressPercentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="text-xs text-gray-500 mt-2 text-center font-light">
        {Math.round(progressPercentage)}% complete
      </div>
    </motion.div>
  )
}

function ScrollHint() {
  const { scrollYProgress } = useScroll()
  const hintOpacity = useTransform(scrollYProgress, [0, 0.04], [1, 0])

  return (
    <motion.div
      className="fixed bottom-16 left-1/2 transform -translate-x-1/2 text-white text-center z-10"
      style={{ opacity: hintOpacity }}
      animate={{ y: [0, 20, 0] }}
      transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
    >
      <div className="text-xl mb-4 font-light tracking-wider">Scroll down to begin your journey</div>
      <motion.div
        className="text-4xl"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      >
        ↓
      </motion.div>
    </motion.div>
  )
}

export default function SpaceExploration() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const introOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0])
  const introScale = useTransform(scrollYProgress, [0, 0.08], [1, 0.6])

  // Progressive darkening as you move away from the Sun
  const darknessOverlay = useTransform(scrollYProgress, [0, 0.2, 0.6, 1], [0, 0.3, 0.7, 0.95])
  const backgroundBrightness = useTransform(scrollYProgress, [0, 0.3, 1], [1, 0.6, 0.2])

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth"
    return () => {
      document.documentElement.style.scrollBehavior = "auto"
    }
  }, [])

  return (
    <div ref={containerRef} className="relative min-h-screen" style={{ height: "12000px" }}>
      {/* Base black background */}
      <div className="fixed inset-0 bg-black" />

      {/* Progressive darkness overlay */}
      <motion.div className="fixed inset-0 bg-black z-5" style={{ opacity: darknessOverlay }} />

      {/* Additional deep space darkness */}
      <motion.div
        className="fixed inset-0 bg-gradient-to-b from-black/0 via-black/50 to-black/90 z-5"
        style={{ opacity: useTransform(scrollYProgress, [0.5, 1], [0, 1]) }}
      />

      <StarField />

      {/* Intro Section */}
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-20 pointer-events-none"
        style={{ opacity: introOpacity, scale: introScale }}
      >
        <div className="text-center">
          <motion.h1
            className="text-8xl md:text-9xl font-black text-white mb-8 tracking-wider glow-text"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          >
            EXPLORE SPACE
          </motion.h1>
          <motion.p
            className="text-2xl text-blue-300 font-light tracking-widest"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 1.2 }}
          >
            Journey through our solar system
          </motion.p>
        </div>
      </motion.div>

      <ScrollHint />
      <DistanceTracker />

      {/* Planets */}
      {planets.map((planet, index) => (
        <Planet key={planet.name} planet={planet} index={index} />
      ))}

      {/* Distance Indicators between planets */}
      {planets.slice(0, -1).map((planet, index) => (
        <DistanceIndicator key={`distance-${index}`} fromPlanet={planet} toPlanet={planets[index + 1]} />
      ))}

      {/* Journey Completion */}
      <motion.div
        className="absolute left-1/2 transform -translate-x-1/2 text-center"
        style={{ top: "11000px" }}
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5 }}
      >
        <h2 className="text-6xl font-black text-white mb-8 tracking-wider glow-text">MISSION COMPLETE</h2>
        <p className="text-gray-300 text-2xl mb-6 font-light">You've traveled 5.9 billion kilometers</p>
        <p className="text-blue-400 text-lg mb-12 font-light tracking-wide">
          From the blazing Sun to the distant dwarf planet Pluto
        </p>
        <motion.button
          className="px-12 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl rounded-full font-semibold tracking-wider hover:from-blue-700 hover:to-purple-700 transition-all duration-300 glow-border"
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          BEGIN AGAIN
        </motion.button>
      </motion.div>
    </div>
  )
}
