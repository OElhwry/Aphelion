"use client"

import { useEffect, useRef, useState, useCallback, type TouchEvent, type WheelEvent } from "react"
import { motion, useScroll, useTransform, AnimatePresence, useInView, useReducedMotion } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"
import { TourView } from "@/components/tour-view"
import { Planet3D } from "@/components/planet-3d"
import { AphelionLogo } from "@/components/aphelion-logo"
import { Ruler, Clock, Compass, ArrowDown, Thermometer, Moon as MoonIcon, Weight, Calendar, Star as StarIcon, type LucideIcon } from "lucide-react"

const SERIF_DETAIL = "'Playfair Display', 'Cormorant Garamond', 'Times New Roman', serif"

function getDetailStatIcon(label: string): LucideIcon {
  const l = label.toLowerCase()
  if (l.includes("diameter") || l.includes("size")) return Ruler
  if (l.includes("period") || l.includes("orbit") || l.includes("year") || l.includes("day")) return Clock
  if (l.includes("age")) return Calendar
  if (l.includes("distance")) return Compass
  if (l.includes("gravity")) return ArrowDown
  if (l.includes("temp")) return Thermometer
  if (l.includes("moon")) return MoonIcon
  if (l.includes("mass") || l.includes("weight")) return Weight
  return StarIcon
}

// ─── Types ───────────────────────────────────────────────────────────────────

type View = "intro" | "journey" | "planet"
type DetailTab = "info" | "quiz"

const NAV_STATE_KEY = "aphelion.nav-state"
const PLANET_PROGRESS_KEY = "aphelion.planet-progress"

type PlanetProgress = Record<string, { factsRead?: boolean; quizCompleted?: boolean }>

function triggerHaptic(pattern: number | number[] = 10) {
  if (typeof window === "undefined") return
  const isTouch = window.matchMedia("(pointer: coarse)").matches
  if (!isTouch || !("vibrate" in navigator)) return
  navigator.vibrate(pattern)
}

function readPlanetProgress(): PlanetProgress {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.sessionStorage.getItem(PLANET_PROGRESS_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as PlanetProgress
  } catch {
    return {}
  }
}

interface PersistedNavState {
  view: View
  exploreMode: "journey" | "orrery"
  selectedPlanetName: string | null
  focusedPlanetName?: string | null
}

function readPersistedNavState(): PersistedNavState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.sessionStorage.getItem(NAV_STATE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedNavState
    const viewOk = parsed.view === "intro" || parsed.view === "journey" || parsed.view === "planet"
    const modeOk = parsed.exploreMode === "journey" || parsed.exploreMode === "orrery"
    if (!viewOk || !modeOk) return null
    return parsed
  } catch {
    return null
  }
}

interface PlanetStat { label: string; value: string }
interface QuizQuestion {
  question: string
  options: string[]
  correct: number
  explanation: string
}
interface PlanetData {
  name: string
  color: string
  glowColor: string
  accentColor: string
  position: number     // scroll position in journey
  journeySize: number  // px, diameter in journey view
  detailSize: number   // px, diameter in detail view
  distanceFromSun: number // million km
  tagline: string
  stats: PlanetStat[]
  facts: string[]
  quiz: QuizQuestion[]
}

// ─── Planet data ─────────────────────────────────────────────────────────────

