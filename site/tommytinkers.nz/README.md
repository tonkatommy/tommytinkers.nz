# tommytinkers.nz — Site

Next.js website for the Tommy Tinkers NZ freelance web & software development business.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Runtime:** React 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4 + custom CSS design tokens
- **Icons:** Lucide React
- **Package Manager:** pnpm

## Pages

| Route | Description |
|---|---|
| `/` | Home / landing |
| `/shop` | E-commerce shop with shopping cart |
| `/shed` | About & contact (with email) |
| `/codebench` | Code demos |

## Key Features

- **Shopping cart** — React Context state with a slide-out CartDrawer
- **Email** — Server-side contact form and cart checkout email
- **Pinboard feed API** — `GET /api/pinboard` and `PUT /api/pinboard`; JSON file-based storage at `data/pinboard-feed.json`
- **Design system** — CSS custom properties and `@font-face` declarations in `src/app/globals.css`
- **Theme** — Light/dark mode toggled via localStorage

## Development

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

## Build & Production

```bash
pnpm build
pnpm start
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── pinboard/   # Pinboard feed API route
│   ├── codebench/      # Code demos page
│   ├── shed/           # About & contact page
│   ├── shop/           # Shop page
│   ├── globals.css     # Design tokens, fonts, Tailwind
│   ├── layout.tsx      # Root layout (theme + cart provider)
│   └── page.tsx        # Home page
├── components/
│   ├── CartDrawer.tsx
│   ├── Footer.tsx
│   ├── Nav.tsx
│   └── SiteFxDriver.tsx
└── lib/
    ├── cart-context.tsx
    ├── products.ts
    └── types.ts
```
