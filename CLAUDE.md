# tommytinkers.nz

Side-hustle site for Tommy Goodman ("Maker of Things", Helensville NZ). It has two halves: freelance web and software work (the Codebench page), and a maker shop. The shop's real range is personalised RC name window stickers, race-club grid sticker sets and custom sticker sheets; RC parts, kids' toys and household bits show as "coming soon" (see Shop decisions). Around both sits a community area, The Shed.

This file is the single source of project guidance for every coding agent. `AGENTS.md` only points here, so edit this file and nothing else.

**Active work is v2.0**, a ground-up rebuild in `site/tommytinkers.nz.v2.0`. v1 (`site/tommytinkers.nz`) is live in production and is reference only: don't add features to it.

The v2 plan, with every decision and its reasoning: https://claude.ai/artifact/XUjDd7kyNkr9fNoFxoF7CQ

The v2 UI design, every page and state in both themes at desktop and mobile sizes: https://claude.ai/artifact/9uCGiFfBAyfo1yeKShipHw. If the design and this file disagree on a fact (a rate, a price, a rule), this file wins and the design gets fixed.

## Repo layout

```
site/tommytinkers.nz.v2.0/   v2 app (all new work goes here)
site/tommytinkers.nz/        v1 app, live, reference only
deploy/                      v2 Docker Compose: compose.yaml, compose.staging.yaml, backup/, secrets/
design/brand/                logo masters
design/prototype/            static HTML/JSX prototype (the visual and behavioural spec)
docs/                        business summary (Feb 2026, business context only)
```

## Sources of truth (in priority order)

1. **The v2 code.** If code and any other source disagree about how something is built, the code wins.
2. **The v2 plan** (link above) for scope and decisions.
3. **The design system** (`tommytinkers.nz DS.zip` in the claude.ai project: `README.md`, `design.md`, `colors_and_type.css`). It wins on visuals, copy and interaction. Ignore its `SKILL.md` advice to copy the sister site's zero-build static setup.
4. **The prototype** in `design/prototype/`. Port its look and behaviour, never its code structure: it relies on `window.*` globals, Babel standalone, inline styles, `data-lucide` icons and localStorage.
5. **v1** for how things were done before (RBAC keys, lockout logic, FX driver). Don't copy its pages: they are single giant client components.

## v2 stack (versions pinned 02/11/2026)

| Layer | Choice |
|---|---|
| Runtime | Node 26 LTS (`node:26-alpine`) |
| Framework | Next.js 16.4.3 App Router, `output: "standalone"`, React 19.3.1 with React Compiler |
| Language | TypeScript 6.0.3 strict, `@/*` → `src/*` |
| Styling | Tailwind CSS 4.3 plus DS tokens as CSS custom properties in `src/app/globals.css` |
| Auth | Better Auth 1.7 (email + password, Google, admin and access-control plugins) |
| Database | PostgreSQL 18.6 via Prisma 7.10.1 with `@prisma/adapter-pg`; client generated into `src/generated/prisma` |
| Validation | zod 4 |
| Icons | Phosphor (`@phosphor-icons/react` 2.1.10) |
| Email | Resend, free plan |
| Payments | Stripe Checkout, NZD |
| Tests | Vitest 5, Playwright 1.64 (not set up yet) |
| Lint | ESLint 10 with `eslint-config-next` |
| Packages | pnpm 12.16.1 |

Version traps, all verified on 02/11/2026:

- **TypeScript stays on 6.x.** Next builds on TS 7, but typescript-eslint (inside `eslint-config-next`) refuses TS 7, so lint can't run. Move only once typescript-eslint supports 7.
- **Prisma stays on 7.x.** npm's `latest` tag points at 8.0 RC, and Better Auth's Prisma adapter supports up to 7. Don't let `pnpm update` jump it.
- **Node 26 has no bundled corepack.** The Dockerfile installs pnpm with `npm install -g`.
- **Postgres 18 moved its data dir** to `/var/lib/postgresql/18/docker`. The volume mounts `/var/lib/postgresql`.

