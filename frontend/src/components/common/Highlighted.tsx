/**
 * Render a heading string, stripping the *emphasis* markers. Titles render
 * solid (no gradient-on-a-word) for a calmer, editorial feel; the accent is
 * reserved for the mono eyebrow and the hero.
 */
export function Highlighted({ text }: { text: string }) {
  return <>{text.replace(/\*/g, "")}</>
}
