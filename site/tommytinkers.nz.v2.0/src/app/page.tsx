import {
  ArrowRightIcon,
  CarProfileIcon,
  ChatsCircleIcon,
  CheckIcon,
  CubeIcon,
  HouseLineIcon,
  MapPinIcon,
  PushPinIcon,
  StickerIcon,
  StorefrontIcon,
  TerminalWindowIcon,
} from "@phosphor-icons/react/ssr";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { FeaturedProducts, FeaturedProductsSkeleton } from "@/components/home/featured-products";
import { LinkButton, buttonClass } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/section-label";

// Typing "make ideas" is a CSS animation (see .tt-typed below), so the hero
// needs no JavaScript. The width is set in "ch" units: one per character in
// this mono font.
const PROMPT = "make ideas";

const codebenchPoints = [
  "Websites for small businesses and makers",
  "Web apps and dashboards",
  "Small tools that save you time",
];
const techTags = ["React", "Next.js", "Node.js", "PostgreSQL", "Docker"];

const shopCategories = [
  { href: "/shop?category=stickers", label: "Stickers & decals", Icon: StickerIcon },
  { href: "/shop?category=rc-parts", label: "RC car parts", Icon: CarProfileIcon },
  { href: "/shop?category=toys", label: "Kids' toys", Icon: CubeIcon },
  { href: "/shop?category=household", label: "Household", Icon: HouseLineIcon },
];

const iconTile = "grid size-12 flex-none place-items-center rounded-lg bg-raised text-ink";