Next 16, Better Auth, Prisma 7 and Tailwind 4 all changed APIs recently. Check current docs (Context7) before writing against them; don't go from memory. Example: route protection lives in `src/proxy.ts`, not `middleware.ts`.

## Commands (run in `site/tommytinkers.nz.v2.0`)

```bash
pnpm install          # also runs prisma generate
pnpm dev
pnpm lint
pnpm typecheck
pnpm build
pnpm db:migrate       # prisma migrate dev (needs DATABASE_URL, see .env.example)
```

Full stack from the repo root (create the secret first: `openssl rand -hex 32 > deploy/secrets/db_password.txt`, hex only because it goes into a URL):

```bash
docker compose -f deploy/compose.yaml up -d --build
docker compose -p tt-staging -f deploy/compose.yaml -f deploy/compose.staging.yaml up -d --build
```

## Architecture rules

- **Server first.** Pages are server components. Client components are small islands at the leaves (cart drawer, typewriter hero, FX driver, questionnaire, forms, theme toggle). Keep `"use client"` as low as possible.
- **One data layer.** All database access goes through `src/server/*` (marked `server-only`). Those functions check the session and permission themselves, so a page or action can't skip the check by accident.
- **Two auth gates.** `src/proxy.ts` does a cheap redirect. `requirePermission()` in the data layer is the real check, because server actions are public POST endpoints.
- **Mutations** are server actions with zod input. Route handlers only for things outside the app calling in: auth, Stripe webhook, uploads, `/api/health`.
- **Money** is integer cents (`priceCents`). The server re-prices every cart line at checkout; never trust a client price.
- **Dates** are stored in UTC and shown as DD/MM/YYYY in NZ time.
- **Theme** lives in a cookie so the server renders the right `data-theme` with no flash. Dark is the default.

## Decisions already made (don't reopen without asking)

- v2 starts with an **empty database**. No v1 users or data migrate; members sign up again.
- **Pinboard** is public to read; posting and reacting need a free account. A new account's first 3 posts go to moderation. Limits: 500 characters and one image of up to 5 MB per post, 5 posts an hour per account, and Cloudflare Turnstile on sign-up.
- **Shipping** (changed 02/11/2026) is free anywhere in New Zealand, with no minimum spend, NZ addresses only. Admin has a toggle to turn free shipping off; when it's off, a single flat rate set in admin applies to every order. Weight-band pricing is dropped. Every product still has a weight in grams, but it's admin only (packing and postage) and never shown to customers. The "Free ship club" badge stays gone (19 badges remain).
- **RBAC**: `Role.permissions` is a string array. Keys: `access_admin`, `manage_inventory`, `manage_orders`, `manage_discounts`, `manage_users`, `moderate_community`, `manage_content`. The Shopkeeper role has `manage_discounts`. New permission = new string, no migration. Permissions are read from the database per request, so changes apply immediately.
- **Staging** is a second Compose project (`tt-staging`) on the same host at `staging.tommytinkers.nz`, behind its own tunnel and Cloudflare Access, with Stripe test keys and seed data only. Every merge to `feature/new-site-v2.0` deploys to staging; production deploys only from a tagged release.
- **Product photos** aren't ready. Build with the placeholder (brand gradient, logo icon centred); photos get added through admin later.
- **Codebench case studies**: the prototype's examples (e.g. "Bookkit") are filler. Never present them as real client work. Ask Tommy for real ones.

## Shop decisions (07/11/2026, from the Shopify export and the v2 UI design)

The v2 UI design lives on the claude.ai Design canvas `tommy tinkers NZ v2` (link at the top). The schema in `prisma/schema.prisma` already models everything below, ahead of Phases 3 and 5.

