# Hexa AI Website — Deployment guide

This document explains how to deploy the site with Docker so it runs on a server.

---

## 1. Deploy with Docker (recommended)

Requirements: **Docker** + **Docker Compose** on the server.

### Step 1 — Configure the environment

```bash
cp .env.example .env
```

Open `.env` and fill in at least:

| Variable | Required | Notes |
| --- | --- | --- |
| `JWT_SECRET` | ✅ | JWT signing key. Generate with `openssl rand -hex 32` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | ✅ | First admin account — **set a strong password** |
| `CORS_ORIGIN` | recommended | Public URL of the site, e.g. `https://hexa.ai` |
| `WEB_PORT` | optional | Web port (default `8080`) |
| `SMTP_*` | optional | Email server for contact-form notifications. Blank = no mail (contacts still saved to DB) |

### Step 2 — Build & run

```bash
docker compose up --build -d
```

- Web: `http://<server>:8080`
- Admin: `http://<server>:8080/admin`

The backend runs migrations and seeds starter data on first boot. SQLite and uploaded
images live in Docker volumes (`hexa-data`, `hexa-uploads`) → **preserved** across rebuilds.

### Step 3 — Update with new code

```bash
git pull
docker compose up --build -d
```

### Handy commands

```bash
docker compose logs -f backend     # backend logs
docker compose logs -f frontend    # nginx logs
docker compose down                # stop (keep volumes/data)
docker compose down -v             # stop + DELETE data (careful)
```

---

## 3. Going public (production)

`docker compose` exposes the site on `WEB_PORT` (default 8080). To run production with a
domain + HTTPS, put a reverse proxy in front (we recommend **Caddy** or
**Nginx + Let's Encrypt**) pointing at `localhost:8080`.

Example `Caddyfile`:

```
hexa.ai {
    reverse_proxy localhost:8080
}
```

Then set `CORS_ORIGIN=https://hexa.ai` in `.env` and re-run
`docker compose up -d`.

---

## 4. Deployment topology

```
Internet ─▶ (Caddy/Nginx, HTTPS) ─▶ frontend container (nginx :80)
                                        ├── /            → SPA React
                                        ├── /api/*       → backend :4000
                                        └── /uploads/*   → backend :4000
                                                              └── SQLite + uploads (volume)
```

Frontend and backend are two separate containers communicating over the Docker network. The
browser only ever sees **one origin** (the frontend) → no CORS issues.

---

## 5. Post-deploy checklist

- [ ] Open `http://<server>:8080` — the homepage renders.
- [ ] `/#certifications`, `/newsletter`, and the `/solutions/*`, `/services/*` pages load.
- [ ] Log in to `/admin` with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
- [ ] Create a test post + upload an image → shows on `/newsletter`.
- [ ] Submit the contact form → check it in admin (and email if SMTP is configured).
- [ ] **Change the admin password** and make sure `JWT_SECRET` is a real secret value.
