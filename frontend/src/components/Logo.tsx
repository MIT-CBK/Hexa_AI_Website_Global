import { cn } from "@/lib/utils"

/** Hexagon "Hexa" mark — the brand glyph. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={cn("h-8 w-8", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="lm-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7ca0ff" />
          <stop offset="1" stopColor="#2e5be0" />
        </linearGradient>
      </defs>
      <path
        d="M16 2 L27.32 8.5 V21.5 L16 28 L4.68 21.5 V8.5 Z"
        stroke="url(#lm-grad)"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M16 9 L21.2 12 V18 L16 21 L10.8 18 V12 Z" fill="url(#lm-grad)" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="text-lg font-semibold tracking-tight">
        Hexa<span className="text-accent"> AI</span>
      </span>
    </span>
  )
}
