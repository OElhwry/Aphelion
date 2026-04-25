"use client"

import { cn } from "@/lib/utils"

type AphelionLogoProps = {
  variant?: "horizontal" | "icon"
  className?: string
  iconClassName?: string
  wordmarkClassName?: string
}

function AphelionMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden
      className={cn("h-8 w-8 text-white", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="32" cy="32" rx="27" ry="15" transform="rotate(28 32 32)" stroke="currentColor" strokeWidth="3" />
      <circle cx="20" cy="34" r="11" fill="currentColor" />
      <path d="M18 25h18l-9 9 9 9H18" fill="#05070d" />
      <circle cx="11" cy="30" r="1.9" fill="#05070d" />
      <circle cx="45.5" cy="19.5" r="3.6" fill="currentColor" />
    </svg>
  )
}

export function AphelionLogo({
  variant = "horizontal",
  className,
  iconClassName,
  wordmarkClassName,
}: AphelionLogoProps) {
  if (variant === "icon") return <AphelionMark className={cn("h-8 w-8", iconClassName, className)} />

  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <AphelionMark className={cn("h-7 w-7", iconClassName)} />
      <span
        className={cn("text-sm tracking-[0.34em] text-white/95", wordmarkClassName)}
        style={{ fontFamily: "var(--font-orbitron)" }}
      >
        APHELION
      </span>
    </div>
  )
}
