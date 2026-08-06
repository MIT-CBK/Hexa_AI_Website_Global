# ── Build stage ──────────────────────────────────────────
FROM node:22-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ── Runtime stage ────────────────────────────────────────
FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Install only production deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Prisma engine + generated client
COPY prisma ./prisma
RUN npx prisma generate

# Compiled app
COPY --from=build /app/dist ./dist

# Writable dirs (also mounted as volumes in compose)
RUN mkdir -p prisma/data uploads

EXPOSE 4000
# Apply migrations then start. tsx is a devDep, so seeding is run separately.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
