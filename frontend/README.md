# Hexa AI — Frontend

Marketing SPA for **Hexa AI**. Design language: "institutional intelligence" (Palantir
lineage) — neutral graphite dark theme, hairline structure, ruthless whitespace, one restrained
cool signal-blue accent, editorial typography, smooth scroll reveals.

> This is the frontend of the monorepo. See `../README.md` to run the full stack with Docker.

## Tech stack

- **React 19 + Vite + TypeScript** (strict mode)
- **Tailwind CSS v4** (via `@tailwindcss/vite`, design tokens in `src/index.css`)
- **TanStack Query v5** — data fetching (calls the backend API)
- **motion** (Framer Motion) — animation & scroll reveal
- **react-router-dom v7** — routing
- **react-markdown + remark-gfm** — post rendering (no `dangerouslySetInnerHTML`)
- **zod** — form validation
- **lucide-react** — icons

## Structure

```
src/
  components/      # common, newsletter, sections, ui, admin, Navbar, Footer, Logo
  data/            # site.ts, default-content.ts (solutions + services), icons.ts
  lib/             # api-client, content, newsletter, auth, contact, utils
  pages/           # Home, OfferingDetail, Newsletter, NewsletterPost, Support, Admin, NotFound
```

## Data layer

All data comes from the backend via `lib/api-client.ts` (fetch wrapper + JWT). Site content
(`lib/content.ts`), newsletter, admin and contact all call the real API; the bundled
`data/default-content.ts` is the fallback used until the CMS has a saved document.

- `VITE_API_URL` — backend URL. Leave blank in the Docker build → relative paths
  (nginx proxies `/api` + `/uploads`). In dev: `http://localhost:4000`.

## Commands

```bash
npm install
npm run dev      # dev server → http://localhost:5180
npm run build    # type-check + build
npm run lint     # eslint
npm run preview  # preview the build
```

## Security

- No `dangerouslySetInnerHTML` (Markdown rendered via react-markdown).
- Forms validated with zod; image uploads check MIME + size on the client before sending.
- JWT stored in localStorage, cleared on a 401; no hardcoded config (read from `import.meta.env`).
