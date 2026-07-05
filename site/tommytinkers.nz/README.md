# tommytinkers.nz — Site

Next.js website for the Tommy Tinkers NZ freelance web & software development business.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Runtime:** React 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4 + custom CSS design tokens
- **Icons:** Lucide React
- **Package Manager:** pnpm
- **Auth:** Auth.js (NextAuth v5) — email/password (bcrypt) + Google OAuth
- **Database:** PostgreSQL via Prisma ORM (driver adapter, no bundled engine)

## Pages

| Route | Description |
|---|---|
| `/` | Home / landing |
| `/shop` | E-commerce shop with shopping cart |
| `/shed` | About & contact (with email) |
| `/codebench` | Code demos |
| `/login`, `/signup` | Auth — email/password or Google |
| `/account` | Logged-in user's own profile (name/email/password) |
| `/admin` | Stockroom inventory tool — requires the `access_admin` permission |

## Key Features

- **Shopping cart** — React Context state with a slide-out CartDrawer
- **Email** — Server-side contact form and cart checkout email
- **Pinboard feed API** — `GET /api/pinboard` and `PUT /api/pinboard`; JSON file-based storage at `data/pinboard-feed.json`
- **Design system** — CSS custom properties and `@font-face` declarations in `src/app/globals.css`
- **Theme** — Light/dark mode toggled via localStorage
- **Auth & RBAC** — user accounts with a `Role` (`ADMIN`/`USER`) holding a `permissions` string array; `src/proxy.ts` gates `/admin` and `/account` at the edge, `src/app/admin/layout.tsx` is the authoritative server-side check. See [Authentication & Roles](#authentication--roles) below.

## Development

Requires a running Postgres instance (see [Authentication & Roles](#authentication--roles) for the schema/migration setup).

```bash
pnpm install
cp .env.example .env   # fill in DATABASE_URL, AUTH_SECRET, etc.
pnpm prisma migrate dev
pnpm prisma db seed
pnpm dev        # http://localhost:3000
```

## Build & Production

```bash
pnpm build
pnpm start
```

## Authentication & Roles

Auth.js v5 + Prisma + Postgres, with a granular permissions system (not just a boolean admin flag):

- `Role` has a `permissions: String[]` column (e.g. `access_admin`, `manage_inventory`) — adding a new permission is just a string, no migration needed. Permission keys are centralized in `src/lib/auth/permissions.ts`.
- `User.roleId` points at a `Role`; new signups get the `USER` role (no permissions) by default.
- Sessions are JWT-based (required for the Credentials provider). A permission change in the DB takes effect on the user's *next login*, not immediately — there's no live DB check on every request by design.
- Password login has a built-in lockout: 5 failed attempts locks the account for 15 minutes (`User.failedLoginCount` / `lockedUntil`).

**Environment variables** (see `.env.example`): `DATABASE_URL`, `AUTH_SECRET` (generate via `npx auth secret`), `AUTH_URL`, `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` (Google Cloud Console OAuth client; redirect URI is `<AUTH_URL>/api/auth/callback/google`), `INITIAL_ADMIN_EMAIL` (only used by the bootstrap script below).

### Bootstrapping the first admin

There's no public "become admin" endpoint. Instead:

1. Run migrations + seed the default roles: `pnpm prisma migrate deploy` (or `migrate dev` locally), then `pnpm prisma db seed` — creates `ADMIN` (all permissions) and `USER` (none) roles.
2. Sign up normally through `/signup` — you'll be created as `USER`.
3. Promote yourself from the server: `pnpm tsx scripts/promote-admin.ts you@example.com` (or run it inside the container — see below).
4. Log out and back in so a fresh JWT picks up the new permissions.

## Deployment — Docker Compose on a homelab, via Cloudflare Tunnel

The whole stack (`db`, `app`, `cloudflared`) runs as one Docker Compose project — see `docker-compose.yml` and `Dockerfile`. No ports are exposed on the host; `cloudflared` makes an outbound-only connection to Cloudflare's edge, so no port forwarding or static IP is needed even behind CGNAT.

**One-time Cloudflare Tunnel setup** (Zero Trust dashboard → Networks → Tunnels):
1. Create a tunnel, choose the Docker connector, copy the token into `.env` as `CLOUDFLARE_TUNNEL_TOKEN`.
2. Add a Public Hostname for your domain → service type `HTTP`, URL `app:3000`. Cloudflare creates the DNS record automatically.
3. Set Cloudflare SSL/TLS mode to **Full**.

**On the homelab machine:**
```bash
cp .env.example .env    # fill in real values, including CLOUDFLARE_TUNNEL_TOKEN
docker compose up -d --build
```
The `app` container runs `prisma migrate deploy` automatically on every start before booting the server — schema changes apply on deploy with no separate manual step.

**Seeding roles / promoting the first admin inside the container** (invoke the binaries directly rather than via `pnpm exec`, which would otherwise re-trigger pnpm's install/build-approval flow inside the slim runner image):
```bash
docker compose exec app sh -c "PATH=/app/node_modules/.bin:\$PATH node_modules/.bin/prisma db seed"
docker compose exec app sh -c "PATH=/app/node_modules/.bin:\$PATH node_modules/.bin/tsx scripts/promote-admin.ts you@example.com"
```

Google OAuth login can only be fully verified once the tunnel is live and pointed at your real domain (test email/password login locally first).

## Project Structure

```
auth.ts, auth.config.ts    # Auth.js config (config split out so src/proxy.ts can load it edge-safe)
prisma/
├── schema.prisma          # User/Role/Account/Session/VerificationToken
├── seed.ts                # Upserts default ADMIN/USER roles
└── migrations/
scripts/
└── promote-admin.ts       # One-off: promote a signed-up user to ADMIN
src/
├── proxy.ts               # Route protection for /admin, /account (must live in src/, not root)
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # Auth.js route handler
│   │   └── pinboard/            # Pinboard feed API route
│   ├── login/, signup/          # Auth pages + server actions
│   ├── account/                 # User's own profile + change-password
│   ├── admin/
│   │   ├── layout.tsx           # requirePermission(access_admin) gate
│   │   └── page.tsx             # Stockroom inventory tool (unchanged, localStorage-backed)
│   ├── codebench/      # Code demos page
│   ├── shed/           # About & contact page
│   ├── shop/           # Shop page
│   ├── globals.css     # Design tokens, fonts, Tailwind
│   ├── layout.tsx      # Root layout (theme + cart provider)
│   └── page.tsx        # Home page
├── components/
│   ├── CartDrawer.tsx
│   ├── Footer.tsx
│   ├── Nav.tsx          # Server component — reads session, passes isAdmin/isAuthed booleans only
│   ├── NavClient.tsx    # Client nav UI, conditionally renders the Admin link
│   └── SiteFxDriver.tsx
└── lib/
    ├── auth/
    │   ├── permissions.ts          # Centralized permission key constants + default roles
    │   ├── require-permission.ts   # requireSession() / requirePermission() server helpers
    │   └── logout-action.ts
    ├── prisma.ts        # Prisma client singleton (driver adapter, no bundled engine)
    ├── cart-context.tsx
    ├── products.ts
    └── types.ts
```
