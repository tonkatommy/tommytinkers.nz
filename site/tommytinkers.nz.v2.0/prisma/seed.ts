// Seed: the categories and the real product range, so a fresh database has a
// shop to show. Run with `pnpm db:seed`.
//
// Rules this file follows:
// - Catalogue only. No customers, orders or anything invented to look real.
// - Create only, never update. Every upsert has `update: {}`, so running the
//   seed again (staging does on every deploy) can't undo a change made in admin.
// - Money is integer cents.
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const categories = [
  { slug: "stickers", name: "Stickers & decals", status: "LIVE", sortOrder: 1 },
  { slug: "rc-parts", name: "RC car parts", status: "COMING_SOON", sortOrder: 2 },
  { slug: "toys", name: "Kids' toys", status: "COMING_SOON", sortOrder: 3 },
  { slug: "household", name: "Household", status: "COMING_SOON", sortOrder: 4 },
] as const;

// Names, SKUs and prices come from CLAUDE.md (the old Shopify range).
// Weights and unit costs are still to come from Tommy, so they stay null.
// `rcws-2` is a hidden draft with no details recorded, so it isn't seeded.
const products = [
  {
    sku: "rcws",
    slug: "rc-name-window-stickers",
    name: "RC name window stickers",
    blurb: "Your name on waterproof vinyl, for your RC car's windows.",
    description:
      "Personalised name stickers for your RC car's windows, on an A4 sheet of waterproof vinyl. Pick the sheet that suits your scale.",
    priceCents: 2000,
    stockMode: "MADE_TO_ORDER",
    stockOnHand: null,
    needsProof: false,
    variants: [
      { sku: "rcws-mixed", name: "Mixed" },
      { sku: "rcws-10th", name: "10th Only" },
      { sku: "rcws-8th", name: "8th Only" },
      { sku: "rcws-pits", name: "Pits Only" },
    ],
  },
  {
    sku: "ss-a4",
    slug: "custom-sticker-sheet-a4",
    name: "Custom sticker sheet A4",
    blurb: "A full A4 sheet of vinyl stickers in your own design.",
    description:
      "A full A4 sheet of waterproof vinyl stickers in any design you like. Tell me what you want on it and I'll print it to order.",
    priceCents: 3500,
    stockMode: "MADE_TO_ORDER",
    stockOnHand: null,
    // Custom artwork: the customer approves a proof before I print.
    needsProof: true,
    variants: [],
  },
  {
    sku: "wcgs",
    slug: "waikato-champs-grid-stickers",
    name: "Waikato Champs grid stickers",
    blurb: "Grid number stickers for the Waikato Champs.",
    description: "Grid number stickers made for the Waikato Champs, printed to order.",
    priceCents: 1500,
    stockMode: "MADE_TO_ORDER",
    stockOnHand: null,
    needsProof: false,
    variants: [],
  },
  {
    sku: "amgs",
    slug: "astro-masters-grid-stickers",
    name: "Astro Masters grid stickers",
    blurb: "Grid number stickers for the Astro Masters.",
    description:
      "Grid number stickers made for 10th scale indoor buggy racing at the Astro Masters.",
    priceCents: 2000,
    // Counted stock, and there's none left, so it shows as out of stock.
    stockMode: "TRACKED",
    stockOnHand: 0,
    needsProof: false,
    variants: [],
  },
] as const;

async function main() {
  for (const category of categories) {
    await db.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  const stickers = await db.category.findUniqueOrThrow({ where: { slug: "stickers" } });

  for (const { variants, ...product } of products) {
    await db.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: {
        ...product,
        status: "ACTIVE",
        featured: true,
        categoryId: stickers.id,
        variants: {
          create: variants.map((variant, index) => ({ ...variant, sortOrder: index })),
        },
      },
    });
  }

  console.log(`Seed done: ${categories.length} categories, ${products.length} products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
