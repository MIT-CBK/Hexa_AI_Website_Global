import { forwardRef } from "react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

type Variant = "primary" | "ghost" | "outline"
type Size = "sm" | "md" | "lg"

const base =
  "inline-flex cursor-pointer items-center justify-center gap-2 font-medium rounded-md transition-all duration-200 ease-cinema focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap"

const variants: Record<Variant, string> = {
  // Palantir-style primary: crisp white on graphite, no glow.
  primary:
    "text-void bg-fg shadow-[var(--shadow-cta)] hover:bg-white hover:-translate-y-px active:translate-y-0",
  outline:
    "text-fg border border-line-strong bg-transparent hover:border-accent hover:bg-accent/[0.06] hover:text-white",
  ghost: "text-muted hover:text-white hover:bg-white/5",
}

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[0.95rem]",
}

interface CommonProps {
  variant?: Variant
  size?: Size
  className?: string
  children: React.ReactNode
}

type ButtonProps = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { as?: "button" }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  ),
)
Button.displayName = "Button"

interface LinkButtonProps extends CommonProps {
  to: string
  external?: boolean
  onClick?: () => void
}

export function LinkButton({
  to,
  external,
  variant = "primary",
  size = "md",
  className,
  children,
  onClick,
}: LinkButtonProps) {
  const cls = cn(base, variants[variant], sizes[size], className)
  if (external || to.startsWith("http") || to.startsWith("mailto:")) {
    return (
      <a
        href={to}
        className={cls}
        target={external ? "_blank" : undefined}
        rel="noreferrer"
        onClick={onClick}
      >
        {children}
      </a>
    )
  }
  return (
    <Link to={to} className={cls} onClick={onClick}>
      {children}
    </Link>
  )
}
