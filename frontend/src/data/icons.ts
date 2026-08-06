import type { LucideIcon } from "lucide-react"
import {
  Activity,
  Radar,
  ShieldAlert,
  ShieldCheck,
  MonitorSmartphone,
  Headphones,
  Crosshair,
  Swords,
  ClipboardCheck,
  Network,
  Bug,
  Cpu,
  Lock,
  Layers,
  Zap,
  Server,
  Cloud,
  Database,
  Globe,
  Eye,
  Fingerprint,
  KeyRound,
  Siren,
} from "lucide-react"

/** Stable string keys → icon components, so icons can be stored in the DB. */
export const ICONS: Record<string, LucideIcon> = {
  network: Network,
  activity: Activity,
  radar: Radar,
  "shield-alert": ShieldAlert,
  "shield-check": ShieldCheck,
  monitor: MonitorSmartphone,
  headphones: Headphones,
  crosshair: Crosshair,
  swords: Swords,
  clipboard: ClipboardCheck,
  bug: Bug,
  cpu: Cpu,
  lock: Lock,
  layers: Layers,
  zap: Zap,
  server: Server,
  cloud: Cloud,
  database: Database,
  globe: Globe,
  eye: Eye,
  fingerprint: Fingerprint,
  key: KeyRound,
  siren: Siren,
}

/** The keys offered in the admin icon picker. */
export const ICON_KEYS = Object.keys(ICONS)

export function iconFor(key: string): LucideIcon {
  return ICONS[key] ?? ShieldCheck
}