const PLANETS: PlanetData[] = [
  {
    name: "Sun",
    color: "#ff9100",
    glowColor: "#ff6d00",
    accentColor: "#ffd740",
    position: 1400,
    journeySize: 480,
    detailSize: 260,
    distanceFromSun: 0,
    tagline: "The blazing heart of our solar system",
    stats: [
      { label: "Diameter", value: "1,392,700 km" },
      { label: "Mass", value: "1.989 × 10³⁰ kg" },
      { label: "Surface Temp", value: "~5,500 °C" },
      { label: "Core Temp", value: "~15,000,000 °C" },
      { label: "Age", value: "4.6 billion years" },
      { label: "Type", value: "G-type Main Sequence" },
    ],
    facts: [
      "The Sun contains 99.86% of all the mass in the solar system.",
      "Light from the Sun takes exactly 8 minutes 20 seconds to reach Earth.",
      "Every second, the Sun converts 600 million tons of hydrogen into helium.",
    ],
    quiz: [
      {
        question: "How long does sunlight take to reach Earth?",
        options: ["8 seconds", "8 minutes 20 seconds", "80 minutes", "8 hours"],
        correct: 1,
        explanation: "Light travels at 300,000 km/s — the 150 million km gap takes about 8 min 20 s.",
      },
      {
        question: "What percentage of the solar system's mass does the Sun hold?",
        options: ["75%", "90%", "99.86%", "95%"],
        correct: 2,
        explanation: "At 99.86%, virtually all of the solar system's mass is in the Sun.",
      },
      {
        question: "What type of star is the Sun?",
        options: ["Red Giant", "White Dwarf", "G-type Main Sequence", "Neutron Star"],
        correct: 2,
        explanation: "Our Sun is a yellow dwarf — a G-type main-sequence star in the middle of its life.",
      },
      {
        question: "What is the approximate surface temperature of the Sun?",
        options: ["1,000 °C", "5,500 °C", "50,000 °C", "1,000,000 °C"],
        correct: 1,
        explanation: "The photosphere (visible surface) burns at roughly 5,500 °C.",
      },
      {
        question: "What process powers the Sun?",
        options: ["Nuclear fission", "Chemical combustion", "Nuclear fusion", "Gravitational collapse"],
        correct: 2,
        explanation: "Nuclear fusion fuses hydrogen nuclei into helium, releasing enormous energy.",
      },
    ],
  },
  {
    name: "Mercury",
    color: "#a0a0a0",
    glowColor: "#757575",
    accentColor: "#bdbdbd",
    position: 3200,
    journeySize: 165,
    detailSize: 180,
    distanceFromSun: 58,
    tagline: "The swift messenger, closest to the Sun",
    stats: [
      { label: "Diameter", value: "4,879 km" },
      { label: "Mass", value: "3.30 × 10²³ kg" },
      { label: "Moons", value: "0" },
      { label: "Orbital Period", value: "88 Earth days" },
      { label: "Surface Temp", value: "−180 to 430 °C" },
      { label: "Gravity", value: "3.7 m/s²" },
    ],
    facts: [
      "A year on Mercury lasts only 88 Earth days, but a day lasts 59 Earth days.",
      "Mercury has no atmosphere, so temperatures swing by over 600 °C.",
      "Despite being closest to the Sun, Venus is hotter than Mercury.",
    ],
    quiz: [
      {
        question: "How long is a year on Mercury?",
        options: ["365 days", "225 days", "88 days", "24 hours"],
        correct: 2,
        explanation: "Mercury completes one orbit around the Sun every 88 Earth days.",
      },
      {
        question: "How many moons does Mercury have?",
        options: ["1", "2", "0", "3"],
        correct: 2,
        explanation: "Mercury has no moons — its weak gravity cannot hold them.",
      },
      {
        question: "Which planet is actually hotter than Mercury despite being further from the Sun?",
        options: ["Mars", "Venus", "Earth", "Jupiter"],
        correct: 1,
        explanation: "Venus's thick CO₂ atmosphere traps heat, making it hotter than Mercury.",
      },
      {
        question: "What is Mercury's surface temperature range?",
        options: ["-10 to 50 °C", "-180 to 430 °C", "-50 to 200 °C", "0 to 300 °C"],
        correct: 1,
        explanation: "With no atmosphere to regulate temperature, Mercury swings from -180 °C at night to 430 °C during the day.",
      },
      {
        question: "What is the diameter of Mercury?",
        options: ["12,742 km", "4,879 km", "6,779 km", "2,376 km"],
        correct: 1,
        explanation: "Mercury is the smallest planet at just 4,879 km in diameter.",
      },
    ],
  },
  {
    name: "Venus",
    color: "#ffc107",
    glowColor: "#ff8f00",
    accentColor: "#ffee58",
    position: 4800,
    journeySize: 215,
    detailSize: 200,
    distanceFromSun: 108,
    tagline: "Shrouded in clouds, burning with secrets",
    stats: [
      { label: "Diameter", value: "12,104 km" },
      { label: "Mass", value: "4.87 × 10²⁴ kg" },
      { label: "Moons", value: "0" },
      { label: "Orbital Period", value: "225 Earth days" },
      { label: "Surface Temp", value: "~465 °C" },
      { label: "Gravity", value: "8.87 m/s²" },
    ],
    facts: [
      "Venus rotates backwards compared to most planets, so the Sun rises in the west.",
      "A day on Venus is longer than a year on Venus.",
      "Atmospheric pressure on Venus is 92 times that of Earth's surface.",
    ],
    quiz: [
      {
        question: "What is the average surface temperature of Venus?",
        options: ["100 °C", "200 °C", "465 °C", "1000 °C"],
        correct: 2,
        explanation: "Venus's thick CO₂ atmosphere creates a runaway greenhouse effect, heating the surface to ~465 °C.",
      },
      {
        question: "In which direction does the Sun rise on Venus?",
        options: ["East", "North", "West", "South"],
        correct: 2,
        explanation: "Venus rotates in retrograde, opposite to most planets, so the Sun rises in the west.",
      },
      {
        question: "How does Venus's atmospheric pressure compare to Earth's?",
        options: ["Same", "10× higher", "50× higher", "92× higher"],
        correct: 3,
        explanation: "Standing on Venus would feel like being 900 m underwater on Earth.",
      },
      {
        question: "How many moons does Venus have?",
        options: ["0", "1", "2", "5"],
        correct: 0,
        explanation: "Like Mercury, Venus has no moons.",
      },
      {
        question: "What is Venus sometimes called?",
        options: ["Red Planet", "Earth's Twin", "Ice Giant", "Morning Giant"],
        correct: 1,
        explanation: "Venus is called Earth's Twin because it's nearly the same size and mass as Earth.",
      },
    ],
  },
  {
    name: "Earth",
    color: "#29b6f6",
    glowColor: "#0277bd",
    accentColor: "#81d4fa",
    position: 6500,
    journeySize: 230,
    detailSize: 210,
    distanceFromSun: 150,
    tagline: "Our pale blue dot, the only known home for life",
    stats: [
      { label: "Diameter", value: "12,742 km" },
      { label: "Mass", value: "5.97 × 10²⁴ kg" },
      { label: "Moons", value: "1 (Moon)" },
      { label: "Orbital Period", value: "365.25 days" },
      { label: "Surface Temp", value: "avg +15 °C" },
      { label: "Gravity", value: "9.8 m/s²" },
    ],
    facts: [
      "Earth is the only planet in the solar system known to support life.",
      "71% of Earth's surface is covered in water.",
      "Earth's magnetic field protects us from the Sun's harmful radiation.",
    ],
    quiz: [
      {
        question: "What percentage of Earth's surface is covered by water?",
        options: ["50%", "60%", "71%", "85%"],
        correct: 2,
        explanation: "About 71% of Earth's surface is water — the remainder is land.",
      },
      {
        question: "How long does it take Earth to orbit the Sun once?",
        options: ["24 hours", "30 days", "365.25 days", "400 days"],
        correct: 2,
        explanation: "Earth's year is 365.25 days — the extra quarter day is why we have leap years every 4 years.",
      },
      {
        question: "What protects Earth from harmful solar radiation?",
        options: ["The ozone layer alone", "Earth's magnetic field", "The atmosphere only", "The Moon"],
        correct: 1,
        explanation: "Earth's magnetic field deflects solar wind and cosmic radiation, essential for sustaining life.",
      },
      {
        question: "What is Earth's average surface temperature?",
        options: ["-30 °C", "0 °C", "+15 °C", "+50 °C"],
        correct: 2,
        explanation: "Earth's global average temperature is about +15 °C, maintained by the greenhouse effect.",
      },
      {
        question: "How many natural moons does Earth have?",
        options: ["0", "1", "2", "3"],
        correct: 1,
        explanation: "Earth has one natural satellite — the Moon — which stabilises our axial tilt.",
      },
    ],
  },
  {
    name: "Mars",
    color: "#ef5350",
    glowColor: "#c62828",
    accentColor: "#ff8a65",
    position: 8000,
    journeySize: 195,
    detailSize: 190,
    distanceFromSun: 228,
    tagline: "The red frontier, humanity's next destination",
    stats: [
      { label: "Diameter", value: "6,779 km" },
      { label: "Mass", value: "6.39 × 10²³ kg" },
      { label: "Moons", value: "2 (Phobos & Deimos)" },
      { label: "Orbital Period", value: "687 Earth days" },
      { label: "Surface Temp", value: "−125 to +20 °C" },
      { label: "Gravity", value: "3.72 m/s²" },
    ],
    facts: [
      "Olympus Mons on Mars is the tallest volcano in the solar system at 21.9 km high.",
      "Valles Marineris on Mars is the longest canyon in the solar system, stretching 4,000 km.",
      "A day on Mars (called a sol) lasts 24 hours and 37 minutes, very close to an Earth day.",
    ],
    quiz: [
      {
        question: "What is the tallest volcano in the solar system, located on Mars?",
        options: ["Mauna Kea", "Olympus Mons", "Maxwell Montes", "Arsia Mons"],
        correct: 1,
        explanation: "Olympus Mons stands 21.9 km high — nearly 3× the height of Mount Everest.",
      },
      {
        question: "How many moons does Mars have?",
        options: ["0", "1", "2", "4"],
        correct: 2,
        explanation: "Mars has two small moons: Phobos and Deimos, likely captured asteroids.",
      },
      {
        question: "What gives Mars its red colour?",
        options: ["Red rocks", "Iron oxide (rust) in the soil", "Volcanic ash", "Red atmosphere"],
        correct: 1,
        explanation: "The Martian soil is rich in iron oxide (rust), giving it the distinctive red hue.",
      },
      {
        question: "How long is a Martian day (sol)?",
        options: ["12 hours", "24 hours exactly", "24 hours 37 minutes", "48 hours"],
        correct: 2,
        explanation: "A sol is 24 hours and 37 minutes — making Mars have the most Earth-like day in the solar system.",
      },
      {
        question: "What is Valles Marineris?",
        options: ["A volcano", "A polar ice cap", "The solar system's longest canyon", "A Martian sea"],
        correct: 2,
        explanation: "Valles Marineris stretches 4,000 km — ten times longer than the Grand Canyon.",
      },
    ],
  },
  {
    name: "Jupiter",
    color: "#c49a3c",
    glowColor: "#a07828",
    accentColor: "#ffe082",
    position: 9600,
    journeySize: 430,
    detailSize: 270,
    distanceFromSun: 778,
    tagline: "King of planets, a churning world of storms",
    stats: [
      { label: "Diameter", value: "139,820 km" },
      { label: "Mass", value: "1.898 × 10²⁷ kg" },
      { label: "Moons", value: "95+" },
      { label: "Orbital Period", value: "11.86 Earth years" },
      { label: "Surface Temp", value: "~−110 °C" },
      { label: "Gravity", value: "24.8 m/s²" },
    ],
    facts: [
      "Jupiter's Great Red Spot is a storm that has raged for over 350 years.",
      "Jupiter is so massive that all other planets could fit inside it.",
      "Jupiter's moon Europa is one of the best candidates for extraterrestrial life.",
    ],
    quiz: [
      {
        question: "What is the Great Red Spot on Jupiter?",
        options: ["A volcano", "A continent", "A storm that has lasted 350+ years", "A moon"],
        correct: 2,
        explanation: "The Great Red Spot is an enormous anticyclonic storm, larger than Earth, raging for centuries.",
      },
      {
        question: "How many moons does Jupiter have?",
        options: ["4", "27", "60", "95+"],
        correct: 3,
        explanation: "Jupiter has over 95 confirmed moons, including the four large Galilean moons.",
      },
      {
        question: "Which of Jupiter's moons is considered a prime candidate for extraterrestrial life?",
        options: ["Io", "Ganymede", "Callisto", "Europa"],
        correct: 3,
        explanation: "Europa has a subsurface liquid ocean beneath its icy shell, making it a top candidate for life.",
      },
      {
        question: "How does Jupiter's diameter compare to Earth's?",
        options: ["2× larger", "5× larger", "11× larger", "20× larger"],
        correct: 2,
        explanation: "Jupiter's diameter is about 11 times that of Earth — you could fit over 1,300 Earths inside it.",
      },
      {
        question: "What is Jupiter primarily composed of?",
        options: ["Rock and metal", "Ice and rock", "Hydrogen and helium", "Carbon dioxide"],
        correct: 2,
        explanation: "Jupiter is a gas giant made mostly of hydrogen and helium — similar to the Sun.",
      },
    ],
  },
  {
    name: "Saturn",
    color: "#d4a94a",
    glowColor: "#a07828",
    accentColor: "#ffe0a0",
    position: 11700,
    journeySize: 380,
    detailSize: 250,
    distanceFromSun: 1432,
    tagline: "The jewel of the solar system",
    stats: [
      { label: "Diameter", value: "116,460 km" },
      { label: "Mass", value: "5.68 × 10²⁶ kg" },
      { label: "Moons", value: "146+" },
      { label: "Orbital Period", value: "29.5 Earth years" },
      { label: "Surface Temp", value: "~−178 °C" },
      { label: "Gravity", value: "10.4 m/s²" },
    ],
    facts: [
      "Saturn's rings are made of billions of ice and rock particles, some as small as dust.",
      "Saturn is the least dense planet in the solar system, so light it would float on water.",
      "Saturn's moon Titan has a thick atmosphere and liquid methane lakes.",
    ],
    quiz: [
      {
        question: "What are Saturn's rings primarily made of?",
        options: ["Gas and dust", "Ice and rock particles", "Molten lava", "Metal"],
        correct: 1,
        explanation: "Saturn's rings are composed of billions of pieces of ice and rock, ranging from dust-sized to metres across.",
      },
      {
        question: "Which property makes Saturn unique among all planets?",
        options: ["It has rings", "It would float on water", "It has the most moons", "It's the coldest planet"],
        correct: 1,
        explanation: "Saturn's average density is 0.687 g/cm³ — lower than water (1 g/cm³), meaning it would float.",
      },
      {
        question: "Which of Saturn's moons has liquid lakes on its surface?",
        options: ["Enceladus", "Titan", "Rhea", "Dione"],
        correct: 1,
        explanation: "Titan has liquid methane and ethane lakes on its surface, and a thick nitrogen atmosphere.",
      },
      {
        question: "How long does Saturn take to orbit the Sun?",
        options: ["11.86 years", "29.5 years", "84 years", "165 years"],
        correct: 1,
        explanation: "Saturn completes one orbit around the Sun every 29.5 Earth years.",
      },
      {
        question: "How many confirmed moons does Saturn have?",
        options: ["27", "79", "95", "146+"],
        correct: 3,
        explanation: "Saturn has the most moons of any planet — over 146 confirmed as of recent surveys.",
      },
    ],
  },
  {
    name: "Uranus",
    color: "#4dd0e1",
    glowColor: "#00838f",
    accentColor: "#b2ebf2",
    position: 13500,
    journeySize: 280,
    detailSize: 220,
    distanceFromSun: 2867,
    tagline: "The tilted ice giant, rolling through space",
    stats: [
      { label: "Diameter", value: "50,724 km" },
      { label: "Mass", value: "8.68 × 10²⁵ kg" },
      { label: "Moons", value: "27+" },
      { label: "Orbital Period", value: "84 Earth years" },
      { label: "Surface Temp", value: "~−224 °C" },
      { label: "Gravity", value: "8.87 m/s²" },
    ],
    facts: [
      "Uranus rotates on its side, with an axial tilt of 98 degrees.",
      "Uranus has the coldest atmosphere in the solar system, dipping to around 224 °C below zero.",
      "A single season on Uranus lasts over 20 Earth years.",
    ],
    quiz: [
      {
        question: "What is unusual about Uranus's rotation?",
        options: ["It doesn't rotate", "It rotates on its side (98° tilt)", "It rotates backwards", "It rotates very slowly"],
        correct: 1,
        explanation: "Uranus's axial tilt of 98° means it essentially rolls around the Sun on its side.",
      },
      {
        question: "What is the coldest temperature recorded in Uranus's atmosphere?",
        options: ["-100 °C", "-178 °C", "-224 °C", "-270 °C"],
        correct: 2,
        explanation: "Uranus holds the record for the coldest planetary atmosphere at -224 °C.",
      },
      {
        question: "How long does one season last on Uranus?",
        options: ["3 months", "1 year", "20+ years", "84 years"],
        correct: 2,
        explanation: "Because Uranus's year is 84 Earth years and its tilt is extreme, each season lasts over 20 years.",
      },
      {
        question: "What type of planet is Uranus?",
        options: ["Gas giant", "Rocky planet", "Ice giant", "Dwarf planet"],
        correct: 2,
        explanation: "Uranus and Neptune are classified as ice giants — their interiors are rich in water, ammonia, and methane ices.",
      },
      {
        question: "How many moons does Uranus have?",
        options: ["2", "14", "27+", "95+"],
        correct: 2,
        explanation: "Uranus has 27 known moons, all named after characters from Shakespeare and Alexander Pope.",
      },
    ],
  },
  {
    name: "Neptune",
    color: "#3f51b5",
    glowColor: "#1a237e",
    accentColor: "#9fa8da",
    position: 15200,
    journeySize: 265,
    detailSize: 215,
    distanceFromSun: 4515,
    tagline: "The dark, windswept edge of the solar system",
    stats: [
      { label: "Diameter", value: "49,244 km" },
      { label: "Mass", value: "1.024 × 10²⁶ kg" },
      { label: "Moons", value: "16+" },
      { label: "Orbital Period", value: "165 Earth years" },
      { label: "Surface Temp", value: "~−218 °C" },
      { label: "Gravity", value: "11.15 m/s²" },
    ],
    facts: [
      "Neptune has the strongest winds in the solar system, reaching speeds of 2,100 km/h.",
      "Neptune was the first planet located through mathematical prediction rather than observation.",
      "Neptune's moon Triton orbits backwards and will eventually be torn apart into a ring.",
    ],
    quiz: [
      {
        question: "What is remarkable about Neptune's winds?",
        options: ["They are calm", "They reach up to 2,100 km/h", "They blow in circles", "They carry methane rain"],
        correct: 1,
        explanation: "Neptune's winds are the fastest in the solar system, reaching 2,100 km/h — faster than sound on Earth.",
      },
      {
        question: "How was Neptune discovered?",
        options: ["Telescope observation", "Mathematical prediction", "By accident", "Spacecraft flyby"],
        correct: 1,
        explanation: "Neptune was first located in 1846 using predictions based on gravitational perturbations of Uranus.",
      },
      {
        question: "How long is Neptune's year?",
        options: ["29.5 Earth years", "84 Earth years", "165 Earth years", "248 Earth years"],
        correct: 2,
        explanation: "Neptune takes 165 Earth years to orbit the Sun once — it only completed its first known orbit in 2011.",
      },
      {
        question: "What is notable about Neptune's moon Triton?",
        options: ["It is the largest moon", "It orbits backwards", "It has liquid water", "It has active volcanoes"],
        correct: 1,
        explanation: "Triton orbits Neptune in the opposite direction to Neptune's rotation — suggesting it was captured.",
      },
      {
        question: "What type of planet is Neptune?",
        options: ["Gas giant", "Rocky planet", "Ice giant", "Dwarf planet"],
        correct: 2,
        explanation: "Neptune is an ice giant alongside Uranus, composed mainly of water, ammonia, and methane ices.",
      },
    ],
  },
  {
    name: "Pluto",
    color: "#a1887f",
    glowColor: "#6d4c41",
    accentColor: "#d7ccc8",
    position: 16600,
    journeySize: 130,
    detailSize: 160,
    distanceFromSun: 5906,
    tagline: "The distant dwarf, small but mighty",
    stats: [
      { label: "Diameter", value: "2,376 km" },
      { label: "Mass", value: "1.303 × 10²² kg" },
      { label: "Moons", value: "5 (largest: Charon)" },
      { label: "Orbital Period", value: "248 Earth years" },
      { label: "Surface Temp", value: "~−230 °C" },
      { label: "Gravity", value: "0.62 m/s²" },
    ],
    facts: [
      "Pluto was reclassified as a dwarf planet in 2006 by the International Astronomical Union.",
      "Pluto's largest moon Charon is so big relative to Pluto that they orbit each other.",
      "NASA's New Horizons spacecraft delivered the first detailed images of Pluto in 2015.",
    ],
    quiz: [
      {
        question: "In what year was Pluto reclassified as a dwarf planet?",
        options: ["1996", "2001", "2006", "2015"],
        correct: 2,
        explanation: "The IAU reclassified Pluto in 2006, defining a new category of dwarf planets.",
      },
      {
        question: "What is the name of Pluto's largest moon?",
        options: ["Triton", "Titan", "Charon", "Hydra"],
        correct: 2,
        explanation: "Charon is so large relative to Pluto (half its diameter) that they're sometimes called a double dwarf planet.",
      },
      {
        question: "Which mission gave us close-up images of Pluto in 2015?",
        options: ["Voyager 2", "Cassini", "New Horizons", "Pioneer 10"],
        correct: 2,
        explanation: "NASA's New Horizons made a historic flyby on July 14, 2015, revealing Pluto's heart-shaped plain.",
      },
      {
        question: "How long does Pluto take to orbit the Sun?",
        options: ["84 years", "165 years", "200 years", "248 years"],
        correct: 3,
        explanation: "Pluto's year is 248 Earth years — it hasn't completed a full orbit since its discovery in 1930.",
      },
      {
        question: "Approximately how cold is Pluto's surface?",
        options: ["-100 °C", "-178 °C", "-230 °C", "-270 °C"],
        correct: 2,
        explanation: "Pluto's surface temperature averages -230 °C — just 43 degrees above absolute zero.",
      },
    ],
  },
]

