# tommytinkers.nz

Side-hustle site for Tommy Goodman ("Maker of Things", Helensville NZ). It has two halves: freelance web and software work (the Codebench page), and a maker shop. The shop's real range is personalised RC name window stickers, race-club grid sticker sets and custom sticker sheets; RC parts, kids' toys and household bits show as "coming soon" (see Shop decisions). Around both sits a community area, The Shed.

This file is the single source of project guidance for every coding agent. `AGENTS.md` only points here, so edit this file and nothing else.

**Active work is v2.0**, a ground-up rebuild in `site/tommytinkers.nz.v2.0`. v1 (`site/tommytinkers.nz`) is live in production and is reference only: don't add features to it.

The v2 plan, with every decision and its reasoning: https://claude.ai/artifact/XUjDd7kyNkr9fNoFxoF7CQ

The v2 UI design, every page and state in both themes at desktop and mobile sizes: https://claude.ai/artifact/9uCGiFfBAyfo1yeKShipHw. If the design and this file disagree on a fact (a rate, a price, a rule), this file wins and the design gets fixed. An export of every board sits in `design/v2-ui/`; its README explains how to read the board files.

## Repo layout

```
site/tommytinkers.nz.v2.0/   v2 app (all new work goes here)
site/tommytinkers.nz/        v1 app, live, reference only
deploy/                      v2 Docker Compose: compose.yaml, compose.staging.yaml, backup/, secrets/
design/brand/                logo masters
design/v2-ui/                exported v2 UI design boards (the visual and behavioural spec, see its README)
design/prototype/            static HTML/JSX prototype (older spec, fills gaps only)
docs/                        business summary (Feb 2026, business context only)
```

## Sources of truth (in priority order)

1. **The v2 code.** If code and any other source disagree about how something is built, the code wins.
2. **The v2 plan** (link above) for scope and decisions.
3. **The v2 UI design** in `design/v2-ui/`, exported from the canvas linked above. It's built on the design system and wins on layout, states and behaviour for every screen it covers. Port it, don't copy its code; the README says how to read the boards.
4. **The design system** (`tommytinkers.nz DS.zip` in the claude.ai project: `README.md`, `design.md`, `colors_and_type.css`). If a board breaks one of its rules (tokens, colour roles, type, copy), the design system wins. Its tokens are also in `design/v2-ui/ds/tommy-tinkers-nz/tokens.json`. Ignore its `SKILL.md` advice to copy the sister site's zero-build static setup.
5. **The prototype** in `design/prototype/`. Port its look and behaviour, never its code structure: it relies on `window.*` globals, Babel standalone, inline styles, `data-lucide` icons and localStorage. Use it only where the v2 design has no board.
6. **v1** for how things were done before (RBAC keys, lockout logic, FX driver). Don't copy its pages: they are single giant client components.

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
- **The Shopify store is closed and gone** (08/11/2026). tommytinkers.nz is the only store, and payments go through Stripe Checkout (decided 08/11/2026, see the stack table). Shopify's admin, order pages and API no longer exist, so the Shopify export saved on 17/06/2026 (`02_products.md` to `05_customers.md` in the claude.ai project) is the only record of the old store. It holds customer emails and phone numbers, so it never goes in this public repo.
- **Real products** (prices NZD): RC name window stickers `rcws` $20.00 (variants Mixed, 10th Only, 8th Only and Pits Only), Custom sticker sheet A4 `ss-a4` $35.00, Waikato Champs grid stickers `wcgs` $15.00 (all made to order), Astro Masters grid stickers `amgs` $20.00 (tracked, 0 in stock, so sold out). `rcws-2` is a hidden draft. Weights and unit costs are still to come from Tommy, so both columns are nullable. The stockroom drawer has fields for both, and a "Needs cost or weight" filter lists the products still missing either.
- **Stock mode.** Each product is either `TRACKED` (counted, sells out at 0, low-stock warning at the `stock.lowThreshold` setting) or `MADE_TO_ORDER` (never sells out). Bulk restock in the stockroom only touches tracked products.
- **Variants and personalisation.** A product has variants (name, SKU, price adjustment in cents, on/off, order) and personalisation questions (short text, long text, choice or file; required; character limit or choices; order). At checkout the customer's answers are copied onto the order line as JSON, and artwork uploads become `OrderUpload` rows in the private uploads volume. Editing a product later never changes an old order.
- **Discounts are their own admin section** (`manage_discounts`). Automatic or code; percent or fixed (fixed can be per item); whole order, one category or listed products; minimum items and minimum spend; start and end dates in NZ time; usage limit (1 = single use) and one per customer; combine with other discounts or not. Scheduled, live and ended are worked out from the dates, not stored. The one real discount today is the automatic multi-buy "2+ name sticker sheets": $5 off once per order when the cart has 2 or more `rcws`. Codes are checked by a server action at checkout and again when the payment session is created; redemptions are written when the payment is confirmed.
- **Order numbers** look like `TT1026NZ`. `Order.number` is a sequence that restarts at 1026, carrying on from the last Shopify order (TT1025NZ). Imported Shopify orders set `number` themselves (1002 to 1025, see the import rules below) so v2 shows every order in one format, and keep the name Shopify gave them in `Order.externalRef`, because Shopify used `TT-1001-NZ` up to TT-1015-NZ and `TT1017NZ` from then on (there was no 1016).
- **Customer names** in admin lists show first name plus last initial (e.g. "Aroha T.", an invented name; examples never use real customers). No emails or phone numbers in lists.
- **Services live on Codebench only**, as rates: NZ$60/hr development (a junior-to-mid freelance rate; NZ guides put that band at about NZ$42 to NZ$70), NZ$95/hr on-site, NZ$65/hr remote support. Support rates sit above the dev rate on purpose: they draw on Tommy's service desk experience, not his dev level. They are not shop products. Codebench ballpark ranges (07/11/2026, hours at NZ$60): website NZ$1,500 to NZ$4,000, online shop NZ$3,000 to NZ$8,500, internal tool NZ$2,000 to NZ$6,500, web app NZ$5,500 to NZ$17,500, automation NZ$350 to NZ$2,000. Features picked in the questionnaire push the range up.
- **Shipping settings**, the low-stock threshold, Helensville pickup and invoice details are `SiteSetting` keys (`shipping.freeEnabled`, `shipping.flatRateCents`, `stock.lowThreshold`, `pickup.helensville`, `invoice.bankAccountName`, `invoice.bankAccountNo`, `quote.validDays`), not their own tables.

