import { cn } from "@/lib/utils"

/**
 * Restrained ambient backdrop: a faint grid, one soft top glow and a vignette.
 * Deliberately subtle — depth without the "neon blob" cliché.
 */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      {/* faint static grid, faded out toward the edges */}
      <div className="bg-grid mask-radial absolute inset-0 opacity-[0.25]" />
      {/* single soft glow from the top */}
      <div className="absolute -top-32 left-1/2 h-[28rem] w-[44rem] -translate-x-1/2 rounded-[100%] bg-indigo/12 blur-[120px]" />
      <div className="absolute -top-10 right-[12%] size-72 rounded-full bg-cyan/8 blur-[120px]" />
      {/* vignette + bottom fade into the page */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,transparent_55%,var(--color-void)_85%)]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-void to-transparent" />
    </div>
  )
}