- **Launch range is stickers only.** The Stickers and decals category is live. RC parts, kids' toys and household show as "coming soon" (`Category.status = COMING_SOON`) until Tommy adds products.
- **Real products** (prices NZD): RC name window stickers `rcws` $20.00, Custom sticker sheet A4 `ss-a4` $35.00, Waikato Champs grid stickers `wcgs` $15.00 (all made to order), Astro Masters grid stickers `amgs` $20.00 (tracked, 0 in stock, so sold out). `rcws-2` is a hidden draft. Weights and unit costs are still to come from Tommy, so both columns are nullable. The stockroom drawer has fields for both, and a "Needs cost or weight" filter lists the products still missing either.
- **Stock mode.** Each product is either `TRACKED` (counted, sells out at 0, low-stock warning at the `stock.lowThreshold` setting) or `MADE_TO_ORDER` (never sells out). Bulk restock in the stockroom only touches tracked products.
- **Variants and personalisation.** A product has variants (name, SKU, price adjustment in cents, on/off, order) and personalisation questions (short text, long text, choice or file; required; character limit or choices; order). At checkout the customer's answers are copied onto the order line as JSON, and artwork uploads become `OrderUpload` rows in the private uploads volume. Editing a product later never changes an old order.
- **Discounts are their own admin section** (`manage_discounts`). Automatic or code; percent or fixed (fixed can be per item); whole order, one category or listed products; minimum items and minimum spend; start and end dates in NZ time; usage limit (1 = single use) and one per customer; combine with other discounts or not. Scheduled, live and ended are worked out from the dates, not stored. The one real discount today is the automatic multi-buy "2+ name sticker sheets": $5 off once per order when the cart has 2 or more `rcws`. Codes are checked by a server action at checkout and again when the payment session is created; redemptions are written when the payment is confirmed.
- **Order numbers** look like `TT1026NZ`. `Order.number` is a sequence that restarts at 1026, carrying on from the last Shopify order (TT1025NZ).
- **Customer names** in admin lists show first name plus last initial (e.g. "David S."). No emails or phone numbers in lists.
- **Services live on Codebench only**, as rates: NZ$60/hr development (a junior-to-mid freelance rate; NZ guides put that band at about NZ$42 to NZ$70), NZ$95/hr on-site, NZ$65/hr remote support. Support rates sit above the dev rate on purpose: they draw on Tommy's service desk experience, not his dev level. They are not shop products. Codebench ballpark ranges (07/11/2026, hours at NZ$60): website NZ$1,500 to NZ$4,000, online shop NZ$3,000 to NZ$8,500, internal tool NZ$2,000 to NZ$6,500, web app NZ$5,500 to NZ$17,500, automation NZ$350 to NZ$2,000. Features picked in the questionnaire push the range up.
- **Shipping settings** and the low-stock threshold are `SiteSetting` keys (`shipping.freeEnabled`, `shipping.flatRateCents`, `stock.lowThreshold`), not their own tables.

Also modelled: `StockMovement` (every stock change, tracked products only), `AuditLog` (every admin write, append only) and `Enquiry` (Codebench questionnaire and contact form, saved before the email goes out).

Not modelled yet, because they aren't decided: race-day pickup (orders collected at AIRCCC), and club quotes and invoices for grid sticker sets. **Shopify or Stripe is still open.** The design and schema assume Stripe Checkout, as the stack table does; if v2 keeps Shopify for checkout, the order, redemption and stock-sale paths change. Settle it before Phase 3 or any checkout work.

- **Shopify order history is imported** (decided 07/11/2026) as read-only orders with `Order.source = SHOPIFY` and a link back to Shopify. They can't be refunded from v2. This is separate from the v1 rule above: v1 users and data still don't migrate. Imported orders never become seed or test data.

## Phase status

| Phase | Status |
|---|---|
| 0. Foundations | In progress: scaffold, Dockerfile and Compose done. Catalogue, order, discount, stock history, audit and enquiry schema added (migration `20261107090000_catalogue_orders_discounts`); Better Auth tables come in Phase 2. Still to do: run the Docker stack and confirm `/api/health`, add a v2 CI job. |
| 1. Design system and shell | Next |
| 2. Accounts (Better Auth) | |
| 3. Catalogue and stockroom | |
| 4. The Shed | |
| 5. Codebench, contact and Stripe checkout | |
| 6. Hardening and cutover | |

