"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type Person = { name: string; craft: string }

/**
 * Subtle live readout of how many people are in space right now, à la
 * satellitemap's People feature. Fetches our cached /api/people-in-space proxy
 * and silently hides itself if the data can't be loaded.
 */
export function PeopleInSpace({ className }: { className?: string }) {
  const [count, setCount] = useState<number | null>(null)
  const [crafts, setCrafts] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    fetch("/api/people-in-space")
      .then((r) => r.json())
      .then((d: { number: number | null; people: Person[] }) => {
        if (cancelled || d?.number == null) return
        setCount(d.number)
        setCrafts(Array.from(new Set((d.people ?? []).map((p) => p.craft))))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  if (count == null) return null

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3.5 py-1.5 backdrop-blur-sm",
        className,
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300/70" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-300" />
      </span>
      <span className="text-[11px] tracking-wide text-white/80">
        <span className="font-semibold text-white">{count}</span> people in space right now
        {crafts.length > 0 && <span className="text-white/45"> · {crafts.join(", ")}</span>}
      </span>
    </div>
  )
}
