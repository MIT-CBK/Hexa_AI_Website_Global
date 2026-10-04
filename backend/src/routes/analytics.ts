import type { FastifyInstance } from "fastify"
import { trackSchema } from "../schemas.js"
import { prisma } from "../lib/prisma.js"
import { BOT_UA, clientIp, describeUserAgent, geoFromHeaders } from "../lib/client-ip.js"

const DAY = 86_400_000
// Visits older than this are pruned so IP data isn't kept indefinitely.
const RETENTION_DAYS = 180

/** Public: record one page view. Always answers 204 so it never breaks the page. */
export async function trackRoutes(app: FastifyInstance) {
  app.post(
    "/",
    { config: { rateLimit: { max: 60, timeWindow: "1 minute" } } },
    async (req, reply) => {
      const parsed = trackSchema.safeParse(req.body)
      const ua = req.headers["user-agent"] ?? ""
      if (!parsed.success || BOT_UA.test(ua) || parsed.data.path.startsWith("/admin")) {
        return reply.code(204).send()
      }
      const { visitorId, path, referrer } = parsed.data

      // Ignore an immediate duplicate (double-fired effect, quick reload).
      const dup = await prisma.visit.findFirst({
        where: { visitorId, path, createdAt: { gte: new Date(Date.now() - 10_000) } },
        select: { id: true },
      })
      if (!dup) {
        await prisma.visit.create({
          data: {
            visitorId,
            path,
            referrer: referrer || null,
            ip: clientIp(req),
            userAgent: ua.slice(0, 300) || null,
            ...geoFromHeaders(req),
          },
        })
      }
      return reply.code(204).send()
    },
  )
}

interface Lead {
  type: "contact" | "order"
  email: string
  name: string | null
  detail: string | null
  at: string
}

