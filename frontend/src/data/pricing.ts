/**
 * Per-product configurator definitions for the "Buy now" flow.
 * Capacity metric and add-ons vary by product; every product supports both a
 * Cloud (subscription, metered + regioned) and Self-hosted (perpetual) model.
 */
export type Deployment = "cloud" | "self-hosted"

export interface ProductPricing {
  metric: "nodes" | "eps" | "throughput" | "seats"
  metricLabel: string
  metricHint?: string
  min: number
  step: number
  default: number
  /** NDR also sizes by number of sensors. */
  hasSensors?: boolean
  aiops: boolean
  multiTenant: boolean
  languagePack: boolean
  deployments: Deployment[]
}

export const PRICING: Record<string, ProductPricing> = {
  observability: {
    metric: "nodes", metricLabel: "Monitored nodes", metricHint: "Hosts, containers and services under observation",
    min: 5, step: 5, default: 25, aiops: true, multiTenant: true, languagePack: true,
    deployments: ["cloud", "self-hosted"],
  },
  nms: {
    metric: "nodes", metricLabel: "Network devices", metricHint: "Switches, routers, firewalls, APs, servers",
    min: 10, step: 10, default: 100, aiops: true, multiTenant: true, languagePack: true,
    deployments: ["cloud", "self-hosted"],
  },
  edr: {
    metric: "nodes", metricLabel: "Endpoints", metricHint: "Workstations and servers running the agent",
    min: 10, step: 10, default: 100, aiops: true, multiTenant: true, languagePack: true,
    deployments: ["cloud", "self-hosted"],
  },
  siem: {
    metric: "eps", metricLabel: "EPS (events per second)", metricHint: "Sustained ingestion rate across all sources",
    min: 500, step: 500, default: 5000, aiops: true, multiTenant: true, languagePack: true,
    deployments: ["cloud", "self-hosted"],
  },
  ndr: {
    metric: "throughput", metricLabel: "Throughput (Gbps)", metricHint: "Peak monitored traffic across all sensors",
    min: 1, step: 1, default: 10, hasSensors: true, aiops: true, multiTenant: true, languagePack: true,
    deployments: ["cloud", "self-hosted"],
  },
  soar: {
    metric: "seats", metricLabel: "Analyst seats", metricHint: "Named users operating playbooks and cases",
    min: 1, step: 1, default: 5, aiops: true, multiTenant: true, languagePack: true,
    deployments: ["cloud", "self-hosted"],
  },
}

export const TERMS = ["1 year", "2 years", "3 years"] as const
export const REGIONS = [
  "United States",
  "European Union",
  "United Kingdom",
  "Singapore (APAC)",
  "Vietnam",
  "Australia",
  "Middle East",
] as const

export function pricingFor(slug: string): ProductPricing | undefined {
  return PRICING[slug]
}