Each phase is a `feat/v2-…` branch with a PR into `feature/new-site-v2.0`. That branch reaches `main` in one final PR at cutover.

## Design rules (summary; the DS files have the detail)

- **Tokens only.** Use `var(--token)` from `globals.css`. No new hardcoded hex in components (avatar and badge palettes are the only exception).
- **Colour roles.** The warm gradient (`--gradient-brand`) is decoration only, always with dark text, at most one full-bleed gradient surface per page. Brand green (`--color-accent`) is for interactive things: links, CTAs, focus rings. Never green text on the gradient, never gradient card backgrounds.
- **Themes.** Both must work. Production defaults to dark even though the DS tokens treat light as `:root`.
- **Type.** Exo 2 for headings and body. Jura only for wide-tracked (0.18em) uppercase eyebrows like `MAKER OF THINGS` and stat numbers. Agave Nerd mono for `> 01. section` prompt labels, terminal bits and code. Fonts are local TTFs in `public/fonts`.
- **Layout.** 8px grid, 1200px container, 64px nav (blurred overlay once scrolled), mobile-first, breakpoints 640/768/1024/1280/1536. Flex or grid with `gap`.
- **Cards.** `.tt-card`: surface background, subtle border, 16px radius, top accent bar on hover. Radii 4 to 24px only.
- **Motion.** Tokens `--motion-fast/base/slow/spring`. Site FX uses `data-tt-cardfx | linkfx | scrollfx | btnfx` on `<html>` plus `--ttfx-scale`. Site defaults come from the database; a visitor's override stays in localStorage as `tt-fx-v1`. Always respect `prefers-reduced-motion`.
- **Icons.** Phosphor only, sizes 16/20/24. Regular weight for UI, duotone for achievement badges. Server components import from `@phosphor-icons/react/ssr`; client components from `@phosphor-icons/react`. Every icon needs a label or `aria-hidden` next to visible text. No emoji or unicode glyphs as icons. The DS and prototype name Lucide icons, so map them to the Phosphor equivalent.
- **Imagery.** Photos over illustrations over placeholders. Don't invent illustrations.
- **Accessibility.** Visible 2px focus outline (never removed), AA contrast in both themes, semantic HTML.

## Copy and voice

- First person ("I build..."), direct, warm, short sentences. Address customers as "you".
- NZ English (colour, organise, centre). Prices as `$18.50` or `NZ$60`. Dates as DD/MM/YYYY. Metric units.
- **No em dashes, ever.** Use commas, full stops, or a spaced hyphen.
- Banned words: passionate, guru, ninja, rockstar, synergy, leverage, cutting-edge, world-class.
- Honest about skill level. Never invent clients, metrics, testimonials or reviews.
- Wordmark is always lowercase `tommy tinkers NZ`. Headings in sentence case. Section labels in the mono prompt style (`> 02. services`).

## How to work with Tommy

- He's a junior-to-intermediate full-stack dev. Explain the why behind non-obvious decisions (server vs client components, caching, auth flow) and add inline comments that explain why, not what.
- TypeScript, 2-space indent, functional components with hooks, descriptive names. Validate every server action and API input with zod.
- Prefer editing existing files over creating new ones; match existing patterns.
- Debug by reproducing, isolating, diagnosing, then fixing. Don't guess.
- **Git:** never commit to `main`. Branch first (`feat/…`, `fix/…`, `chore/…`), then open a PR. Run `pnpm lint` and `pnpm build` before every PR.
- Never print or commit secrets. Real values live in `deploy/.env` and `deploy/secrets/` (both gitignored); `.env.example` files document the keys.
- When porting a prototype page, read the matching prototype file and the shared files it uses first, then rebuild it idiomatically. Ask before guessing on anything ambiguous.
- Keep answers concise: summary first, then detail. Call out flawed assumptions, including his.
