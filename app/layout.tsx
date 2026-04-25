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
    default: "Aphelion | Interactive Solar System Explorer",
    template: "%s | Aphelion",
  },
  description:
    "Explore the solar system in an interactive 3D-inspired experience. Learn planet facts, compare stats, and test your knowledge with quizzes from Mercury to Pluto.",
  keywords: [
    "solar system",
    "planets",
    "space education",
    "astronomy",
    "interactive learning",
    "planet quiz",
    "Aphelion",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://aphelion.website",
    siteName: "Aphelion",
    title: "Aphelion | Interactive Solar System Explorer",
    description:
      "Journey from the Sun to Pluto with immersive visuals, planet facts, and quiz challenges.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aphelion | Interactive Solar System Explorer",
    description:
      "Explore planets, discover space facts, and take quizzes in a cinematic solar system experience.",
  },
  icons: {
    icon: "/aphelion-icon.svg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${orbitron.variable} font-orbitron overflow-x-hidden`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
