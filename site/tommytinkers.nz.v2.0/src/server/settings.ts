// Site settings an admin can change without a deploy (the SiteSetting table).
// Phase 1 only reads. The write side, with its manage_content check and audit
// log, arrives with the admin settings screen.
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { z } from "zod";
import { type FxSettings, parseFxDefaults } from "@/lib/fx";
import { db } from "@/server/db";

// Every cached settings read carries this tag, so saving settings in admin
// can refresh them all with one revalidateTag(SETTINGS_TAG, "max").
export const SETTINGS_TAG = "settings";

/**
 * The site-wide FX defaults. Public: every visitor's page uses them, so
 * there is no permission check on reading.
 */
export async function getFxDefaults(): Promise<FxSettings> {
  // "use cache" stores the result on the server, so this query runs about
  // once an hour instead of once per page view.
  "use cache";
  cacheTag(SETTINGS_TAG);
  cacheLife("hours");

  const row = await db.siteSetting.findUnique({ where: { key: "fx.defaults" } });
  return parseFxDefaults(row?.value);
}

const lowThresholdSchema = z.number().int().min(0);

/** Tracked products at or under this count show as "Low stock". */
export async function getLowStockThreshold(): Promise<number> {
  "use cache";
  cacheTag(SETTINGS_TAG);
  cacheLife("hours");

  const row = await db.siteSetting.findUnique({ where: { key: "stock.lowThreshold" } });
  const parsed = lowThresholdSchema.safeParse(row?.value);
  return parsed.success ? parsed.data : 3;
}