Also modelled: `StockMovement` (every stock change, tracked products only), `AuditLog` (every admin write, append only) and `Enquiry` (Codebench questionnaire and contact form, saved before the email goes out).

- **Shopify order history is imported** (decided 07/11/2026) from the saved export as read-only orders with `Order.source = SHOPIFY`. That's 22 orders, TT-1002-NZ to TT1025NZ, all paid and posted. They can't be refunded from v2, and there's no link back to Shopify because the store is gone. This is separate from the v1 rule above: v1 users and data still don't migrate. Imported orders never become seed or test data.
- **The export has limits.** It gives each order's customer, date, total and item count, but no line items, variants, personalisation or addresses. Imported orders get the total (`subtotalCents` = `totalCents`, no discount or shipping split) and no `OrderLine` rows, and the admin order view has to cope with an order that has no lines. The import script reads the export from outside the repo (e.g. `deploy/secrets/`) and runs once at cutover against production only.
- **Import rules** (decided 08/11/2026): skip Tommy's own test orders (TT-1001-NZ at $25 and TT-1011-NZ at $0), and merge duplicate customer records in the export into one customer each (two customers appear twice). Neither skipped order takes a new number, so 1001 and 1011 stay unused.

## Pickup, quotes and invoices (decided 09/11/2026)

- **Three ways to get an order**, picked at checkout (`Order.fulfilment`): free NZ Post (`POST`), collect at a race day (`RACE_DAY`), or collect from Helensville (`HELENSVILLE`). Pickup is free, and Stripe Checkout skips the address step for pickup orders.
- **Race days** are an admin section (`RaceDay`, permission `manage_orders`). Each has a name, venue, date and a cutoff in days before (default 3). A race day shows at checkout until orders close at midnight on the cutoff date (NZ time); the server checks the cutoff again when it makes the Stripe session. The pickup note goes in a reminder email to everyone collecting, the day before.
- **Helensville pickup** is a site setting (`pickup.helensville`, on by default). Tommy emails each customer to set a time, so his address never goes on the site.
- **Pickup orders end at `COLLECTED`**, not `POSTED`, with no tracking number. Admin marks them collected one by one or all at once from the race day's pickup list.
- **Club quotes** are an admin section, Quotes and invoices (`Club`, `Quote`, `QuoteLine`, permission `manage_orders`). A quote has setup lines (one-off design work) and item lines, a valid-until date, how it gets to the club, and payment terms. The club opens it from an unguessable link (`/quote/<token>`) with no account, types their name and accepts or declines. Once sent, a quote can't be edited; a change means a new quote that replaces it, and the old link says so.
- **Payment terms are per club, overridable per quote** (decided 09/11/2026). Each club has default terms, and a new quote starts with them; Tommy can change them on any quote before sending. The options: pay in full when they accept (nothing printed until paid), setup fee upfront and the rest on delivery, or one invoice on delivery. Due dates after delivery are 7 or 14 days. Terms aren't set per product, because club orders are quoted, not bought from the shop.
- **Invoices** (`Invoice`, `InvoicePayment`) are made by the accept and deliver actions according to the quote's terms. Clubs pay by card (a Stripe Checkout session from the invoice link; the webhook records it) or bank transfer to the account in settings, with the invoice number as the reference (Tommy records it by hand, part payments allowed). An invoice is paid once its payments add up to the amount.
- **No GST.** Tommy isn't GST registered, so documents say "Invoice", never "Tax invoice", and show no GST. Registering later means a GST number setting and GST columns.
- **Numbers**: quotes are `Q-0001`, invoices `INV-0001`, both from their own sequences. Quote and invoice tokens are random secrets: never log them.

