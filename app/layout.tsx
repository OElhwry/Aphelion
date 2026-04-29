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
    default: "Aphelion | Solar System Explorer",
    template: "%s | Aphelion",
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
    title: "Aphelion | Solar System Explorer",
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
    title: "Aphelion | Solar System Explorer",
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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://aphelion.website/#website",
      name: "Aphelion",
      url: "https://aphelion.website",
      description:
        "An interactive 3D journey through the solar system. Explore planets, discover space facts, and test your knowledge.",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://aphelion.website",
      },
    },
    {
      "@type": "WebApplication",
      "@id": "https://aphelion.website/#webapp",
      name: "Aphelion | Solar System Explorer",
      url: "https://aphelion.website",
      description:
        "An interactive 3D journey through the solar system. Explore planets, discover space facts, and test your knowledge with quizzes — from the Sun to Pluto.",
      applicationCategory: "EducationApplication",
      operatingSystem: "Web",
      inLanguage: "en",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      author: {
        "@type": "Organization",
        name: "Aphelion",
        url: "https://aphelion.website",
      },
      about: {
        "@type": "Thing",
        name: "Solar System",
        description: "The collection of planets and other objects orbiting the Sun.",
      },
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
        {children}
        <Analytics />
      </body>
    </html>
  )
}
