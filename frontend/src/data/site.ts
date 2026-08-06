import type { L } from "@/i18n"

export const SITE = {
  name: "Hexa AI",
  email: "info@hexacyber.ai",
} as const

export const SITE_DESCRIPTION: L = {
  vi: "Hexa AI unifies infrastructure monitoring, threat detection and automated response on a single platform — backed by an internationally-certified security team.",
  en: "Hexa AI unifies infrastructure monitoring, threat detection and automated response on a single platform — backed by an internationally-certified security team.",
}

export const STATS: { value: string; label: L }[] = [
  { value: "10", label: { vi: "Solutions & services", en: "Solutions & services" } },
  { value: "9+", label: { vi: "Global certifications", en: "Global certifications" } },
  { value: "<60s", label: { vi: "Detection time (MTTD)", en: "Detection time (MTTD)" } },
  { value: "24/7", label: { vi: "SOC monitoring", en: "SOC monitoring" } },
]
