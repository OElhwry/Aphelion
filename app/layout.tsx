import type React from "react"
import type { Metadata } from "next"
import { Orbitron } from "next/font/google"
import "./globals.css"
import Image from "next/image"

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
      <body className={`${orbitron.variable} font-orbitron`}>
        
        {/* Header */}
        <header className="fixed top-0 left-0 w-full flex items-center justify-between px-6 py-4 z-50">
          <div className="flex items-center gap-3">
            <span className="text-white font-semibold text-lg">
              Aphelion
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="pt-20">
          {children}
        </main>

      </body>
    </html>
  )
}
