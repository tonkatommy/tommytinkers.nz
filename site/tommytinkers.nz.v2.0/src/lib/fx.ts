// Site FX: the hover, scroll and button effects. The choices here match the
// CSS in globals.css (section 6), one data attribute per group on <html>.
//
// Two layers decide what a visitor gets:
//   1. The site default, saved by an admin in SiteSetting "fx.defaults".
//   2. The visitor's own choice, kept in their browser (localStorage).
// A device that asks for reduced motion overrides both.
import { z } from "zod";

export const CARD_FX = ["classic", "tilt", "socket", "peel", "glow"] as const;
export const LINK_FX = ["underline", "caret", "bracket", "swipe"] as const;
export const SCROLL_FX = ["none", "rise", "assemble", "blur", "swing"] as const;
export const BTN_FX = ["glow", "sweep", "press"] as const;

// Speed is a multiplier on every FX duration: slow 1.5, normal 1, fast 0.62.
export const FX_SCALES = { slow: 1.5, normal: 1, fast: 0.62 } as const;

export const fxSchema = z.object({
  cardfx: z.enum(CARD_FX),
  linkfx: z.enum(LINK_FX),
  scrollfx: z.enum(SCROLL_FX),
  btnfx: z.enum(BTN_FX),
  scale: z.number().min(0.25).max(3),
});
export type FxSettings = z.infer<typeof fxSchema>;

// Used when the database has no "fx.defaults" row yet, or a bad one.
// Same values as the admin settings design starts with.
export const FX_FALLBACK: FxSettings = {
  cardfx: "socket",
  linkfx: "caret",
  scrollfx: "swing",
  btnfx: "sweep",
  scale: 1,
};

// A visitor may override any part, and choose their motion level.
// "device" follows the operating system's reduce-motion setting.
export const fxOverrideSchema = fxSchema.partial().extend({
  motion: z.enum(["full", "reduced", "device"]).optional(),
});
export type FxOverride = z.infer<typeof fxOverrideSchema>;

export const FX_STORAGE_KEY = "tt-fx-v1";

/** Unknown or broken input becomes the fallback rather than an error. */
export function parseFxDefaults(value: unknown): FxSettings {
  const parsed = fxSchema.safeParse(value);
  return parsed.success ? parsed.data : FX_FALLBACK;
}

/** Reads a visitor's saved override. Bad JSON or bad values give {}. */
export function parseFxOverride(raw: string | null): FxOverride {
  if (!raw) return {};
  try {
    const parsed = fxOverrideSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : {};
  } catch {
    return {};
  }
}
