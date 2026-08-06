import { cn } from "@/lib/utils"
import { Reveal } from "./Reveal"

interface SectionHeadingProps {
  eyebrow?: string
  title: React.ReactNode
  description?: string
  align?: "left" | "center"
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "mx-auto max-w-2xl items-center text-center" : "items-start",
        className,
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            "eyebrow flex items-center",
            align === "center" ? "justify-center" : "eyebrow-rule",
          )}
        >
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-semibold tracking-[-0.02em] text-balance sm:text-4xl md:text-[2.75rem] md:leading-[1.08]">
        {title}
      </h2>
      {description && (
        <p className={cn("text-pretty text-muted md:text-lg", align === "center" && "max-w-xl")}>
          {description}
        </p>
      )}
    </Reveal>
  )
}
