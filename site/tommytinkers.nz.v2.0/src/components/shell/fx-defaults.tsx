import { connection } from "next/server";
import { SiteFxDriver } from "@/components/shell/fx-driver";
import { FX_FALLBACK, type FxSettings } from "@/lib/fx";
import { getFxDefaults } from "@/server/settings";

/**
 * Loads the site's FX defaults and hands them to the client-side driver.
 *
 * The layout wraps this in <Suspense>, so it streams in after the page
 * shell. That keeps the shell free of database calls: it can be prerendered
 * once and served to everyone.
 */
export async function FxDefaults() {
  // connection() means "wait for a real request". Without it Next would try
  // to read the database while building, when there isn't one.
  await connection();

  let defaults: FxSettings = FX_FALLBACK;
  try {
    defaults = await getFxDefaults();
  } catch {
    // Hover effects are decoration. If the database is down, fall back
    // quietly rather than break the page.
  }

  return <SiteFxDriver defaults={defaults} />;
}
