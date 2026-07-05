FROM node:22-alpine AS base
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml prisma.config.ts ./
COPY prisma ./prisma
# `prisma generate` (run via postinstall) resolves DATABASE_URL eagerly even though it
# never connects — this placeholder only needs to exist, the real value is supplied at
# container runtime via .env / docker-compose env_file. Passed as a shell-scoped var on
# the RUN line (not a persisted ENV instruction) so Dockerfile secret-name linters don't
# flag this non-secret placeholder.
RUN DATABASE_URL="postgresql://user:pass@localhost:5432/db" pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Same placeholder rationale as the deps stage — `next build` never connects to Postgres
# (every route in this app is dynamic/server-rendered on demand), but Auth.js and Prisma
# config validation both expect these env vars to at least be present at build time.
# Exported once and reused for both commands below, rather than declared via ENV, for the
# same lint reason as the deps stage — this also means the value never appears as image
# layer metadata in any stage.
RUN export DATABASE_URL="postgresql://user:pass@localhost:5432/db" \
      AUTH_SECRET="build-time-placeholder-not-used-at-runtime" && \
    pnpm prisma generate && \
    pnpm build

# pnpm's node_modules is a tree of symlinks into a content-addressable .pnpm store.
# Cherry-picking individual package folders (as the standalone runner would otherwise
# need, to get the `prisma`/`tsx` CLIs alongside Next's traced output) breaks those
# symlinks. A dedicated prod-only install gives a complete, correctly-resolved
# node_modules instead.
FROM base AS prod-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml prisma.config.ts ./
COPY prisma ./prisma
# See deps stage above for why this is a RUN-scoped var rather than ENV.
RUN DATABASE_URL="postgresql://user:pass@localhost:5432/db" pnpm install --prod --frozen-lockfile

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/scripts ./scripts
# `src/lib` etc. aren't part of Next's traced standalone server bundle, but the seed
# and promote-admin scripts (run via tsx, not through Next) import from here directly.
COPY --from=builder /app/src ./src
COPY --from=prod-deps /app/node_modules ./node_modules
EXPOSE 3000
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node server.js"]
