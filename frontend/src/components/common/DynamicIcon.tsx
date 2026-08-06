import { createElement } from "react"
import { iconFor } from "@/data/icons"

/**
 * Render a Lucide icon by its string key. Using createElement (instead of
 * binding the looked-up component to a local + JSX) keeps the linter happy and
 * avoids any "component created during render" warnings.
 */
export function DynamicIcon({ name, className }: { name: string; className?: string }) {
  return createElement(iconFor(name), { className })
}
