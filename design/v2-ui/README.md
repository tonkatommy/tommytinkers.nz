# v2 UI design (exported boards)

A snapshot of the `tommy tinkers NZ v2` design canvas on claude.ai, version 89, exported 09/11/2026:
https://claude.ai/artifact/9uCGiFfBAyfo1yeKShipHw

This is the visual and behavioural spec for the v2 rebuild in `site/tommytinkers.nz.v2.0`. It has every page and state, in both themes, at 1280px desktop, 375px mobile and 834px tablet (admin).

## Rules for using it

- **`CLAUDE.md` wins on facts.** If a board and `CLAUDE.md` disagree on a rate, price, rule or decision, follow `CLAUDE.md` and note the mismatch so the design gets fixed.
- **Port the look and behaviour, not the code.** These files run on the canvas's own template runtime. Rebuild each screen idiomatically in Next.js, TypeScript and Tailwind, following the architecture rules in `CLAUDE.md`.
- **Data in the boards is sample data.** Products, prices, discounts and rates match `CLAUDE.md`. Every customer and member name is invented; real customer details never go in this public repo. The 22 imported Shopify orders show their real numbers, dates and totals with invented names.
- **The canvas is the live copy.** If it changes, export it again rather than editing these files by hand.

## How to read a board

These files only render inside the claude.ai canvas (fonts and the runtime load from there), so read them as source.

- Each `*.dc.html` is one board. The markup is plain HTML with `{{holes}}` filled from the class's `renderVals()` method, `<sc-if value="{{x}}">` for conditionals and `<sc-for list="{{xs}}" as="x">` for loops.
- The `<script type="text/x-dc">` block holds a class with the sample data (in its constructor) and the behaviour: filters, validation, drawer flows, money maths. Read it for the rules a screen follows, such as what counts as low stock or how a discount applies.
- `data-props` on that script lists the board's states (for example `"state": ["ready", "loading", "empty", "error"]`). Each state is a screen you need to build.
- Small boards like `Shop-mobile.dc.html` import a big one with `dc-import` and set props: they show the same screen at another size, theme or state.
- `SiteNav`, `SiteFooter`, `CartDrawer`, `AdminBar` and `AdminSide` are shared components used by the page boards.
- `tt.css` is the canvas stylesheet: the class names (`.tt-card`, `.tt-btn`, `.tt-chip` and so on) and the token values. `ds/tommy-tinkers-nz/tokens.json` lists every design token with its usage notes. Tokens belong in `src/app/globals.css`, not copied class by class.
- `canvas.json` is the canvas layout: board titles, positions and section notes.
- Icons are Phosphor classes (`ph ph-name`). Use the matching `@phosphor-icons/react` component.

## Boards

### 1-2. Shell and home

| File | Board | Width |
|---|---|---|
| `Main.dc.html` | Home - desktop, dark (interactive) | 1280 |
| `Home-light.dc.html` | Home - desktop, light | 1280 |
| `Home-mobile.dc.html` | Home - 375, dark | 375 |
| `Home-mobile-light.dc.html` | Home - 375, light | 375 |

### Shell states and components

| File | Board | Width |
|---|---|---|
| `Shell.dc.html` | Shell states - dark | 1280 |
| `Shell-light.dc.html` | Shell states - light | 1280 |
| `Components.dc.html` | Components - dark | 1280 |
| `Components-light.dc.html` | Components - light | 1280 |

### Shared parts used by every page from here on

| File | Board | Width |
|---|---|---|
| `SiteNav.dc.html` | Component: SiteNav | 1280 |
| `SiteFooter.dc.html` | Component: SiteFooter | 1280 |
| `CartDrawer.dc.html` | Component: CartDrawer | 420 |

### 3. Shop

| File | Board | Width |
|---|---|---|
| `Shop.dc.html` | Shop - desktop (interactive) | 1280 |
| `Shop-mobile.dc.html` | Shop - 375 | 375 |
| `Shop-loading.dc.html` | Shop - loading | 1280 |
| `Shop-empty.dc.html` | Shop - no results | 1280 |
| `Shop-error.dc.html` | Shop - error | 1280 |

