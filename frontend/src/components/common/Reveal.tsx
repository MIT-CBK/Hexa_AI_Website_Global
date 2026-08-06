import { motion } from "motion/react"
import type { ReactNode } from "react"

interface RevealProps {
  children: ReactNode
  /** stagger delay in seconds */
  delay?: number
  y?: number
  className?: string
}

/** Scroll-triggered fade-up reveal. Respects reduced-motion via motion defaults. */
export function Reveal({ children, delay = 0, y = 24, className }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
