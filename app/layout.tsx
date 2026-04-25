import type React from "react"
import type { Metadata } from "next"
import { Orbitron } from "next/font/google"
import "./globals.css"

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-orbitron",
})

export const metadata: Metadata = {
  title: "Aphelion - Solar System Explorer",
  description: "A cinematic journey through our solar system — 10 worlds, 50 questions, 5.9 billion kilometres.",
    icons: {
    icon: "/astronauts/aphelion.jpg",
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
      </body>
    </html>
  )
}
