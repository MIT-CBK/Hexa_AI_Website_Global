/** Localized (bilingual) value. */
export interface LV {
  vi: string
  en: string
}

export type OfferingKind = "solution" | "service"

export interface AiHighlight {
  title: LV
  desc: LV
  points: { title: LV; desc: LV }[]
}

export interface Offering {
  slug: string
  abbr: string
  iconKey: string
  gradient: string
  category: LV
  name: LV
  tagline: LV
  summary: LV
  overview: LV
  features: { title: LV; desc: LV }[]
  outcomes: LV[]
  /** Optional spotlight block (e.g. AIOps) shown on the detail page. */
  aiHighlight?: AiHighlight
}

export interface CertItem {
  code: string
  issuer: string
  name: LV
  blurb: LV
  elite?: boolean
  /** Optional uploaded logo (served from /uploads). Falls back to the icon emblem. */
  logoUrl?: string
}

export interface CertGroup {
  key: string
  iconKey: string
  gradient: string
  title: LV
  desc: LV
  items: CertItem[]
}

export interface Heading {
  eyebrow: LV
  title: LV
  desc: LV
}

/** The whole editable content document (mirrors the backend zod schema). */
export interface SiteContent {
  home: {
    hero: { badge: LV; title: LV; subtitle: LV }
    stats: { value: string; label: LV }[]
    solutions: Heading
    services: Heading
    vision: {
      eyebrow: LV
      title: LV
      visionTitle: LV
      visionBody: LV
      missionTitle: LV
      missionBody: LV
      values: { iconKey: string; title: LV; desc: LV }[]
    }
    certs: Heading
    newsletter: { eyebrow: LV; previewTitle: LV; previewDesc: LV }
    cta: { title: LV; desc: LV }
    contact: { eyebrow: LV; title: LV; desc: LV; email: string; office: LV }
  }
  solutions: Offering[]
  services: Offering[]
  certGroups: CertGroup[]
}
