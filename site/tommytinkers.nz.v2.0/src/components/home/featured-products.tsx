import { ArrowClockwiseIcon, HammerIcon, SlidersHorizontalIcon, WarningCircleIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { connection } from "next/server";
import { LinkButton, buttonClass } from "@/components/ui/button";
import { ProductPlaceholder } from "@/components/ui/product-placeholder";
import { StateCard } from "@/components/ui/state-card";
import { formatNZD } from "@/lib/money";
import { STOCK_LABEL, type StockStatus } from "@/lib/stock";
import { type ProductCardData, getFeaturedProducts } from "@/server/catalogue";

const gridClass = "grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4 lg:gap-8";

const pillClass: Record<StockStatus, string> = {
  made_to_order: "tt-pill tt-pill-in",
  in_stock: "tt-pill tt-pill-in",
  low_stock: "tt-pill tt-pill-low",
  out_of_stock: "tt-pill tt-pill-out",
};

/**
 * "Fresh off the bench": up to four featured products.
 *
 * This is the only part of the home page that reads the database, so the
 * page wraps it in <Suspense>. The rest of the page is prerendered, and
 * this grid streams in a moment later (FeaturedProductsSkeleton shows
 * meanwhile).
 */
export async function FeaturedProducts() {
  // Wait for a real request before touching the database. This must sit
  // outside the try/catch: during the build Next stops rendering here on
  // purpose, and catching that would bake the error card into the page.
  await connection();

  let products: ProductCardData[];
  try {
    products = await getFeaturedProducts();
  } catch {
    return (
      <StateCard
        tone="error"
        icon={<WarningCircleIcon size={24} aria-hidden />}
        title="Couldn't load the featured products"
        actions={
          <>
            {/* A plain <a>, not <Link>, on purpose: it makes the browser load
                the page again from the server, which retries the query.
                <Link> could reuse what the browser already has. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" className={buttonClass({ variant: "primary" })}>
              <ArrowClockwiseIcon size={20} aria-hidden />
              Try again
            </a>
            <LinkButton href="/shop" variant="ghost">
              Go to the shop
            </LinkButton>
          </>
        }
      >
        Something went wrong on my end. Give it another go, or head straight to the shop.
      </StateCard>
    );
  }

  if (products.length === 0) {
    return (
      <StateCard
        icon={<HammerIcon size={24} aria-hidden />}
        title="Nothing on the bench right now"
        actions={
          <LinkButton href="/shop" variant="secondary">
            See everything
          </LinkButton>
        }
      >
        I&apos;m between batches. The full shop still has plenty in it.
      </StateCard>
    );
  }

  return (
    <ul className={gridClass}>
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </ul>
  );
}

function ProductCard({ product }: { product: ProductCardData }) {
  const href = `/shop/${product.slug}`;
  const soldOut = product.stock === "out_of_stock";

  return (
    <li className="tt-card tt-card-hover tt-card-flush flex flex-col">
      {/* The image is a second link to the same page. It is hidden from
          keyboards and screen readers so they meet one link, not two. */}
      <Link href={href} tabIndex={-1} aria-hidden>
        <ProductPlaceholder soldOut={soldOut} />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs text-ink-secondary">{product.categoryName}</span>
        <h3 className="text-base leading-snug font-semibold tracking-normal">
          <Link href={href} className="text-ink no-underline hover:text-ink hover:underline">
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
          <span className={`text-lg font-semibold ${soldOut ? "text-ink-secondary" : ""}`}>
            {formatNZD(product.priceCents)}
          </span>
          <span className={pillClass[product.stock]}>{STOCK_LABEL[product.stock]}</span>
        </div>

        {soldOut ? (
          <button type="button" className={buttonClass({ variant: "secondary", size: "sm", block: true })} disabled>
            Out of stock
          </button>
        ) : product.hasOptions ? (
          <LinkButton
            href={href}
            variant="secondary"
            size="sm"
            block
            aria-label={`Choose options for ${product.name}`}
          >
            <SlidersHorizontalIcon size={16} aria-hidden />
            Choose options
          </LinkButton>
        ) : (
          // "Add to cart" replaces this once the cart exists (Phase 3).
          <LinkButton href={href} variant="secondary" size="sm" block>
            View product
            {/* Screen readers hear which product. It's added after the
                visible words (not as an aria-label that replaces them) so
                voice control users can still say "click View product". */}
            <span className="sr-only">: {product.name}</span>
          </LinkButton>
        )}
      </div>
    </li>
  );
}

/** Same grid shape as the real thing, so nothing jumps when it loads. */
export function FeaturedProductsSkeleton() {
  return (
    <div className={gridClass} aria-busy="true">
      {[50, 40, 55, 45].map((width) => (
        <div key={width} className="overflow-hidden rounded-xl border border-line-subtle bg-surface">
          <div className="tt-skel aspect-square rounded-none" />
          <div className="flex flex-col gap-2 p-4">
            <div className="tt-skel h-3" style={{ width: `${width}%` }} />
            <div className="tt-skel h-4" style={{ width: `${width + 30}%` }} />
            <div className="tt-skel h-5 w-1/3" />
            <div className="tt-skel h-9 w-full rounded-md" />
          </div>
        </div>
      ))}
      <p className="sr-only" role="status">
        Loading featured products
      </p>
    </div>
  );
}