## Store essentials (decided 09/11/2026)

- **Terms of sale, returns and privacy** are one page with three tabs (`/policies`), written as Markdown in the repo with a version date (`policies.version`). Tommy writes or approves the final wording; the design has a draft. Links sit in the footer Help column and under the pay button ("By paying, you agree to..."), and each order saves the `termsVersion` it was placed under. The returns policy never limits Consumer Guarantees Act rights: faulty, damaged or wrong orders are reprinted or refunded. Personalised and custom items can't be returned for a change of mind. Still to decide: change of mind on non-personalised event sheets (draft says 14 days, unused, customer pays return postage).
- **Artwork rights.** Products with an artwork or brief field need a ticked "this design is mine, or I have permission" box before they go in the cart; the time is saved as `OrderLine.artworkRightsAt`. The terms say Tommy won't print other people's logos, brands or characters without permission, and cancels and refunds orders that cross that line.
- **Privacy.** Data is kept on Tommy's server in NZ, with Stripe, Resend and Cloudflare as the overseas services. Order records are kept 7 years for the IRD; artwork is deleted 90 days after the order is done (draft, Tommy to confirm). Account settings has "Download my data" (a `DataExport` file kept 7 days) alongside the existing account deletion. Only two cookies: the session and the theme.
- **Marketing email needs a clear yes.** The checkout tick box ("Email me now and then about new stickers") is unticked by default, and the account settings news toggle is off by default. Consent goes in `MarketingContact` with when and where it was given, and every marketing email has an unsubscribe link (Unsolicited Electronic Messages Act). Order, proof, pickup and invoice emails are transactional and always send.
- **Proofs.** Products with `needsProof` (the custom A4 sheet, and club quotes when Tommy wants) get a `Proof` the customer approves at `/proof/<token>` with no sign-in, or asks for changes with a note. Each new version supersedes the last, and one reminder goes out after 3 days. An order line can't move to packing until its latest proof is approved.
- **Find my order** (`/orders/find`) is for guests: order number plus email, and the site always says a link was sent, match or not, so it can't be used to check whose orders exist. The emailed link opens the order's status page for 24 hours (`Order.lookupTokenHash`). Rate limited per IP and per email.
- **Back in stock.** A sold-out product shows "Email me when it's back". A `StockAlert` row gets one email when the product is restocked, then it's deleted. It's never added to marketing.
- **Holiday mode** is a setting (`holiday`) with a back-on date and a mode: keep selling with later dispatch, or pause checkout. A notice runs across the shop pages, and the pay button says when orders open again. It turns itself off on the back-on date. Club quotes, race-day pickups and orders already paid aren't affected.
- **Tokens.** Proof, order lookup, quote and invoice links all use random tokens. Store only a hash where the schema says `tokenHash`, never log them, and expire the lookup ones.

## Phase status

| Phase | Status |
|---|---|
| 0. Foundations | In progress: scaffold, Dockerfile and Compose done. Catalogue, order, discount, stock history, audit, enquiry, pickup, quote, proof, stock alert and consent schema added (migrations `20261107090000_catalogue_orders_discounts`, `20261108090000_order_external_ref`, `20261109090000_pickup_quotes_invoices` and `20261109120000_proofs_alerts_consent`); Better Auth tables come in Phase 2. Still to do: run the Docker stack and confirm `/api/health`, add a v2 CI job. |
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