/** Admin: aggregated traffic + per-visitor list for the "Analyst" tab. */
export async function adminAnalyticsRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { days?: string; tz?: string } }>("/", async (req) => {
    const days = Math.min(Math.max(Number(req.query.days) || 30, 1), RETENTION_DAYS)
    // Browser's getTimezoneOffset() (minutes; Vietnam = -420) so days bucket in local time.
    const tz = Math.min(Math.max(Number(req.query.tz) || 0, -840), 840)
    const toLocal = (d: Date) => new Date(d.getTime() - tz * 60_000)
    const dayKey = (d: Date) => toLocal(d).toISOString().slice(0, 10)

    const now = new Date()
    await prisma.visit.deleteMany({ where: { createdAt: { lt: new Date(now.getTime() - RETENTION_DAYS * DAY) } } })

    // Start of the local day (days-1) days ago.
    const localMidnight = new Date(`${dayKey(now)}T00:00:00.000Z`).getTime() + tz * 60_000
    const from = new Date(localMidnight - (days - 1) * DAY)

    const visits = await prisma.visit.findMany({
      where: { createdAt: { gte: from } },
      orderBy: { createdAt: "asc" },
      take: 100_000,
    })

    // Leads (contact form / Buy-now) tied to a visitor.
    const [contacts, orders] = await Promise.all([
      prisma.contactMessage.findMany({
        where: { visitorId: { not: null } },
        select: { visitorId: true, email: true, name: true, company: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 3000,
      }),
      prisma.order.findMany({
        where: { visitorId: { not: null } },
        select: { visitorId: true, email: true, name: true, product: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 3000,
      }),
    ])
    const leadsBy = new Map<string, Lead[]>()
    const addLead = (id: string | null, lead: Lead) => {
      if (!id) return
      const list = leadsBy.get(id) ?? []
      list.push(lead)
      leadsBy.set(id, list)
    }
    for (const c of contacts)
      addLead(c.visitorId, { type: "contact", email: c.email, name: c.name, detail: c.company, at: c.createdAt.toISOString() })
    for (const o of orders)
      addLead(o.visitorId, { type: "order", email: o.email, name: o.name, detail: o.product, at: o.createdAt.toISOString() })

    type Agg = {
      visitorId: string
      ip: string
      ips: Set<string>
      country: string | null
      region: string | null
      city: string | null
      firstSeen: Date
      lastSeen: Date
      pageviews: number
      paths: Set<string>
      landing: string
      lastPath: string
      referrer: string | null
      userAgent: string | null
    }
    const byVisitor = new Map<string, Agg>()
    const daily = new Map<string, { pageviews: number; visitors: Set<string> }>()
    const countries = new Map<string, Set<string>>()
    const pages = new Map<string, number>()
    const referrers = new Map<string, number>()

    for (const v of visits) {
      let a = byVisitor.get(v.visitorId)
      if (!a) {
        a = {
          visitorId: v.visitorId,
          ip: v.ip,
          ips: new Set(),
          country: null,
          region: null,
          city: null,
          firstSeen: v.createdAt,
          lastSeen: v.createdAt,
          pageviews: 0,
          paths: new Set(),
          landing: v.path,
          lastPath: v.path,
          referrer: null,
          userAgent: null,
        }
        byVisitor.set(v.visitorId, a)
      }
      a.pageviews++
      a.paths.add(v.path)
      a.ips.add(v.ip)
      a.ip = v.ip
      a.lastSeen = v.createdAt
      a.lastPath = v.path
      a.country = v.country ?? a.country
      a.region = v.region ?? a.region
      a.city = v.city ?? a.city
      a.userAgent = v.userAgent ?? a.userAgent
      if (!a.referrer && v.referrer) {
        a.referrer = v.referrer
        let host = v.referrer
        try {
          host = new URL(v.referrer).hostname.replace(/^www\./, "")
        } catch {
          /* keep raw */
        }
        referrers.set(host, (referrers.get(host) ?? 0) + 1)
      }

      const k = dayKey(v.createdAt)
      const d = daily.get(k) ?? { pageviews: 0, visitors: new Set<string>() }
      d.pageviews++
      d.visitors.add(v.visitorId)
      daily.set(k, d)
      pages.set(v.path, (pages.get(v.path) ?? 0) + 1)
      if (v.country) {
        const set = countries.get(v.country) ?? new Set<string>()
        set.add(v.visitorId)
        countries.set(v.country, set)
      }
    }

    const series = Array.from({ length: days }, (_, i) => {
      const key = dayKey(new Date(from.getTime() + i * DAY + 12 * 3_600_000))
      const d = daily.get(key)
      return { date: key, pageviews: d?.pageviews ?? 0, visitors: d?.visitors.size ?? 0 }
    })
    const today = series[series.length - 1]

    const visitors = [...byVisitor.values()]
      .sort((x, y) => y.lastSeen.getTime() - x.lastSeen.getTime())
      .slice(0, 500)
      .map((a) => {
        const leads = (leadsBy.get(a.visitorId) ?? []).sort((x, y) => (x.at < y.at ? 1 : -1))
        return {
          visitorId: a.visitorId,
          ip: a.ip,
          otherIps: [...a.ips].filter((ip) => ip !== a.ip),
          country: a.country,
          region: a.region,
          city: a.city,
          firstSeen: a.firstSeen.toISOString(),
          lastSeen: a.lastSeen.toISOString(),
          pageviews: a.pageviews,
          pages: a.paths.size,
          landing: a.landing,
          lastPath: a.lastPath,
          referrer: a.referrer,
          ...describeUserAgent(a.userAgent),
          leftContact: leads.length > 0,
          leads,
        }
      })

    const leadVisitors = [...byVisitor.keys()].filter((id) => leadsBy.has(id)).length
    const top = <T,>(m: Map<string, T>, size: (v: T) => number, n = 8) =>
      [...m.entries()]
        .map(([key, v]) => ({ key, count: size(v) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, n)

    return {
      days,
      from: from.toISOString(),
      totals: {
        pageviews: visits.length,
        visitors: byVisitor.size,
        leads: leadVisitors,
        conversion: byVisitor.size ? leadVisitors / byVisitor.size : 0,
        todayPageviews: today?.pageviews ?? 0,
        todayVisitors: today?.visitors ?? 0,
        locatedVisitors: [...byVisitor.values()].filter((a) => a.country).length,
      },
      series,
      topCountries: top(countries, (s) => s.size),
      topPages: top(pages, (n) => n),
      topReferrers: top(referrers, (n) => n, 6),
      visitors,
    }
  })

  // One visitor's page journey.
  app.get<{ Params: { id: string } }>("/visitors/:id", async (req) => {
    const rows = await prisma.visit.findMany({
      where: { visitorId: req.params.id },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { path: true, createdAt: true, ip: true },
    })
    return rows.map((r) => ({ path: r.path, ip: r.ip, at: r.createdAt.toISOString() }))
  })
}
