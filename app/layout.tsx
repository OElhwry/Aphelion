import type React from "react"
import type { Metadata } from "next"
import { Orbitron } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-orbitron",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://aphelion.website"),
  title: {
    default: "Aphelion · Solar System Explorer",
    template: "%s · Aphelion",
  },
  description:
    "An interactive 3D journey through the solar system. Explore planets, discover space facts, and test your knowledge with quizzes, from the Sun to Pluto.",
  keywords: [
    "Aphelion",
    "solar system explorer",
    "interactive solar system",
    "planets",
    "space education",
    "astronomy",
    "planet quiz",
    "3D space",
    "solar system",
    "space facts",
    "Mercury",
    "Venus",
    "Earth",
    "Mars",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptune",
    "Pluto",
  ],
  authors: [{ name: "Aphelion", url: "https://aphelion.website" }],
  creator: "Aphelion",
  publisher: "Aphelion",
  alternates: {
    canonical: "https://aphelion.website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    url: "https://aphelion.website",
    siteName: "Aphelion",
    title: "Aphelion · Solar System Explorer",
    description:
      "An interactive 3D journey through the solar system. Explore planets, discover space facts, and test your knowledge with quizzes.",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Aphelion — Solar System Explorer",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aphelion · Solar System Explorer",
    description:
      "Explore the solar system in 3D — discover planets, space facts, and quiz challenges from the Sun to Pluto.",
    images: ["/opengraph-image.png"],
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "64x64" },
      { url: "/aphelion-icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/icon.png",
  },
  manifest: "/manifest.webmanifest",
  category: "education",
  other: {
    "theme-color": "#05070d",
  },
}

const SITE = "https://aphelion.website"

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE}/#org`,
      name: "Aphelion",
      url: SITE,
      logo: {
        "@type": "ImageObject",
        url: `${SITE}/icon.png`,
        width: 64,
        height: 64,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      name: "Aphelion",
      url: SITE,
      publisher: { "@id": `${SITE}/#org` },
      inLanguage: "en",
      description:
        "An interactive 3D journey through the solar system. Explore planets, discover space facts, and test your knowledge.",
      potentialAction: {
        "@type": "SearchAction",
        target: SITE,
      },
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE}/#webapp`,
      name: "Aphelion · Solar System Explorer",
      url: SITE,
      description:
        "An interactive 3D journey through the solar system. Explore planets, discover space facts, and test your knowledge with quizzes — from the Sun to Pluto.",
      applicationCategory: "EducationApplication",
      operatingSystem: "Web Browser",
      browserRequirements: "Requires JavaScript and WebGL",
      inLanguage: "en",
      datePublished: "2025-01-01",
      dateModified: "2026-05-31",
      isAccessibleForFree: true,
      screenshot: `${SITE}/opengraph-image.png`,
      image: `${SITE}/opengraph-image.png`,
      keywords:
        "solar system, planets, 3D space, astronomy, space education, planet quiz, Sun, Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto",
      featureList: [
        "Cinematic 3D fly-through of the solar system",
        "True-to-scale planet sizes and textures",
        "Interactive orrery with live orbital motion",
        "Per-planet facts and knowledge quizzes",
        "Moons, rings, the Milky Way and live people-in-space data",
      ],
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@id": `${SITE}/#org` },
      about: {
        "@type": "Thing",
        name: "Solar System",
        description: "The collection of planets and other objects orbiting the Sun.",
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "What is Aphelion?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Aphelion is a free, interactive 3D Solar System Explorer. You can fly through the solar system, view each planet to scale, read key facts, and test yourself with quizzes — all in your browser.",
          },
        },
        {
          "@type": "Question",
          name: "How many planets are in the solar system?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "There are eight planets — Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus and Neptune. Aphelion also includes the Sun and the dwarf planet Pluto.",
          },
        },
        {
          "@type": "Question",
          name: "Is Aphelion free to use?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Aphelion runs entirely in your web browser and is completely free, with no sign-up required.",
          },
        },
        {
          "@type": "Question",
          name: "Which worlds can I explore in Aphelion?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You can explore the Sun and all eight planets plus Pluto, each with real textures, moons, rings, facts and a quiz — from the Sun out to the edge of the solar system.",
          },
        },
      ],
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${orbitron.variable} font-orbitron overflow-x-hidden`}>
        {/* Crawlable content for search engines and link previews (shown only when
            JavaScript/WebGL is unavailable; the interactive app renders otherwise). */}
        <noscript>
          <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 20px", color: "#cbd5e1", lineHeight: 1.6 }}>
            <h1 style={{ color: "#fff", fontSize: "2rem", marginBottom: 8 }}>Aphelion · Solar System Explorer</h1>
            <h2 style={{ color: "#94a3b8", fontSize: "1.1rem", fontWeight: 400, marginBottom: 24 }}>
              An interactive 3D journey through the solar system
            </h2>
            <p style={{ marginBottom: 16 }}>
              Aphelion is a free, interactive 3D <strong>Solar System Explorer</strong>. Fly through space,
              view each planet to scale with real NASA-derived textures, read key facts, and test your
              knowledge with quizzes — from the Sun all the way out to Pluto. This experience needs
              JavaScript and WebGL enabled in your browser.
            </p>
            <h3 style={{ color: "#93c5fd", fontSize: "1rem", marginBottom: 8 }}>Worlds you can explore</h3>
            <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
              <li><strong>The Sun</strong> — the star at the heart of the solar system.</li>
              <li><strong>Mercury</strong> — the swift, cratered planet closest to the Sun.</li>
              <li><strong>Venus</strong> — Earth&apos;s scorching, cloud-shrouded twin.</li>
              <li><strong>Earth</strong> — our pale blue dot, the only known home for life.</li>
              <li><strong>Mars</strong> — the red planet with the solar system&apos;s tallest volcano.</li>
              <li><strong>Jupiter</strong> — the giant of storms and the four Galilean moons.</li>
              <li><strong>Saturn</strong> — the ringed jewel, light enough to float on water.</li>
              <li><strong>Uranus</strong> — the ice giant that rolls on its side.</li>
              <li><strong>Neptune</strong> — the dark, windswept edge of the planets.</li>
              <li><strong>Pluto</strong> — the distant dwarf planet and its moon Charon.</li>
            </ul>
            <p>
              Explore planets, discover space facts, and learn astronomy through a cinematic 3D experience —
              free, in your browser, with no sign-up.
            </p>
          </div>
        </noscript>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
