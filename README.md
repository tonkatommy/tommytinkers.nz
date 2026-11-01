# tommytinkers.nz

> Freelance web & software development — based in New Zealand.

## Overview

Website for the tommytinkers.nz side hustle. Built with Next.js and deployed at [tommytinkers.nz](https://tommytinkers.nz).

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Auth:** Auth.js
- **Database:** PostgreSQL via Prisma
- **Package Manager:** pnpm
- **Hosting:** Docker Compose behind a Cloudflare tunnel

## Repository Structure

```
├── site/
│   └── tommytinkers.nz/              # Next.js app — see site README
├── design/
│   ├── brand/                        # Logo master files (PNG variants)
│   └── prototype/
│       └── tommytinkers.nz.static/   # Static HTML/JSX prototype, reference only
└── docs/                             # Project notes and summaries
```

## Getting Started

```bash
cd site/tommytinkers.nz
pnpm install
pnpm dev
```

See [site/tommytinkers.nz/README.md](./site/tommytinkers.nz/README.md) for environment setup and Docker deployment.

## License

MIT — see [LICENSE](./LICENSE)
