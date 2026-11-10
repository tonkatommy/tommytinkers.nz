# syntax=docker/dockerfile:1
# One Dockerfile, two images:
#   --target migrate  runs `prisma migrate deploy` once, then exits
#   --target runner   the Next.js server
# Keeping migrations out of the runner means the server image never ships the
# Prisma CLI, and a failed migration stops a deploy before the new app starts.

FROM node:26-alpine AS base
# Node 25+ no longer bundles corepack, so pnpm is installed directly at the
# exact version pinned in package.json.
RUN npm install -g pnpm@12.16.1
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml prisma.config.ts ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma generate && pnpm build

# ---- migrate: full dev dependencies (Prisma CLI) + migrations, nothing else
FROM base AS migrate
COPY --from=deps /app/node_modules ./node_modules
COPY package.json prisma.config.ts docker-entrypoint.sh ./
COPY prisma ./prisma
USER node
ENTRYPOINT ["sh", "/app/docker-entrypoint.sh"]
# Call the Prisma CLI directly, not through pnpm. pnpm 12 looks up its own
# pinned version on the npm registry every time it starts, and this container
# is on the internal-only network, so `pnpm prisma ...` fails with a DNS error
# before Prisma even runs.
CMD ["./node_modules/.bin/prisma", "migrate", "deploy"]

# ---- runner: only Next's standalone output
FROM node:26-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
COPY --chown=node:node docker-entrypoint.sh ./
# The uploads volume mounts here. Creating it owned by `node` first means a new
# named volume inherits that owner, so the non-root server can write to it.
RUN mkdir -p /app/uploads && chown node:node /app/uploads
USER node
EXPOSE 3000
ENTRYPOINT ["sh", "/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]
