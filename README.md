# tommytinkers.nz

> Freelance web & software development — based in New Zealand.

## Overview

Website for the tommytinkers.nz side hustle, deployed at [tommytinkers.nz](https://tommytinkers.nz).

The site is mid-rewrite: **v2** is a static site served by nginx, and the **legacy** Next.js app stays in the repo (and in CI) until v2 replaces it in production.

## Repository Structure

```
├── site/
│   ├── tommytinkers.nz/       # v2 — static HTML/JSX served by nginx (no build step)
│   └── tommytinkers.nz.old/   # Legacy Next.js app (auth, Prisma) — CI still targets this
├── design/
│   ├── brand/                 # Logo master files (PNG variants)
│   └── prototype/             # Original Claude Design handoff bundle, reference only
└── docs/                      # Project notes and summaries
```

## Getting Started

### v2 (static)

```bash
cd site/tommytinkers.nz
docker compose up --build
```

The site is served on port 3000. The pages load React, Babel standalone and Lucide from unpkg and transpile the `.jsx` in the browser, so any static file server pointed at the folder works for local editing too.

### Legacy (Next.js)

```bash
cd site/tommytinkers.nz.old
pnpm install
pnpm dev
```

See [site/tommytinkers.nz.old/README.md](./site/tommytinkers.nz.old/README.md) for environment setup.

## License

MIT — see [LICENSE](./LICENSE)