### 4. Product page

| File | Board | Width |
|---|---|---|
| `Product.dc.html` | Product - desktop (interactive) | 1280 |
| `Product-mobile.dc.html` | Product - 375 | 375 |
| `Product-out.dc.html` | Product - out of stock | 1280 |
| `Product-loading.dc.html` | Product - loading (Tweak: not found) | 1280 |

### 5. Checkout hand-off and order confirmation

| File | Board | Width |
|---|---|---|
| `Checkout.dc.html` | Checkout - review (interactive) | 1280 |
| `Checkout-mobile.dc.html` | Checkout - 375 | 375 |
| `Checkout-changed.dc.html` | Checkout - cart changed (Tweak: cancelled, error, redirecting, empty) | 1280 |
| `Confirmation.dc.html` | Order confirmation | 1280 |
| `Confirmation-pending.dc.html` | Order confirmation - confirming payment (Tweak: failed) | 1280 |
| `Confirmation-mobile.dc.html` | Order confirmation - 375, light | 375 |

### 6. Codebench

| File | Board | Width |
|---|---|---|
| `Codebench.dc.html` | Codebench - desktop (interactive) | 1280 |
| `Codebench-mobile.dc.html` | Codebench - 375 | 375 |
| `Codebench-result.dc.html` | Codebench - build sheet result (Tweak: other steps) | 1280 |
| `Codebench-form.dc.html` | Codebench - send to Tommy: invalid (Tweak: sending, sent, failed) | 1280 |

### 7. The Shed: Pinboard

| File | Board | Width |
|---|---|---|
| `Shed.dc.html` | Pinboard - signed out (interactive) | 1280 |
| `Shed-mobile.dc.html` | Pinboard - 375 | 375 |
| `Shed-compose.dc.html` | Pinboard - compose a pin (Tweak: photo added, photo error, posting) | 1280 |
| `Shed-pending.dc.html` | Pinboard - waiting for approval | 1280 |
| `Shed-loading.dc.html` | Pinboard - loading (Tweak: empty, error) | 1280 |

### 7. The Shed: Workshop, profile and achievements

| File | Board | Width |
|---|---|---|
| `Workshop.dc.html` | Workshop forum (interactive) | 1280 |
| `Workshop-mobile.dc.html` | Workshop forum - 375 | 375 |
| `Thread.dc.html` | Thread - signed out (Tweak: signed in, posting, error) | 1280 |
| `Profile.dc.html` | Member profile | 1280 |
| `Achievements.dc.html` | Achievements (interactive) | 1280 |
| `Achievements-mobile.dc.html` | Achievements - 375 | 375 |

### 8. Accounts

| File | Board | Width |
|---|---|---|
| `Auth.dc.html` | Sign in (interactive: every account screen is reachable from here) | 1280 |
| `Auth-mobile.dc.html` | Sign in - 375 | 375 |
| `Auth-signup.dc.html` | Sign up (Tweak: errors, submitting) | 1280 |
| `Auth-verify.dc.html` | Verify email (Tweak: resent, expired, verified) | 1280 |
| `Auth-reset.dc.html` | Forgot and reset password (Tweak: sent, reset, mismatch, expired, done) | 1280 |
| `Auth-locked.dc.html` | Account locked: 5 failed tries, 15 minutes | 1280 |

### 8. Account settings

| File | Board | Width |
|---|---|---|
| `Settings.dc.html` | Account settings (interactive) | 1280 |
| `Settings-mobile.dc.html` | Account settings - 375, light | 375 |

### 9. Contact

| File | Board | Width |
|---|---|---|
| `Contact.dc.html` | Contact (interactive) | 1280 |
| `Contact-mobile.dc.html` | Contact - 375, light | 375 |
| `Contact-states.dc.html` | Contact - invalid (Tweak: sending, sent, failed) | 1280 |

### 10. Admin: stockroom