// ─── CSS Planet Visual Styles ─────────────────────────────────────────────────

const PLANET_BG: Record<string, { bg: string; insetShadow: string }> = {
  Sun: {
    bg: `radial-gradient(circle at 38% 32%, #fffde7 0%, #fff59d 8%, #ffd740 20%, #ff9100 44%, #e65100 65%, #bf360c 82%, #7f1d05 100%)`,
    insetShadow: "",
  },
  Mercury: {
    bg: `radial-gradient(circle at 35% 30%, #e0e0e0 0%, #bdbdbd 20%, #9e9e9e 40%, #616161 65%, #424242 82%, #1a1a1a 100%)`,
    insetShadow: "inset -6px -5px 18px rgba(0,0,0,0.7)",
  },
  Venus: {
    bg: `radial-gradient(circle at 38% 32%, #fff9c4 0%, #ffee58 14%, #ffc107 34%, #ff8f00 58%, #e65100 78%, #bf360c 100%)`,
    insetShadow: "inset -6px -5px 18px rgba(0,0,0,0.5)",
  },
  Earth: {
    bg: `radial-gradient(circle at 38% 32%, #b3e5fc 0%, #4fc3f7 12%, #0277bd 28%, #01579b 42%, #1b5e20 54%, #2e7d32 64%, #0d47a1 78%, #0d1b4f 100%)`,
    insetShadow: "inset -6px -5px 18px rgba(0,0,0,0.5)",
  },
  Mars: {
    bg: `radial-gradient(circle at 38% 30%, #ff8a65 0%, #f4511e 18%, #d84315 38%, #bf360c 58%, #8d1f00 78%, #4a0f00 100%)`,
    insetShadow: "inset -6px -5px 18px rgba(0,0,0,0.6)",
  },
  Jupiter: {
    bg: `
      repeating-linear-gradient(
        0deg,
        rgba(180,138,70,0.55) 0%, rgba(180,138,70,0.55) 9%,
        rgba(90,60,20,0.5) 9%, rgba(90,60,20,0.5) 18%,
        rgba(220,185,110,0.55) 18%, rgba(220,185,110,0.55) 27%,
        rgba(130,90,35,0.5) 27%, rgba(130,90,35,0.5) 36%,
        rgba(200,165,90,0.55) 36%, rgba(200,165,100,0.55) 45%,
        rgba(100,68,24,0.5) 45%, rgba(100,68,24,0.5) 54%,
        rgba(210,175,100,0.55) 54%, rgba(210,175,100,0.55) 63%,
        rgba(120,82,30,0.5) 63%, rgba(120,82,30,0.5) 72%,
        rgba(195,160,88,0.55) 72%, rgba(195,160,88,0.55) 81%,
        rgba(110,75,26,0.5) 81%, rgba(110,75,26,0.5) 90%,
        rgba(190,155,85,0.55) 90%, rgba(190,155,85,0.55) 100%
      ),
      radial-gradient(circle at 38% 32%, #fff8e1 0%, #ffe082 14%, #ffca28 28%, #c49a3c 48%, #8b6914 68%, #5d4037 85%, #3e2723 100%)
    `,
    insetShadow: "inset -8px -6px 22px rgba(0,0,0,0.55)",
  },
  Saturn: {
    bg: `radial-gradient(circle at 38% 32%, #fff9e6 0%, #ffe0a0 14%, #d4a94a 34%, #a07828 54%, #7a5c1e 74%, #4a3612 100%)`,
    insetShadow: "inset -6px -5px 18px rgba(0,0,0,0.55)",
  },
  Uranus: {
    bg: `radial-gradient(circle at 38% 32%, #e8f8ff 0%, #b2ebf2 14%, #4dd0e1 28%, #00acc1 48%, #00838f 68%, #004d40 86%, #002b36 100%)`,
    insetShadow: "inset -6px -5px 18px rgba(0,0,0,0.5)",
  },
  Neptune: {
    bg: `radial-gradient(circle at 38% 32%, #e8eaf6 0%, #9fa8da 12%, #3949ab 26%, #1a237e 46%, #0d1470 64%, #050a4a 82%, #020520 100%)`,
    insetShadow: "inset -6px -5px 18px rgba(0,0,0,0.6)",
  },
  Pluto: {
    bg: `radial-gradient(circle at 38% 32%, #efebe9 0%, #d7ccc8 18%, #bcaaa4 38%, #8d6e63 58%, #6d4c41 76%, #3e2723 100%)`,
    insetShadow: "inset -5px -4px 14px rgba(0,0,0,0.65)",
  },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarField() {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.9, 1], [1, 0.6, 0.2])
  const stars = useRef(
    Array.from({ length: 350 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.8 + 0.2,
      delay: Math.random() * 6,
      dur: Math.random() * 4 + 4,
    }))
  )

  return (
    <motion.div className="fixed inset-0 pointer-events-none z-0" style={{ opacity }}>
      {stars.current.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, opacity: s.opacity }}
          animate={{ opacity: [s.opacity, s.opacity * 0.3, s.opacity] }}
          transition={{ duration: s.dur, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
        />
      ))}
    </motion.div>
  )
}

