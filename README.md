# Hexa AI — Company website (full-stack)

Marketing website for **Hexa AI** — an AI-Native cybersecurity & operations platform.
A monorepo with a **frontend** (React) and a **backend** (API + database), deployed with Docker.

```
Hexa_AI_website/
├── frontend/          # React 19 + Vite + Tailwind v4 (SPA, nginx in production)
├── backend/           # Fastify + Prisma + SQLite (REST API)
├── docker-compose.yml # frontend + backend + volumes
└── .env.example       # environment variables for compose
```

## Features

- **English-only**, editorial "institutional intelligence" design (Palantir lineage).
- **Solutions** (`/solutions/*`): OBS (Observability), NMS, SIEM, NDR, EDR, SOAR.
- **Services** (`/services/*`): SOC, Pentest, Red Team, GRC (ISO 27001:2022, SOC 2 Type 2).
- **Certifications** (`/#certifications`): CISSP, OSCP, OSWE, OSEP, OSED, CRTO, CRTL, CCNP, CEH Master.
- **Vision & Mission**, CTA, and a dedicated detail page for every solution/service.
- **Newsletter**: list + search/filter, article reader (Markdown). Data served from the API.
- **Admin** (`/admin`): real JWT login (+ optional MFA), post CRUD, **cover-image upload**,
  Markdown editor with preview, a full content CMS, contacts, tickets, customer codes and resources.
- **Contact**: form saved to the database and (optionally) emailed to `info@hexacyber.ai`.

> Detailed deploy guide: see **[DEPLOY.md](DEPLOY.md)**.

## Architecture

```
Browser ──▶ Frontend (nginx)
              ├── /            → SPA (React)
              ├── /api/*       → proxy ──▶ Backend (Fastify :4000)
              └── /uploads/*   → proxy ──▶ Backend (uploaded images)
                                              │
                                              ├── Prisma ──▶ SQLite (volume)
                                              └── uploads/ (volume)
```

Thanks to the nginx proxy, the browser talks to **one origin** → no CORS in production.

## Run with Docker (recommended)

```bash
cp .env.example .env          # then set JWT_SECRET (openssl rand -hex 32), SMTP, admin password…
docker compose up --build
# Web:   http://localhost:8080
# Admin: http://localhost:8080/admin
```

The SQLite database and uploaded images live in Docker volumes (`hexa-data`, `hexa-uploads`), so they
survive rebuilds. The backend runs migrations and seeds starter data on first boot.

## Run in development (no Docker)

Two terminals:

```bash
# 1) Backend
cd backend
cp .env.example .env          # set JWT_SECRET
npm install
npm run prisma:migrate        # create DB + apply migrations
npm run dev                   # http://localhost:4000

# 2) Frontend
cd frontend
cp .env.example .env          # VITE_API_URL=http://localhost:4000
npm install
npm run dev                   # http://localhost:5180
```

Default admin account (override via env): `admin@hexa.ai` / `ChangeMe!123`.

## Security (Secure-by-Design)

- **Real auth**: Argon2id password hashing, JWT, every admin route behind an auth hook.
- **Zero-Trust input**: every payload validated with **zod** on both backend and frontend.
- **Injection**: Prisma only (parameterized) — no string-concatenated SQL.
- **Uploads**: MIME allowlist + size limit (2MB), stored with randomized filenames.
- **No** `dangerouslySetInnerHTML` — posts render from Markdown via react-markdown.
- **Hardening**: helmet, rate-limit (stricter on login/contact), CORS allowlist, fail-securely
  (no stack-trace leakage), structured logging (pino) — log events, not PII.
- Secrets are read from env only, never hardcoded; production requires `JWT_SECRET`.

See `frontend/README.md` and `backend/` for per-package details.
