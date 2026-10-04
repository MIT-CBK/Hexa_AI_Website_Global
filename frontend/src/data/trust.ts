/**
 * Customer-outcome cards for the homepage "Trusted by" marquee.
 *
 * NOTE: replace these with real, customer-approved results before relying on
 * them publicly. Keep attributions anonymised (sector, not company name)
 * unless the customer has agreed to be named.
 */
export type TrustCard =
  | { kind: "stat"; value: string; text: string; source: string }
  | { kind: "quote"; quote: string; source: string }

export const TRUST_HEADING = {
  eyebrow: "Customer outcomes",
  lead: "Trusted by forward-looking",
  accent: "security leaders",
}

export const TRUST_CARDS: TrustCard[] = [
  {
    kind: "stat",
    value: "87%",
    text: "Fewer alerts reaching analysts after AI correlation and de-duplication",
    source: "Tier-1 commercial bank",
  },
  {
    kind: "quote",
    quote:
      "The AIOps engine flagged a degrading core switch two days before it failed. We replaced it in a maintenance window instead of explaining an outage to the business.",
    source: "National telecom operator",
  },
  {
    kind: "stat",
    value: "6 min",
    text: "Mean time to respond, down from over three hours with automated playbooks",
    source: "Digital payments provider",
  },
  {
    kind: "quote",
    quote:
      "We retired four separate consoles. Our SOC now investigates from one timeline instead of copy-pasting between tools.",
    source: "Consumer finance company",
  },
  {
    kind: "stat",
    value: "12,000+",
    text: "Network devices auto-discovered and mapped across 140 branch sites in the first week",
    source: "Nationwide retail chain",
  },
  {
    kind: "quote",
    quote:
      "Their pentest team found an authentication bypass in our mobile API that two previous vendors missed — with a fix our developers shipped the same week.",
    source: "E-commerce platform",
  },
  {
    kind: "stat",
    value: "64%",
    text: "Fewer network incidents after six months of predictive alerting and auto-remediation",
    source: "Logistics & supply chain",
  },
  {
    kind: "quote",
    quote:
      "We went from no formal ISMS to ISO 27001:2022 certification in under nine months, with zero major findings at audit.",
    source: "Insurance group",
  },
  {
    kind: "stat",
    value: "< 60s",
    text: "From suspicious process to isolated endpoint, without waiting for an analyst",
    source: "Manufacturing group",
  },
]