function CSSPlanet({ name, size, animate: doAnimate = false }: { name: string; size: number; animate?: boolean }) {
  const visual = PLANET_BG[name] ?? PLANET_BG.Mercury
  const planet = PLANETS.find((p) => p.name === name)!

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at center, ${planet.color}22 0%, transparent 70%)`,
          transform: "scale(1.6)",
        }}
      />
      {/* Sun pulse rings */}
      {name === "Sun" && (
        <>
          <div className="pulse-ring absolute inset-0 rounded-full border border-orange-400/30" style={{ animationDelay: "0s" }} />
          <div className="pulse-ring absolute inset-0 rounded-full border border-yellow-500/20" style={{ animationDelay: "1.2s" }} />
        </>
      )}
      {/* Saturn ring — behind planet */}
      {name === "Saturn" && (
        <div
          className="absolute"
          style={{
            width: size * 2.4,
            height: size * 0.28,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotateX(72deg)",
            borderRadius: "50%",
            background: `radial-gradient(ellipse at center,
              transparent 34%,
              rgba(212,169,74,0.15) 37%,
              rgba(200,158,62,0.55) 43%,
              rgba(215,180,90,0.75) 50%,
              rgba(185,148,58,0.55) 57%,
              rgba(165,128,45,0.35) 63%,
              rgba(140,105,30,0.15) 68%,
              transparent 72%
            )`,
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
      )}
      {/* Uranus ring */}
      {name === "Uranus" && (
        <div
          className="absolute"
          style={{
            width: size * 1.9,
            height: size * 0.12,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotateX(15deg) rotateZ(5deg)",
            borderRadius: "50%",
            background: `radial-gradient(ellipse at center,
              transparent 40%,
              rgba(77,208,225,0.12) 44%,
              rgba(77,208,225,0.3) 50%,
              rgba(77,208,225,0.12) 56%,
              transparent 60%
            )`,
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
      )}
      {/* Planet sphere */}
      <motion.div
        className="relative rounded-full z-10"
        style={{
          width: size,
          height: size,
          background: visual.bg,
          boxShadow: `${visual.insetShadow}${visual.insetShadow ? ", " : ""}0 0 ${size * 0.3}px ${planet.glowColor}99, 0 0 ${size * 0.6}px ${planet.glowColor}44`,
        }}
        animate={doAnimate ? { rotate: 360 } : undefined}
        transition={doAnimate ? { duration: 80, repeat: Infinity, ease: "linear" } : undefined}
      />
    </div>
  )
}

// ─── Intro Screen ─────────────────────────────────────────────────────────────

function IntroScreen({
  onEnter,
  resumeLabel,
  onResume,
}: {
  onEnter: () => void
  resumeLabel?: string | null
  onResume?: () => void
}) {
  const [entering, setEntering] = useState(false)
  const scrollIntent = useRef(0)
  const touchStartY = useRef<number | null>(null)
  const prefersReducedMotion = useReducedMotion()

  const startJourney = useCallback(() => {
    if (entering) return
    triggerHaptic([8, 20, 8])
    setEntering(true)
    window.setTimeout(() => onEnter(), prefersReducedMotion ? 120 : 1450)
  }, [entering, onEnter, prefersReducedMotion])

  const handleWheelEnter = useCallback((e: WheelEvent<HTMLDivElement>) => {
    if (entering) return
    if (e.deltaY <= 0) return
    scrollIntent.current += e.deltaY
    if (scrollIntent.current > 140) startJourney()
  }, [entering, startJourney])

  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (entering) return
    touchStartY.current = e.changedTouches[0]?.clientY ?? null
  }, [entering])

  const handleTouchEnd = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (entering) return
    if (touchStartY.current === null) return
    const endY = e.changedTouches[0]?.clientY ?? touchStartY.current
    const deltaY = endY - touchStartY.current
    // Accept deliberate vertical swipes in either direction for mobile onboarding.
    if (Math.abs(deltaY) > 70) startJourney()
    touchStartY.current = null
  }, [entering, startJourney])

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-[#030710] text-white"
      onWheel={handleWheelEnter}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: "none" }}
    >
      {/* Deep space background + vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(20,56,110,0.28)_0%,rgba(3,7,16,0.96)_55%,#02050b_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(35,81,162,0.22)_0%,transparent_52%)]" />

      {/* Earth scene; starts as "above Earth" and descends on enter */}
      <motion.div
        className="absolute inset-0"
        style={{ willChange: "transform" }}
        animate={entering ? (prefersReducedMotion ? { opacity: 1 } : { scale: 1.46, y: -180 }) : { scale: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0.2 : 1.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <Planet3D
          name="earth"
          showStars
          enableControls={false}
          enableZoom={false}
          autoRotate
          rotationSpeed={0.04}
          position={[0, -1.34, 0]}
          cameraZ={2.95}
        />
      </motion.div>

      {/* Click hotspot over Earth so clicking the planet also starts journey */}
      <button
        aria-label="Enter Earth journey"
        onClick={startJourney}
        className="absolute bottom-0 left-1/2 z-20 h-[42vh] w-[68vw] -translate-x-1/2 rounded-full"
        style={{ cursor: "pointer", background: "transparent" }}
      />

      {/* Readability overlays */}
      <motion.div
        className="absolute inset-0 z-10 bg-[linear-gradient(to_bottom,rgba(2,7,16,0.28)_0%,rgba(2,7,16,0.58)_46%,rgba(2,7,16,0.9)_100%)]"
        animate={entering ? { opacity: 0.2 } : { opacity: 1 }}
        transition={{ duration: 1.2 }}
      />
      <motion.div
        className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_28%,rgba(2,7,16,0.5)_70%,rgba(2,7,16,0.92)_100%)]"
        animate={entering ? { opacity: 0.5 } : { opacity: 1 }}
        transition={{ duration: 1.2 }}
      />

      {/* Hero copy + CTA */}
      <motion.div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center"
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
        animate={entering ? (prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -28 }) : { opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0.18 : 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="text-[10px] tracking-[0.38em] text-white/75 sm:text-xs">SOLAR SYSTEM EXPLORER</div>
        <h1
          className="mt-2 text-white/95"
          style={{
            fontFamily: SERIF_DETAIL,
            fontSize: "clamp(3rem, 8vw, 5.4rem)",
            letterSpacing: "0.2em",
            lineHeight: 1,
          }}
        >
          APHELION
        </h1>
        <div className="mt-4 h-px w-12 bg-cyan-300/90" />
        <p className="mt-5 max-w-2xl text-xs leading-relaxed text-white/70 sm:text-sm">
          Explore the solar system through a cinematic, interactive journey. Discover each world,
          learn key facts, and test your knowledge with quizzes as you travel from the Sun to Pluto.
        </p>

        <motion.button
          className="mt-8 rounded-full border border-white/25 bg-white px-8 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-black shadow-[0_0_45px_rgba(80,170,255,0.25)] transition hover:bg-white/90 sm:px-10"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={startJourney}
          disabled={entering}
        >
          {entering ? "Entering..." : "Get Started"}
        </motion.button>

        <div className="mt-5 text-[10px] uppercase tracking-[0.28em] text-white/45">
          or scroll / swipe to begin
        </div>

        {resumeLabel && onResume && (
          <button
            onClick={() => {
              triggerHaptic(10)
              onResume()
            }}
            className="mt-4 min-h-9 rounded-full border border-cyan-200/30 bg-cyan-300/10 px-3.5 text-[10px] uppercase tracking-[0.18em] text-cyan-100/90 transition hover:bg-cyan-300/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80"
            aria-label={`Resume journey ${resumeLabel}`}
          >
            Resume Journey {resumeLabel}
          </button>
        )}
      </motion.div>
    </div>
  )
}

// ─── Distance Tracker HUD ─────────────────────────────────────────────────────
// Rendered at the root level so it never unmounts during journey scrolling.

function DistanceHUD() {
  const isMobile = useIsMobile()
  const { scrollY } = useScroll()
  const [dist, setDist] = useState(0)
  const [currentPlanet, setCurrentPlanet] = useState(PLANETS[0])
  const maxDist = 5906

  useEffect(() => {
    // Immediately read current scroll on mount so HUD is correct if user is mid-scroll
    const read = (y: number) => {
      const sunPos = PLANETS[0].position
      const plutoPos = PLANETS[PLANETS.length - 1].position
      if (y > sunPos) {
        const pct = Math.min((y - sunPos) / (plutoPos - sunPos), 1)
        setDist(Math.round(pct * maxDist))
        const p = [...PLANETS].reverse().find((pl) => y >= pl.position - 300)
        if (p) setCurrentPlanet(p)
      } else {
        setDist(0)
        setCurrentPlanet(PLANETS[0])
      }
    }
    read(scrollY.get())
    return scrollY.on("change", read)
  }, [scrollY])

  const pct = Math.min((dist / maxDist) * 100, 100)

  return (
    <div
      className="hud-border scanline rounded-xl sm:rounded-2xl bg-black/85 backdrop-blur-xl select-none"
      style={{
        position: "fixed",
        top: isMobile ? 64 : 76,
        right: isMobile ? 8 : 20,
        width: isMobile ? 158 : 216,
        padding: isMobile ? "10px 12px" : "20px",
        zIndex: 9999,
      }}
    >
      {/* Planet colour accent bar */}
      <div className="h-0.5 w-full rounded-full mb-3 transition-all duration-700"
        style={{ background: `linear-gradient(90deg, ${currentPlanet.color}, transparent)` }} />

      <div className="text-[9px] text-cyan-400/60 tracking-[0.3em] mb-1" style={{ fontFamily: "var(--font-orbitron)" }}>
        DISTANCE TRAVELED
      </div>
      <div
        className="text-2xl font-black text-white mb-0.5 tabular-nums"
        style={{ fontFamily: "var(--font-orbitron)", textShadow: "0 0 15px #00d4ff60" }}
      >
        {dist.toLocaleString()}
      </div>
      <div className="text-[9px] text-slate-500 mb-4" style={{ fontFamily: "var(--font-orbitron)" }}>MILLION KM FROM SUN</div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #ffd700 0%, #00d4ff 55%, #7c3aed 100%)",
          }}
        />
      </div>

      <div className="flex justify-between items-center">
        <div className="text-[9px] tracking-widest transition-colors duration-500"
          style={{ fontFamily: "var(--font-orbitron)", color: currentPlanet.accentColor }}>
          {currentPlanet.name.toUpperCase()}
        </div>
        <div className="text-[9px] text-slate-500" style={{ fontFamily: "var(--font-orbitron)" }}>
          {Math.round(pct)}%
        </div>
      </div>
    </div>
  )
}

// ─── Journey planet card ──────────────────────────────────────────────────────

function JourneyPlanet({ planet, onSelect }: { planet: PlanetData; index?: number; onSelect: () => void }) {
  const isMobile = useIsMobile()
  const [hovered, setHovered] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-180px" })
  // Scale planets down on mobile to prevent overflow and maintain proportion
  const size = isMobile ? Math.min(planet.journeySize, 220) : planet.journeySize

  // 3 most interesting stats to show inline
  const featuredStats = planet.stats.slice(0, 3)

  return (
    <div
      ref={sectionRef}
      className="absolute"
      style={{
        top: planet.position,
        left: "50%",
        transform: "translateX(-50%)",
        width: `min(${Math.max(size + 100, 300)}px, calc(100vw - 16px))`,
      }}
    >
      {/* ── Ambient glow burst on entry ── */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size * 2.2,
          height: size * 2.2,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${planet.color}18 0%, transparent 65%)`,
        }}
        initial={{ opacity: 0, scale: 0.4 }}
        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
        transition={{ duration: 1.6, ease: "easeOut" }}
      />

      {/* ── Planet sphere (clickable) ── */}
      <motion.div
        className="flex flex-col items-center cursor-pointer relative z-10"
        initial={{ opacity: 0, y: 60 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
        transition={{ duration: 1, delay: 0.1, type: "spring", stiffness: 65, damping: 18 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onSelect}
      >
        {/* Planet visual */}
        <div
          style={{
            transition: "transform 0.45s cubic-bezier(0.34,1.56,0.64,1)",
            transform: hovered ? "scale(1.1) translateY(-12px)" : "scale(1) translateY(0)",
            willChange: "transform",
          }}
        >
          <CSSPlanet name={planet.name} size={size} />
        </div>

        {/* Name */}
        <h2
          className="mt-6 font-black tracking-widest text-center"
          style={{
            fontFamily: "var(--font-orbitron)",
            fontSize: size > 300 ? "2.4rem" : size > 180 ? "1.9rem" : "1.35rem",
            color: hovered ? planet.accentColor : "#ffffff",
            textShadow: hovered ? `0 0 32px ${planet.color}cc` : "none",
            transition: "color 0.3s, text-shadow 0.3s",
          }}
        >
          {planet.name}
        </h2>

        {/* Tagline */}
        <motion.p
          className="mt-2 text-center"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(0.8rem, 1.5vw, 0.95rem)",
            color: "rgba(148,163,184,0.7)",
            fontWeight: 300,
          }}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.5 }}
        >
          {planet.tagline}
        </motion.p>

        {/* Hover tooltip — absolutely positioned, pointer-events:none → no flicker */}
        <div
          className="absolute flex flex-col items-center gap-2"
          style={{
            top: size + 90,
            left: "50%",
            transform: "translateX(-50%)",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.2s ease",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          <p className="text-slate-300 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
            {planet.distanceFromSun === 0
              ? "Center of our solar system"
              : `${planet.distanceFromSun.toLocaleString()} million km from Sun`}
          </p>
          <div
            className="px-5 py-1.5 rounded-full text-xs tracking-widest border"
            style={{
              fontFamily: "var(--font-orbitron)",
              color: planet.accentColor,
              borderColor: `${planet.color}70`,
              background: `${planet.color}18`,
            }}
          >
            CLICK TO EXPLORE →
          </div>
        </div>
      </motion.div>

      {/* ── Stats cards — stagger in after planet appears ── */}
      <div className="flex justify-center gap-3 mt-8 flex-wrap">
        {featuredStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="rounded-xl px-5 py-3 text-center"
            style={{
              background: `${planet.color}0d`,
              border: `1px solid ${planet.color}28`,
              minWidth: 110,
            }}
            initial={{ opacity: 0, y: 18 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            transition={{ duration: 0.55, delay: 0.55 + i * 0.12 }}
          >
            <div
              className="text-[9px] tracking-[0.25em] mb-1"
              style={{ fontFamily: "var(--font-orbitron)", color: `${planet.accentColor}80` }}
            >
              {stat.label.toUpperCase()}
            </div>
            <div
              className="font-semibold"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "clamp(0.7rem, 1.4vw, 0.82rem)",
                color: "rgba(226,232,240,0.92)",
              }}
            >
              {stat.value}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Distance line between planets ────────────────────────────────────────────

function DistanceLine({ from, to }: { from: PlanetData; to: PlanetData }) {
  const dist = to.distanceFromSun - from.distanceFromSun
  // Position the indicator at the vertical midpoint between bottom-of-from and top-of-to
  const bottomOfFrom = from.position + from.journeySize + 50
  const topOfTo = to.position - 50
  const mid = (bottomOfFrom + topOfTo) / 2

  return (
    <motion.div
      className="absolute flex flex-col items-center z-10"
      style={{
        top: mid,
        left: "50%",
        transform: "translateX(-50%)",
      }}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7 }}
    >
      <div className="w-px h-12 bg-gradient-to-b from-transparent via-cyan-500/25 to-transparent" />
      <div
        className="my-2 px-4 py-2 rounded-xl text-center hud-border bg-black/70 backdrop-blur-sm"
        style={{ minWidth: 170 }}
      >
        <div className="text-[9px] text-cyan-400/50 tracking-[0.3em] mb-0.5" style={{ fontFamily: "var(--font-orbitron)" }}>DISTANCE</div>
        <div className="text-white text-xs font-semibold" style={{ fontFamily: "var(--font-orbitron)" }}>
          {dist.toLocaleString()} M KM
        </div>
        <div className="text-[9px] text-slate-500 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
          {from.name} → {to.name}
        </div>
      </div>
      <div className="w-px h-12 bg-gradient-to-b from-transparent via-cyan-500/25 to-transparent" />
    </motion.div>
  )
}

// ─── Journey View ─────────────────────────────────────────────────────────────
// DistanceHUD is NOT rendered here — it lives at root level so it never remounts.

function JourneyView({ onSelectPlanet }: { onSelectPlanet: (p: PlanetData) => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] })

  const introOpacity = useTransform(scrollYProgress, [0, 0.04], [1, 0])
  const darkness = useTransform(scrollYProgress, [0, 0.1, 0.65, 1], [0, 0.1, 0.5, 0.82])

  return (
    <div ref={containerRef} className="relative" style={{ height: "20500px" }}>
      {/* Base background */}
      <div className="fixed inset-0" style={{ background: "#000510" }} />

      {/* Progressive darkness as we move into deep space */}
      <motion.div className="fixed inset-0 bg-black z-[1]" style={{ opacity: darkness }} />

      {/* Nebula colour washes — give each zone a subtle tint */}
      <div className="fixed inset-0 pointer-events-none z-[1]"
        style={{ background: "radial-gradient(ellipse 80% 40% at 60% 20%, rgba(59,130,246,0.04) 0%, transparent 70%)" }} />
      <div className="fixed inset-0 pointer-events-none z-[1]"
        style={{ background: "radial-gradient(ellipse 60% 50% at 20% 75%, rgba(124,58,237,0.04) 0%, transparent 70%)" }} />

      <StarField />

      {/* Hero text (fades out after first scroll) */}
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-20 pointer-events-none"
        style={{ opacity: introOpacity }}
      >
        <div className="text-center px-6">
          <motion.div
            className="text-[10px] tracking-[0.4em] text-cyan-400/60 mb-6"
            style={{ fontFamily: "var(--font-orbitron)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            INITIATING LAUNCH SEQUENCE
          </motion.div>
          <motion.h1
            className="font-black leading-none mb-6"
            style={{
              fontFamily: "var(--font-orbitron)",
              fontSize: "clamp(3rem, 9vw, 7rem)",
              background: "linear-gradient(135deg, #ffffff 0%, #b3e5fc 50%, #00d4ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.4 }}
          >
            SOLAR SYSTEM
          </motion.h1>
          <motion.p
            className="text-slate-400 tracking-widest"
            style={{ fontFamily: "var(--font-orbitron)", fontSize: "clamp(0.75rem, 2vw, 1rem)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            SCROLL TO BEGIN YOUR JOURNEY
          </motion.p>
          <motion.div
            className="mt-8 flex justify-center"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="22" height="38" viewBox="0 0 22 38" fill="none">
              <rect x="1" y="1" width="20" height="36" rx="10" stroke="rgba(0,212,255,0.35)" strokeWidth="1.5" />
              <motion.circle cx="11" cy="9" r="3" fill="#00d4ff"
                animate={{ cy: [9, 25, 9] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
            </svg>
          </motion.div>
        </div>
      </motion.div>

      {/* Planets */}
      {PLANETS.map((planet, i) => (
        <JourneyPlanet key={planet.name} planet={planet} index={i} onSelect={() => onSelectPlanet(planet)} />
      ))}

      {/* Distance lines */}
      {PLANETS.slice(0, -1).map((planet, i) => (
        <DistanceLine key={`dl-${i}`} from={planet} to={PLANETS[i + 1]} />
      ))}

      {/* ── Mission Complete ──────────────────────────────────────────────────────
          Positioning is handled by the outer div (no Framer transform on it).
          The inner motion.div handles only opacity + scale so Framer never
          clobbers translateX(-50%) with its own transform string.
          Top is pushed well past the last planet (Pluto @16600 + ~400 stats/padding).
      ─────────────────────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 18200,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <motion.div
          className="text-center px-8 py-16"
          style={{ maxWidth: 680, width: "100%" }}
          initial={{ opacity: 0, scale: 0.88 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Decorative star burst */}
          <motion.div
            className="flex justify-center mb-10"
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                  background: "radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)",
                  boxShadow: "0 0 60px rgba(0,212,255,0.2), 0 0 120px rgba(124,58,237,0.1)",
                  border: "1px solid rgba(0,212,255,0.2)",
                }}>
                {/* CSS star icon */}
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path d="M20 4l2.9 8.9H35l-9.5 6.9 3.6 11.1L20 25.1l-9.1 5.8 3.6-11.1L5 12.9h12.1z"
                    fill="url(#starGrad)" />
                  <defs>
                    <linearGradient id="starGrad" x1="5" y1="4" x2="35" y2="35" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#ffd700" />
                      <stop offset="0.5" stopColor="#00d4ff" />
                      <stop offset="1" stopColor="#7c3aed" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Label */}
          <div className="text-[10px] tracking-[0.5em] text-cyan-400/50 mb-5"
            style={{ fontFamily: "var(--font-orbitron)" }}>
            MISSION COMPLETE
          </div>

          {/* Headline */}
          <h2
            className="font-black leading-tight mb-5"
            style={{
              fontFamily: "var(--font-orbitron)",
              fontSize: "clamp(2.2rem, 5.5vw, 4.2rem)",
              background: "linear-gradient(135deg, #ffd700 0%, #00d4ff 50%, #7c3aed 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            5.9 BILLION<br />KM TRAVELED
          </h2>

          {/* Stats row */}
          <div className="flex justify-center gap-6 mb-8 flex-wrap">
            {[
              { label: "Worlds visited", value: "10" },
              { label: "Distance", value: "5.9B km" },
              { label: "Quiz questions", value: "50" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-black mb-0.5"
                  style={{ fontFamily: "var(--font-orbitron)", color: "#00d4ff" }}>
                  {s.value}
                </div>
                <div className="text-[9px] text-slate-500 tracking-widest"
                  style={{ fontFamily: "var(--font-orbitron)" }}>
                  {s.label.toUpperCase()}
                </div>
              </div>
            ))}
          </div>

          <p className="text-slate-400 text-base mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
            From the blazing Sun to the frozen edge of Pluto.
          </p>
          <p className="text-slate-500 text-sm mb-12" style={{ fontFamily: "'Inter', sans-serif" }}>
            You&apos;ve witnessed every world our solar system has to offer.
          </p>

          <motion.button
            className="relative group px-12 py-4 rounded-full font-semibold text-sm text-white overflow-hidden"
            style={{ fontFamily: "var(--font-orbitron)", letterSpacing: "0.2em" }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-700 via-cyan-600 to-purple-700
              opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="absolute inset-0 rounded-full border border-cyan-400/30
              group-hover:border-cyan-300/60 transition-colors duration-300" />
            <span className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-15 transition-opacity duration-300"
              style={{ boxShadow: "0 0 40px #00d4ff" }} />
            <span className="relative z-10">BEGIN AGAIN</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}

// ─── Orrery (Solar System View) ───────────────────────────────────────────────

// Orbital config: orbitR in px at 900px virtual canvas, period in seconds (compressed)
const ORRERY_CONFIG = [
  { name: "Mercury", orbitR: 72,  pxSize: 9,  period: 8,   startAngle: 45  },
  { name: "Venus",   orbitR: 104, pxSize: 14, period: 15,  startAngle: 130 },
  { name: "Earth",   orbitR: 138, pxSize: 15, period: 22,  startAngle: 215 },
  { name: "Mars",    orbitR: 175, pxSize: 11, period: 38,  startAngle: 305 },
  { name: "Jupiter", orbitR: 222, pxSize: 28, period: 80,  startAngle: 75  },
  { name: "Saturn",  orbitR: 274, pxSize: 24, period: 140, startAngle: 160 },
  { name: "Uranus",  orbitR: 326, pxSize: 18, period: 210, startAngle: 245 },
  { name: "Neptune", orbitR: 374, pxSize: 17, period: 280, startAngle: 30  },
  { name: "Pluto",   orbitR: 418, pxSize: 6,  period: 340, startAngle: 115 },
]

function SolarSystemView({ onSelectPlanet }: { onSelectPlanet: (p: PlanetData) => void }) {
  const [scale, setScale] = useState(1)
  const [hoveredOrbit, setHoveredOrbit] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [lastHoveredPlanet, setLastHoveredPlanet] = useState("Earth")
  const previewPlanetName = hoveredOrbit && hoveredOrbit !== "Sun" ? hoveredOrbit : lastHoveredPlanet
  const starField = useRef(
    Array.from({ length: 260 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      width: Math.random() * 1.8 + 0.3,
      height: Math.random() * 1.8 + 0.3,
      opacity: Math.random() * 0.5 + 0.08,
    }))
  )

  useEffect(() => {
    const update = () => {
      const usableW = window.innerWidth - 60
      const usableH = window.innerHeight - 160
      setScale(Math.min(usableW, usableH) / 900)
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  useEffect(() => {
    let raf = 0
    const tick = (ts: number) => {
      setElapsed(ts / 1000)
      raf = window.requestAnimationFrame(tick)
    }
    raf = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    if (hoveredOrbit && hoveredOrbit !== "Sun") {
      setLastHoveredPlanet(hoveredOrbit)
    }
  }, [hoveredOrbit])

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: "#05070d", paddingTop: 72 }}>

      {/* Wordmark — matches TourView aesthetic */}
      <div className="absolute left-6 top-5 z-30 sm:left-10 sm:top-6">
        <AphelionLogo wordmarkClassName="text-[12px] tracking-[0.32em]" iconClassName="h-6 w-6" />
      </div>

      {/* Textured preview card so solar-system mode also uses the modern planet model */}
      <div className="absolute right-4 top-20 z-30 hidden w-40 rounded-xl border border-white/10 bg-black/45 p-2.5 backdrop-blur-sm md:block">
        <div className="h-28 overflow-hidden rounded-lg border border-white/10 bg-black/40">
          <Planet3D
            name={previewPlanetName}
            showStars={false}
            enableControls={false}
            enableZoom={false}
            autoRotate
            rotationSpeed={0.07}
            cameraZ={previewPlanetName === "Saturn" ? 4.6 : 3}
          />
        </div>
        <div className="mt-2 text-center text-[9px] tracking-[0.25em] text-white/70">
          {previewPlanetName.toUpperCase()}
        </div>
      </div>

      {/* Background stars */}
      {starField.current.map((star) => (
        <div key={star.id} className="absolute rounded-full bg-white pointer-events-none"
          style={{
            left: star.left,
            top: star.top,
            width: star.width,
            height: star.height,
            opacity: star.opacity,
          }} />
      ))}

      {/* Faint nebular wash for depth */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.025) 0%, transparent 55%)" }} />

      {/* Orrery — fixed 900×900 canvas, scaled to fit viewport */}
      <div
        style={{
          width: 900,
          height: 900,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {/* Orbital rings (SVG for perfect circles) */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width="900"
          height="900"
          viewBox="0 0 900 900"
        >
          {ORRERY_CONFIG.map((cfg) => (
            <circle
              key={cfg.name}
              cx="450" cy="450"
              r={cfg.orbitR}
              fill="none"
              stroke={hoveredOrbit === cfg.name ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.07)"}
              strokeWidth={hoveredOrbit === cfg.name ? 1 : 0.6}
              style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
            />
          ))}
        </svg>

        {/* Stable 2D orrery bodies (reverted from 3D mesh layer) */}
        <div className="absolute inset-0">
          <button
            className="absolute rounded-full"
            style={{
              left: 450 - 24,
              top: 450 - 24,
              width: 48,
              height: 48,
              background: PLANET_BG.Sun.bg,
              boxShadow: "0 0 28px rgba(255,145,0,0.55), 0 0 55px rgba(255,109,0,0.3)",
            }}
            onMouseEnter={() => setHoveredOrbit("Sun")}
            onMouseLeave={() => setHoveredOrbit(null)}
            onClick={() => onSelectPlanet(PLANETS.find((p) => p.name === "Sun")!)}
            aria-label="Explore Sun"
          />

          {ORRERY_CONFIG.map((cfg) => {
            const planet = PLANETS.find((p) => p.name === cfg.name)!
            const styleCfg = PLANET_BG[cfg.name]
            const angle = ((cfg.startAngle - 90) * Math.PI) / 180 + (elapsed * Math.PI * 2) / cfg.period
            const x = 450 + cfg.orbitR * Math.cos(angle)
            const y = 450 + cfg.orbitR * Math.sin(angle)
            const size = Math.max(cfg.pxSize * 1.75, 7)
            return (
              <button
                key={`planet-${cfg.name}`}
                className="absolute rounded-full transition-transform duration-200 hover:scale-110"
                style={{
                  left: x - size / 2,
                  top: y - size / 2,
                  width: size,
                  height: size,
                  background: styleCfg?.bg ?? planet.color,
                  boxShadow: `${styleCfg?.insetShadow ?? ""}, 0 0 ${size * 1.2}px ${planet.glowColor}44`,
                  filter: hoveredOrbit === cfg.name ? "brightness(1.15)" : "brightness(1)",
                }}
                onMouseEnter={() => setHoveredOrbit(cfg.name)}
                onMouseLeave={() => setHoveredOrbit(null)}
                onClick={() => onSelectPlanet(planet)}
                aria-label={`Explore ${cfg.name}`}
              />
            )
          })}
        </div>

        {/* Planet labels — fixed position on the orbital ring at start angle */}
        {ORRERY_CONFIG.map((cfg) => {
          const angleRad = ((cfg.startAngle - 90) * Math.PI) / 180
          // Place label slightly outside the orbit
          const labelR = cfg.orbitR + 14
          const lx = 450 + labelR * Math.cos(angleRad)
          const ly = 450 + labelR * Math.sin(angleRad)
          return (
            <div
              key={`lbl-${cfg.name}`}
              className="absolute pointer-events-none text-center"
              style={{
                left: lx,
                top: ly,
                transform: "translate(-50%, -50%)",
                fontSize: 10,
                color: hoveredOrbit === cfg.name ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.4)",
                letterSpacing: "0.22em",
                whiteSpace: "nowrap",
                transition: "color 0.3s",
              }}
            >
              {cfg.name.toUpperCase()}
            </div>
          )
        })}
      </div>

      {/* Legend — minimal */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 text-[10px] tracking-[0.3em] text-white/40">
        <span className="h-px w-6 bg-white/15" aria-hidden />
        <span className="sm:hidden">TAP A PLANET</span>
        <span className="hidden sm:inline">CLICK ANY PLANET TO EXPLORE</span>
        <span className="h-px w-6 bg-white/15" aria-hidden />
      </div>
    </div>
  )
}

// ─── View Toggle ──────────────────────────────────────────────────────────────

function ViewToggle({ mode, onChange }: { mode: "journey" | "orrery"; onChange: (m: "journey" | "orrery") => void }) {
  return (
    <div
      className="fixed top-4 right-4 sm:top-5 sm:right-8 z-50 flex items-center gap-4 rounded-full border border-white/10 bg-black/50 px-4 py-2.5 backdrop-blur-md sm:gap-5 sm:px-5"
      style={{ boxShadow: "0 6px 24px rgba(0,0,0,0.35)" }}
      role="tablist"
      aria-label="Exploration mode"
    >
      {(["orrery", "journey"] as const).map((m, i) => {
        const active = mode === m
        const label =
          m === "journey"
            ? { short: "EXPLORE", long: "EXPLORE" }
            : { short: "SYSTEM", long: "SOLAR SYSTEM" }
        return (
          <div key={m} className="flex items-center gap-4 sm:gap-5">
            {i > 0 && <span className="h-3 w-px bg-white/20" aria-hidden />}
            <button
              onClick={() => onChange(m)}
              className="group relative flex min-h-9 flex-col items-center justify-center gap-1 px-1.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070d]"
              role="tab"
              aria-selected={active}
              aria-label={`Switch to ${label.long.toLowerCase()} view`}
              style={{
                color: active ? "#ffffff" : "rgba(255,255,255,0.65)",
                textShadow: active ? "0 0 12px rgba(255,255,255,0.25)" : "none",
              }}
            >
              <span className="whitespace-nowrap text-[10px] tracking-[0.28em] sm:text-[11px] sm:tracking-[0.32em]">
                <span className="sm:hidden">{label.short}</span>
                <span className="hidden sm:inline">{label.long}</span>
              </span>
              <span
                className="h-1 w-1 rounded-full transition-opacity"
                style={{
                  background: "rgba(255,255,255,0.95)",
                  boxShadow: "0 0 6px rgba(255,255,255,0.7)",
                  opacity: active ? 1 : 0,
                }}
                aria-hidden
              />
            </button>
          </div>
        )
      })}
    </div>
  )
}

// ─── Quiz Component ───────────────────────────────────────────────────────────

function Quiz({
  questions,
  quizKey,
  onQuizComplete,
}: {
  questions: QuizQuestion[]
  quizKey: string
  onQuizComplete?: () => void
}) {
  const prefersReducedMotion = useReducedMotion()
  const [current, setCurrent] = useState(0)
  const [done, setDone] = useState(false)
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null))

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = window.sessionStorage.getItem(`aphelion.quiz-progress.${quizKey}`)
      if (!raw) return
      const parsed = JSON.parse(raw) as { current: number; done: boolean; answers: (number | null)[] }
      if (Array.isArray(parsed.answers) && parsed.answers.length === questions.length) {
        setAnswers(parsed.answers)
      }
      if (typeof parsed.current === "number") {
        setCurrent(Math.max(0, Math.min(parsed.current, questions.length - 1)))
      }
      setDone(Boolean(parsed.done))
    } catch {
      // noop
    }
  }, [questions.length, quizKey])

  useEffect(() => {
    if (typeof window === "undefined") return
    const payload = { current, done, answers }
    window.sessionStorage.setItem(`aphelion.quiz-progress.${quizKey}`, JSON.stringify(payload))
  }, [answers, current, done, quizKey])

  const selected = answers[current]
  const answered = selected !== null
  const score = answers.reduce<number>((acc, answer, i) => acc + (answer === questions[i].correct ? 1 : 0), 0)
  const q = questions[current]
  const percent = Math.round(((current + 1) / questions.length) * 100)

  const handleSelect = (i: number) => {
    if (answers[current] !== null) return
    const newAnswers = [...answers]
    newAnswers[current] = i
    setAnswers(newAnswers)
    triggerHaptic(10)
  }

  const handleNext = () => {
    triggerHaptic([8, 12, 8])
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1)
    } else {
      setDone(true)
      onQuizComplete?.()
    }
  }

  const handleRestart = () => {
    triggerHaptic([10, 16, 10])
    setCurrent(0)
    setDone(false)
    setAnswers(Array(questions.length).fill(null))
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100)
    const rank =
      pct === 100 ? "MISSION EXPERT" :
      pct >= 80 ? "STELLAR NAVIGATOR" :
      pct >= 60 ? "SPACE CADET" : "EARTHBOUND TRAINEE"
    const tone = pct >= 80 ? "rgb(134,239,172)" : pct >= 60 ? "rgba(255,255,255,0.85)" : "rgb(252,165,165)"
    return (
      <motion.div
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        aria-live="polite"
      >
        <div className="mb-2 text-[10px] tracking-[0.35em] text-white/40">
          MISSION DEBRIEF
        </div>
        <div className="mb-1 flex items-baseline gap-3">
          <span
            className="text-5xl tracking-[0.08em]"
            style={{ fontFamily: SERIF_DETAIL, color: tone }}
          >
            {score}
          </span>
          <span className="text-2xl text-white/30" style={{ fontFamily: SERIF_DETAIL }}>
            / {questions.length}
          </span>
          <span className="ml-auto text-[11px] tracking-[0.25em] text-white/45">
            {pct}% ACCURACY
          </span>
        </div>
        <div className="mb-8 text-[11px] tracking-[0.32em] text-white/65">
          {rank}
        </div>

        {/* Review list */}
        <div className="mb-8 max-h-[44vh] space-y-2 overflow-y-auto pr-1">
          {questions.map((qz, i) => {
            const correct = answers[i] === qz.correct
            return (
              <div
                key={i}
                className="flex items-start gap-4 border-b border-white/5 px-1 py-3"
              >
                <span
                  className="mt-[2px] shrink-0 text-[10px] tracking-[0.2em]"
                  style={{ color: correct ? "rgb(134,239,172)" : "rgb(252,165,165)" }}
                >
                  {correct ? "OK" : "X"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 text-[12px] leading-snug text-white/75">
                    {qz.question}
                  </div>
                  <div className="text-[11px] text-white/45">
                    Answer: {qz.options[qz.correct]}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <button
          className="group inline-flex min-h-11 items-center gap-3 rounded-full border border-white/15 px-4 text-[11px] tracking-[0.32em] text-white/90 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80"
          onClick={handleRestart}
          aria-label="Restart quiz"
        >
          <span className="h-px w-10 bg-white/30 transition-all group-hover:w-14 group-hover:bg-white/60" />
          RETRY QUIZ
          <span aria-hidden>↺</span>
        </button>
      </motion.div>
    )
  }

  return (
    <div aria-live="polite" aria-label="Planet quiz">
      {/* Progress — minimal hairline segments */}
      <div className="mb-4 flex items-center gap-1" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label="Quiz progress">
        {questions.map((_, i) => {
          const passed = i < current
          const isCurrent = i === current
          let bg = "rgba(255,255,255,0.08)"
          if (passed) bg = answers[i] === questions[i].correct ? "rgba(134,239,172,0.7)" : "rgba(252,165,165,0.7)"
          else if (isCurrent) bg = "rgba(255,255,255,0.85)"
          return (
            <div key={i} className="h-0.5 flex-1 rounded-full transition-all" style={{ background: bg }} />
          )
        })}
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-[10px] tracking-[0.28em] text-white/55 sm:tracking-[0.32em]">
        <span>QUESTION {String(current + 1).padStart(2, "0")} / {String(questions.length).padStart(2, "0")}</span>
        <span>SCORE {score} · {percent}%</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -16 }}
          transition={{ duration: prefersReducedMotion ? 0.12 : 0.25 }}
        >
          <h3
            className="mb-5 leading-snug text-white/95"
            style={{ fontFamily: SERIF_DETAIL, fontSize: "clamp(1.05rem, 4.5vw, 1.5rem)" }}
            id={`quiz-question-${current}`}
          >
            {q.question}
          </h3>

          <div className="mb-6 space-y-2" role="radiogroup" aria-labelledby={`quiz-question-${current}`}>
            {q.options.map((opt, i) => {
              const isCorrect = answered && i === q.correct
              const isWrongPick = answered && i === selected && i !== q.correct
              const isMutedPick = answered && !isCorrect && !isWrongPick

              const borderColor = isCorrect
                ? "rgba(134,239,172,0.55)"
                : isWrongPick
                  ? "rgba(252,165,165,0.55)"
                  : "rgba(255,255,255,0.1)"
              const bg = isCorrect
                ? "rgba(134,239,172,0.06)"
                : isWrongPick
                  ? "rgba(252,165,165,0.06)"
                  : "rgba(0,0,0,0.3)"
              const textColor = isMutedPick ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.85)"

              return (
                <button
                  key={i}
                  className="group flex min-h-12 w-full items-center gap-3 rounded-lg px-4 py-3.5 text-left text-[14px] leading-relaxed backdrop-blur-sm transition disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80"
                  style={{
                    background: bg,
                    border: `1px solid ${borderColor}`,
                    color: textColor,
                  }}
                  onClick={() => handleSelect(i)}
                  disabled={answered}
                  role="radio"
                  aria-checked={selected === i}
                  aria-label={`Option ${String.fromCharCode(65 + i)}: ${opt}`}
                >
                  <span
                    className="text-[10px] tracking-[0.2em] text-white/35"
                    style={{ fontFamily: SERIF_DETAIL }}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {isCorrect && (
                    <span className="text-[10px] tracking-[0.2em]" style={{ color: "rgb(134,239,172)" }}>
                      CORRECT
                    </span>
                  )}
                  {isWrongPick && (
                    <span className="text-[10px] tracking-[0.2em]" style={{ color: "rgb(252,165,165)" }}>
                      INCORRECT
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {answered && (
              <motion.div
                className="mb-6 rounded-md border-l-2 bg-white/[0.02] p-3 pl-4 text-[13px] leading-relaxed text-white/75 sm:text-[12px]"
                style={{
                  borderLeftColor: selected === q.correct ? "rgba(134,239,172,0.5)" : "rgba(252,165,165,0.5)",
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div
                  className="mb-1 text-[10px] tracking-[0.32em]"
                  style={{ color: selected === q.correct ? "rgb(134,239,172)" : "rgb(252,165,165)" }}
                >
                  {selected === q.correct ? "CORRECT" : "INCORRECT"}
                </div>
                {q.explanation}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap items-center gap-2.5">
            {answered && (
              <motion.button
                className="group inline-flex min-h-11 items-center gap-3 rounded-full border border-white/15 px-4 text-[11px] tracking-[0.28em] text-white/90 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 sm:tracking-[0.32em]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleNext}
                aria-label={current < questions.length - 1 ? "Go to next question" : "Show quiz results"}
              >
                <span className="h-px w-10 bg-white/30 transition-all group-hover:w-14 group-hover:bg-white/60" />
                {current < questions.length - 1 ? "NEXT QUESTION" : "SEE RESULTS"}
                <span aria-hidden>→</span>
              </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─── Planet Detail View ────────────────────────────────────────────────────────

function PlanetDetailView({
  planet,
  onClose,
  mode,
  onModeChange,
  initialTab = "info",
  onTabChange,
  onFactsViewed,
  onQuizCompleted,
}: {
  planet: PlanetData
  onClose: () => void
  mode: "journey" | "orrery"
  onModeChange: (m: "journey" | "orrery") => void
  initialTab?: DetailTab
  onTabChange?: (tab: DetailTab) => void
  onFactsViewed?: (planetName: string) => void
  onQuizCompleted?: (planetName: string) => void
}) {
  const prefersReducedMotion = useReducedMotion()
  const [tab, setTab] = useState<DetailTab>(initialTab)
  const detailStars = useRef(
    Array.from({ length: 160 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      width: Math.random() * 1.6 + 0.3,
      height: Math.random() * 1.6 + 0.3,
      opacity: Math.random() * 0.45 + 0.08,
    }))
  )

  useEffect(() => {
    setTab(initialTab)
  }, [initialTab, planet.name])

  useEffect(() => {
    onTabChange?.(tab)
  }, [onTabChange, tab])

  useEffect(() => {
    if (tab === "info") onFactsViewed?.(planet.name)
  }, [planet.name, tab])

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  const subtitle =
    planet.distanceFromSun === 0
      ? "STAR · CENTER OF THE SOLAR SYSTEM"
      : `PLANET · ${planet.distanceFromSun.toLocaleString()} MILLION KM FROM SUN`

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-y-scroll [scrollbar-gutter:stable]"
      style={{ background: "#05070d", color: "white" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: prefersReducedMotion ? 0.15 : 0.4 }}
    >
      {/* Wordmark — matches explore view */}
      <div className="fixed left-6 top-5 z-30 sm:left-10 sm:top-6">
        <AphelionLogo wordmarkClassName="text-[12px] tracking-[0.32em]" iconClassName="h-6 w-6" />
      </div>

      {/* View toggle — same as explore */}
      <ViewToggle mode={mode} onChange={onModeChange} />

      {/* Subtle radial planet wash, far softer than before */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 30% 40%, ${planet.color}10 0%, transparent 55%)`,
        }}
      />

      {/* Background stars — minimal, layered */}
      {detailStars.current.map((star) => (
        <div
          key={star.id}
          className="fixed rounded-full bg-white pointer-events-none"
          style={{
            left: star.left,
            top: star.top,
            width: star.width,
            height: star.height,
            opacity: star.opacity,
          }}
        />
      ))}

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-20 sm:px-8 sm:pt-24">
        {/* Back link — minimal */}
        <motion.button
          className="mb-10 flex min-h-10 items-center gap-2 rounded-full border border-white/10 px-3 text-[11px] tracking-[0.24em] text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 sm:mb-12 sm:tracking-[0.3em]"
          onClick={onClose}
          whileHover={{ x: -3 }}
          aria-label="Back to planet exploration"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M13 8H3M7 12l-4-4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          BACK
        </motion.button>

        {/* Hero row */}
        <div className="mb-14 grid grid-cols-1 items-center gap-6 lg:mb-20 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          {/* 3D Planet */}
          <motion.div
            className="relative h-[260px] w-full sm:h-[420px] lg:h-[520px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <Planet3D
              name={planet.name}
              showStars={false}
              enableControls={false}
              enableZoom={false}
              autoRotate
              rotationSpeed={0.06}
              cameraZ={planet.name === "Saturn" ? 5.2 : 3.4}
            />
          </motion.div>

          {/* Title + tagline + stats */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <div className="mb-4 text-[10px] tracking-[0.35em] text-white/40">
              {subtitle}
            </div>
            <h1
              className="mb-4 leading-none text-white/95"
              style={{
                fontFamily: SERIF_DETAIL,
                fontSize: "clamp(2.5rem, 6vw, 4.2rem)",
                letterSpacing: "0.32em",
              }}
            >
              {planet.name.toUpperCase()}
            </h1>
            <p
              className="mb-8 max-w-md text-sm italic leading-relaxed text-white/55"
              style={{ fontFamily: SERIF_DETAIL }}
            >
              {planet.tagline}
            </p>

            {/* Stats — clean inline list with icons (matches explore left rail) */}
            <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2 sm:gap-x-8">
              {planet.stats.map((stat) => {
                const Icon = getDetailStatIcon(stat.label)
                return (
                  <div key={stat.label} className="flex items-center justify-between gap-3 border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-3 w-3 shrink-0 text-white/35" strokeWidth={1.5} />
                      <span className="text-[10px] uppercase tracking-[0.25em] text-white/45">
                        {stat.label}
                      </span>
                    </div>
                    <span className="text-right text-[11px] text-white/85">
                      {stat.value}
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* Tabs — minimal text style */}
        <div className="mb-8 flex items-center gap-4 border-b border-white/10 pb-2 sm:mb-10 sm:gap-6" role="tablist" aria-label="Planet detail tabs">
          {(["info", "quiz"] as const).map((t) => {
            const active = tab === t
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="group relative flex min-h-10 flex-col items-center justify-center gap-2 pb-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80"
                style={{ color: active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.4)" }}
                role="tab"
                aria-selected={active}
                aria-label={t === "info" ? "Facts tab" : "Quiz tab"}
              >
                <span className="text-[11px] tracking-[0.32em]">
                  {t === "info" ? "FACTS" : "QUIZ"}
                </span>
                <span
                  className="absolute -bottom-[2px] left-1/2 h-px w-full -translate-x-1/2 transition-opacity"
                  style={{ background: "rgba(255,255,255,0.85)", opacity: active ? 1 : 0 }}
                  aria-hidden
                />
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {tab === "info" && (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl"
            >
              <div className="mb-5 text-[10px] tracking-[0.35em] text-white/40">
                DID YOU KNOW
              </div>
              <div className="space-y-3">
                {planet.facts.map((fact, i) => (
                  <motion.div
                    key={i}
                    className="flex gap-4 rounded-md border border-white/10 bg-black/30 p-4 backdrop-blur-sm"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <div
                      className="mt-[3px] shrink-0 text-[11px] tracking-[0.2em] text-white/45"
                      style={{ fontFamily: SERIF_DETAIL }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <p className="text-[13px] leading-relaxed text-white/75">
                      {fact}
                    </p>
                  </motion.div>
                ))}
              </div>

              <motion.button
                className="group mt-8 flex items-center gap-3 text-[11px] tracking-[0.32em] text-white/85 transition hover:text-white"
                whileHover={{ x: 3 }}
                onClick={() => setTab("quiz")}
              >
                <span className="h-px w-10 bg-white/30 transition-all group-hover:w-14 group-hover:bg-white/60" />
                TAKE THE QUIZ
                <span aria-hidden>→</span>
              </motion.button>
            </motion.div>
          )}

          {tab === "quiz" && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl"
            >
              <Quiz
                questions={planet.quiz}
                quizKey={planet.name}
                onQuizComplete={() => onQuizCompleted?.(planet.name)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ─── Root App ─────────────────────────────────────────────────────────────────
// DistanceHUD lives here — not inside JourneyView — so it never remounts/re-animates
// when React re-renders the scroll container.

type ExploreMode = "journey" | "orrery"

export default function SpaceExploration() {
  const prefersReducedMotion = useReducedMotion()
  const [view, setView] = useState<View>("intro")
  const [exploreMode, setExploreMode] = useState<ExploreMode>("journey")
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null)
  const [focusedPlanetName, setFocusedPlanetName] = useState<string | null>(null)
  const [detailTab, setDetailTab] = useState<DetailTab>("info")
  const [planetProgress, setPlanetProgress] = useState<PlanetProgress>({})
  const [resumeLabel, setResumeLabel] = useState<string | null>(null)
  const [resumeState, setResumeState] = useState<PersistedNavState | null>(null)
  const [navStateReady, setNavStateReady] = useState(false)

  const handleEnter = useCallback(() => setView("journey"), [])

  const handleSelectPlanet = useCallback((p: PlanetData) => {
    triggerHaptic([8, 12, 8])
    setDetailTab("info")
    setFocusedPlanetName(p.name)
    setSelectedPlanet(p)
    setView("planet")
  }, [])

  const handleClosePlanet = useCallback(() => {
    setView("journey")
    setSelectedPlanet(null)
  }, [])

  const handleModeChange = useCallback((m: ExploreMode) => {
    // Scroll to top when entering journey mode from orrery so HUD starts at 0
    if (m === "journey") window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })
    setExploreMode(m)
  }, [])

  useEffect(() => {
    const persisted = readPersistedNavState()
    setResumeState(persisted)
    if (persisted) {
      setView(persisted.view)
      setExploreMode(persisted.exploreMode)
      setFocusedPlanetName(persisted.focusedPlanetName ?? null)
      if (persisted.selectedPlanetName) {
        setSelectedPlanet(PLANETS.find((p) => p.name === persisted.selectedPlanetName) ?? null)
      }
    }
    const savedTab = window.sessionStorage.getItem("aphelion.detail-tab")
    if (savedTab === "quiz") setDetailTab("quiz")
    const savedProgress = readPlanetProgress()
    setPlanetProgress(savedProgress)
    if (persisted?.selectedPlanetName) {
      const quizRaw = window.sessionStorage.getItem(`aphelion.quiz-progress.${persisted.selectedPlanetName}`)
      if (quizRaw) {
        try {
          const parsed = JSON.parse(quizRaw) as { current: number; done: boolean }
          const step = parsed.done ? "Quiz complete" : `Quiz Q${(parsed.current ?? 0) + 1}`
          setResumeLabel(`at ${persisted.selectedPlanetName} / ${step}`)
        } catch {
          setResumeLabel(`at ${persisted.selectedPlanetName}`)
        }
      } else {
        setResumeLabel(`at ${persisted.selectedPlanetName}`)
      }
    }
    setNavStateReady(true)
  }, [])

  useEffect(() => {
    if (!navStateReady) return
    if (typeof window === "undefined") return
    const state: PersistedNavState = {
      view,
      exploreMode,
      selectedPlanetName: selectedPlanet?.name ?? null,
      focusedPlanetName,
    }
    window.sessionStorage.setItem(NAV_STATE_KEY, JSON.stringify(state))
  }, [navStateReady, view, exploreMode, selectedPlanet, focusedPlanetName])

  useEffect(() => {
    if (!navStateReady) return
    if (typeof window === "undefined") return
    window.sessionStorage.setItem("aphelion.detail-tab", detailTab)
  }, [navStateReady, detailTab])

  useEffect(() => {
    if (!navStateReady) return
    if (typeof window === "undefined") return
    window.sessionStorage.setItem(PLANET_PROGRESS_KEY, JSON.stringify(planetProgress))
  }, [navStateReady, planetProgress])

  if (!navStateReady) {
    return <div className="fixed inset-0 bg-[#030710]" />
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {view === "intro" && (
          <motion.div key="intro" exit={{ opacity: 0 }} transition={{ duration: prefersReducedMotion ? 0.15 : 0.5 }}>
            <IntroScreen
              onEnter={handleEnter}
              resumeLabel={resumeLabel}
              onResume={
                resumeState
                  ? () => {
                    setView(resumeState.view)
                    setExploreMode(resumeState.exploreMode)
                    if (resumeState.selectedPlanetName) {
                      setSelectedPlanet(PLANETS.find((p) => p.name === resumeState.selectedPlanetName) ?? null)
                    }
                  }
                  : undefined
              }
            />
          </motion.div>
        )}

        {view === "journey" && (
          <motion.div key="journey" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            {/* Toggle — always on top */}
            <ViewToggle mode={exploreMode} onChange={handleModeChange} />

            {/* Distance HUD removed — TourView is a single screen, not scroll-based */}

            {/* Content */}
            <AnimatePresence mode="wait">
              {exploreMode === "journey" ? (
                <motion.div key="explore"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}>
                  <TourView
                    planets={PLANETS}
                    onSelectPlanet={(p) => handleSelectPlanet(p as PlanetData)}
                    onFocusPlanet={setFocusedPlanetName}
                    initialPlanetName={focusedPlanetName ?? resumeState?.focusedPlanetName ?? selectedPlanet?.name ?? null}
                    completion={planetProgress}
                  />
                </motion.div>
              ) : (
                <motion.div key="orrery"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}>
                  <SolarSystemView onSelectPlanet={handleSelectPlanet} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {view === "planet" && selectedPlanet && (
          <PlanetDetailView
            key="planet"
            planet={selectedPlanet}
            onClose={handleClosePlanet}
            mode={exploreMode}
            initialTab={detailTab}
            onTabChange={setDetailTab}
            onFactsViewed={(planetName) => {
              setPlanetProgress((prev) => {
                if (prev[planetName]?.factsRead) return prev
                return {
                  ...prev,
                  [planetName]: { ...prev[planetName], factsRead: true },
                }
              })
            }}
            onQuizCompleted={(planetName) => {
              setPlanetProgress((prev) => ({
                ...prev,
                [planetName]: { ...prev[planetName], quizCompleted: true },
              }))
            }}
            onModeChange={(m) => {
              setExploreMode(m)
              setView("journey")
              setSelectedPlanet(null)
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}
