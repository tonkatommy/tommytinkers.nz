import Image from "next/image";
import Link from "next/link";

/** The logo and lowercase wordmark. Always links home. */
export function Brand() {
  return (
    <Link
      href="/"
      aria-label="tommy tinkers NZ, home"
      className="inline-flex min-h-11 items-center gap-2.5 text-lg font-bold tracking-tight whitespace-nowrap text-ink no-underline hover:text-ink"
    >
      {/* The logo file already includes its gradient disc. */}
      <Image src="/assets/logo.png" alt="" width={36} height={36} className="size-9 flex-none rounded-full" />
      <span>
        tommy tinkers <span className="text-eyebrow">NZ</span>
      </span>
    </Link>
  );
}
