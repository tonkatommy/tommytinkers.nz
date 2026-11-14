import Image from "next/image";

/**
 * Stands in for a product photo until real ones are added through admin:
 * the brand gradient with the logo centred, always square.
 */
export function ProductPlaceholder({ soldOut = false }: { soldOut?: boolean }) {
  return (
    // Out of stock fades and desaturates the image. The "Out of stock" pill
    // next to it carries the meaning in words.
    <div className={`tt-ph ${soldOut ? "opacity-55 grayscale-[0.7]" : ""}`}>
      {/* alt="" because the product name is right beside it as text. */}
      <Image src="/assets/logo.png" alt="" width={160} height={160} className="h-auto w-[38%]" />
    </div>
  );
}
