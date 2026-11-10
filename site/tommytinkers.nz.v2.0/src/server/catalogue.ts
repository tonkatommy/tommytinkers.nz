// Public catalogue reads. Anyone can browse the shop, so these have no
// permission check, but they only ever return ACTIVE products in LIVE
// categories and only the fields a customer may see (never weight or cost).
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { type StockStatus, stockStatus } from "@/lib/stock";
import { db } from "@/server/db";
import { getLowStockThreshold } from "@/server/settings";

// Anything that changes products or stock (admin edits, a paid order) must
// call revalidateTag(CATALOGUE_TAG, "max") so shoppers see it.
export const CATALOGUE_TAG = "catalogue";

export type ProductCardData = {
  slug: string;
  name: string;
  priceCents: number;
  categoryName: string;
  stock: StockStatus;
  // True when the customer has to pick a variant or answer a question
  // first, so the card sends them to the product page.
  hasOptions: boolean;
};

/** Up to four featured products for the home page. */
export async function getFeaturedProducts(): Promise<ProductCardData[]> {
  "use cache";
  cacheTag(CATALOGUE_TAG);
  // A safety net: even if a revalidateTag call is ever missed, stock shown
  // on the home page is at most an hour old.
  cacheLife("hours");

  const [products, lowThreshold] = await Promise.all([
    db.product.findMany({
      where: { featured: true, status: "ACTIVE", category: { status: "LIVE" } },
      orderBy: [{ createdAt: "asc" }, { name: "asc" }],
      take: 4,
      select: {
        slug: true,
        name: true,
        priceCents: true,
        stockMode: true,
        stockOnHand: true,
        category: { select: { name: true } },
        _count: { select: { variants: { where: { active: true } }, fields: true } },
      },
    }),
    getLowStockThreshold(),
  ]);

  return products.map((product) => ({
    slug: product.slug,
    name: product.name,
    priceCents: product.priceCents,
    categoryName: product.category.name,
    stock: stockStatus(product.stockMode, product.stockOnHand, lowThreshold),
    hasOptions: product._count.variants > 0 || product._count.fields > 0,
  }));
}