export default function HomePage() {
  return (
    <>
      {/* ---------- hero ---------- */}
      <section className="tt-hero">
        <div className="tt-container flex flex-wrap items-center gap-12 pt-14 pb-16">
          <div className="relative flex min-w-0 flex-[999_1_520px] flex-col gap-6">
            <p className="fade-up-1 inline-flex min-h-6 items-center gap-0.5 font-mono text-mono">
              {/* Screen readers get the whole line at once; the animated
                  copy is hidden from them. */}
              <span className="sr-only">$ {PROMPT}</span>
              <span aria-hidden>$&nbsp;</span>
              <span aria-hidden className="tt-typed" style={{ "--n": PROMPT.length } as React.CSSProperties}>
                {PROMPT}
              </span>
              <span aria-hidden className="tt-caret" />
            </p>
            <p className="tt-eyebrow fade-up-1">Maker of things</p>
            <h1 className="fade-up-2">Bringing your ideas to life.</h1>
            <p className="fade-up-3 max-w-[560px] text-lg text-ink-secondary">
              I&apos;m Tommy. On the Codebench I build websites, apps and tools. In the Shop I make vinyl
              stickers, and soon RC car parts, toys and handy bits for the house. One person, one workshop, in
              Helensville.
            </p>
            <div className="fade-up-4 flex flex-wrap gap-3">
              <LinkButton href="/shop" variant="primary">
                <StorefrontIcon size={20} aria-hidden />
                Browse the shop
              </LinkButton>
              <LinkButton href="/codebench" variant="secondary">
                <TerminalWindowIcon size={20} aria-hidden />
                Plan a build with me
              </LinkButton>
            </div>
            <p className="fade-up-4 flex items-center gap-2 text-sm text-ink-secondary">
              <MapPinIcon size={16} aria-hidden />
              Helensville, Auckland, New Zealand
            </p>
          </div>

          {/* The big logo is decoration, so it only shows where there's room. */}
          <div className="hidden flex-[1_1_360px] justify-center lg:flex">
            <Image
              src="/assets/logo.png"
              alt=""
              width={420}
              height={420}
              priority
              className="fade-up-3 aspect-square w-full max-w-[420px] rounded-full shadow-[var(--shadow-glow),var(--shadow-lg)]"
            />
          </div>
        </div>
      </section>

      {/* ---------- 01 benches ---------- */}
      <section aria-labelledby="benches-heading" className="border-y border-line-subtle bg-surface py-12 md:py-16 lg:py-24">
        <div className="tt-container flex flex-col gap-10">
          <div className="flex max-w-[640px] flex-col gap-3">
            <SectionLabel>&gt; 01. benches</SectionLabel>
            <h2 id="benches-heading" className="tt-underline">
              Two benches, one workshop
            </h2>
            <p className="text-lg text-ink-secondary">
              Some days I&apos;m writing code. Other days I&apos;m cutting vinyl and printing parts. Pick the
              bench you need.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 md:gap-8">
            <article className="tt-card tt-card-hover tt-card-feature flex flex-col gap-5 bg-canvas">
              <div className="flex items-center gap-4">
                <span className={iconTile}>
                  <TerminalWindowIcon size={24} aria-hidden />
                </span>
                <span className="tt-eyebrow">The Codebench</span>
              </div>
              <h3>Websites, apps and tools</h3>
              <p className="text-ink-secondary">
                I build the website, app or tool you actually need. Honest scope, clean code, and it&apos;s
                yours at the end.
              </p>
              <ul className="flex flex-col gap-2">
                {codebenchPoints.map((point) => (
                  <li key={point} className="flex items-center gap-3">
                    <CheckIcon size={20} aria-hidden className="flex-none text-mono" />
                    {point}
                  </li>
                ))}
              </ul>
              <ul className="flex flex-wrap gap-2" aria-label="What I build with">
                {techTags.map((tag) => (
                  <li key={tag} className="tt-tag">
                    {tag}
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-wrap gap-3 pt-2">
                <LinkButton href="/codebench#plan" variant="primary">
                  Plan a build
                  <ArrowRightIcon size={20} aria-hidden />
                </LinkButton>
                <LinkButton href="/codebench#services" variant="ghost">
                  See services
                </LinkButton>
              </div>
            </article>

            <article className="tt-card tt-card-hover tt-card-feature flex flex-col gap-5 bg-canvas">
              <div className="flex items-center gap-4">
                <span className={iconTile}>
                  <StorefrontIcon size={24} aria-hidden />
                </span>
                <span className="tt-eyebrow">The Shop</span>
              </div>
              <h3>Things I make by hand</h3>
              <p className="text-ink-secondary">
                Waterproof vinyl stickers for RC cars, printed to order. 3D printed RC parts, kids&apos; toys
                and household bits are on the way. All made here in Helensville, and posted anywhere in New
                Zealand.
              </p>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {shopCategories.map(({ href, label, Icon }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className={buttonClass({ variant: "ghost", block: true }, "justify-start bg-surface px-3")}
                    >
                      <Icon size={20} aria-hidden />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-wrap gap-3 pt-2">
                <LinkButton href="/shop" variant="primary">
                  Browse the shop
                  <ArrowRightIcon size={20} aria-hidden />
                </LinkButton>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ---------- 02 featured ---------- */}
      <section aria-labelledby="featured-heading" className="py-12 md:py-16 lg:py-24">
        <div className="tt-container flex flex-col gap-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-3">
              <SectionLabel>&gt; 02. featured</SectionLabel>
              <h2 id="featured-heading" className="tt-underline">
                Fresh off the bench
              </h2>
            </div>
            <LinkButton href="/shop" variant="ghost">
              See everything
              <ArrowRightIcon size={20} aria-hidden />
            </LinkButton>
          </div>
          {/* Everything above and below is prerendered. Only this grid waits
              for the database, showing the skeleton until it arrives. */}
          <Suspense fallback={<FeaturedProductsSkeleton />}>
            <FeaturedProducts />
          </Suspense>
        </div>
      </section>

      {/* ---------- 03 the shed: the page's one full-bleed gradient ---------- */}
      <section aria-labelledby="shed-heading" className="tt-warm py-12 md:py-16 lg:py-24">
        <div className="tt-container flex flex-wrap items-center gap-10">
          <div className="flex min-w-0 flex-[1_1_400px] flex-col gap-4">
            <SectionLabel>&gt; 03. the shed</SectionLabel>
            <h2 id="shed-heading">Come hang out in the Shed</h2>
            <p className="text-lg">
              The Shed is where the community lives. Pin your builds to the Pinboard, ask questions in the
              Workshop, and pick up a badge or two along the way.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <LinkButton href="/signup" variant="primary">
                Join the Shed, it&apos;s free
              </LinkButton>
              <LinkButton href="/shed" variant="ink">
                Look at the Pinboard
              </LinkButton>
            </div>
          </div>

          <div className="grid min-w-0 flex-[1_1_400px] gap-4">
            <Link href="/shed" className="tt-card tt-card-hover flex items-start gap-4 text-ink no-underline hover:text-ink">
              <span className={iconTile}>
                <PushPinIcon size={24} aria-hidden />
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-xl font-semibold">Pinboard</span>
                <span className="text-[15px] text-ink-secondary">
                  A public wall of photos and notes from members. Anyone can look. Pinning needs a free account.
                </span>
              </span>
            </Link>
            <Link
              href="/shed/workshop"
              className="tt-card tt-card-hover flex items-start gap-4 text-ink no-underline hover:text-ink"
            >
              <span className={iconTile}>
                <ChatsCircleIcon size={24} aria-hidden />
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-xl font-semibold">Workshop</span>
                <span className="text-[15px] text-ink-secondary">
                  The members&apos; forum. Share builds, fixes and questions, fill out your profile and earn
                  achievement badges.
                </span>
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