| File | Board | Width |
|---|---|---|
| `Admin.dc.html` | Stockroom - table (interactive) | 1280 |
| `Admin-cards.dc.html` | Stockroom - cards, 3 selected | 1280 |
| `Admin-drawer.dc.html` | Stockroom - edit drawer | 1280 |
| `Admin-tablet.dc.html` | Stockroom - tablet 834, light | 834 |
| `Admin-states.dc.html` | Stockroom - loading (Tweak: empty, no match, error) | 1280 |
| `Admin-formstates.dc.html` | Stockroom - drawer errors (Tweak: add, saving, save error, hide) | 1280 |

### 10. Admin: orders, users and roles

| File | Board | Width |
|---|---|---|
| `AdminOrders.dc.html` | Orders (interactive) | 1280 |
| `AdminOrders-states.dc.html` | Orders - posting (Tweak: detail, refund, loading, empty, error) | 1280 |
| `AdminOrders-tablet.dc.html` | Orders - tablet 834, light | 834 |
| `AdminUsers.dc.html` | Users (interactive) | 1280 |
| `AdminUsers-roles.dc.html` | Roles and permissions | 1280 |
| `AdminUsers-states.dc.html` | Users - new role (Tweak: suspend, saved, loading, error) | 1280 |

### 10. Admin: moderation, shipping and motion

| File | Board | Width |
|---|---|---|
| `AdminModeration.dc.html` | Moderation queue (interactive) | 1280 |
| `AdminModeration-light.dc.html` | Moderation - rejecting, tablet 834, light | 834 |
| `AdminModeration-states.dc.html` | Moderation - reported (Tweak: empty, loading, error) | 1280 |
| `AdminSettings.dc.html` | Settings: shipping, invoices and motion (interactive) | 1280 |
| `AdminSettings-flat.dc.html` | Shipping - free off, flat rate, light | 1280 |
| `AdminSettings-states.dc.html` | Settings - invalid rate (Tweak: saving, saved, error, loading) | 1280 |
| `AdminBar.dc.html` | AdminBar component | 1280 |
| `AdminSide.dc.html` | AdminSide component | 248 |

### 10. Admin: discounts

| File | Board | Width |
|---|---|---|
| `AdminDiscounts.dc.html` | Discounts (interactive) | 1280 |
| `AdminDiscounts-edit.dc.html` | Discounts - editing the multi-buy | 1280 |
| `AdminDiscounts-code.dc.html` | Discounts - new one-time code, tablet 834, light | 834 |
| `AdminDiscounts-states.dc.html` | Discounts - errors (Tweak: saving, empty, loading, error) | 1280 |
| `Checkout-code.dc.html` | Checkout - code applied (Tweak: code error) | 1280 |

### 11. Race-day and Helensville pickup

| File | Board | Width |
|---|---|---|
| `Checkout-pickup.dc.html` | Checkout - collect at a race day, light | 1280 |
| `Confirmation-pickup.dc.html` | Order confirmation - race-day pickup | 1280 |
| `AdminRaceDays.dc.html` | Race days (interactive) | 1280 |
| `AdminRaceDays-list.dc.html` | Race days - pickup list | 1280 |
| `AdminRaceDays-edit.dc.html` | Race days - add one, invalid, tablet 834, light (Tweak: new, empty, loading, error) | 834 |

### 12. Club quotes and invoices

| File | Board | Width |
|---|---|---|
| `AdminQuotes.dc.html` | Quotes and invoices (interactive) | 1280 |
| `AdminQuotes-new.dc.html` | Quotes - new quote (Tweak: invalid, sent and locked) | 1280 |
| `AdminQuotes-invoice.dc.html` | Invoices - mark paid by bank transfer (Tweak: open invoice, list) | 1280 |
| `AdminQuotes-clubs.dc.html` | Clubs and their usual terms, tablet 834, light (Tweak: empty, loading, error) | 834 |
| `QuoteView.dc.html` | Club quote page (interactive: accept, decline, pay) | 1280 |
| `QuoteView-invoice.dc.html` | Club invoice page, light (Tweak: paid, accepted, declined, expired, replaced) | 1280 |
| `QuoteView-mobile.dc.html` | Club quote page - 375 | 375 |
