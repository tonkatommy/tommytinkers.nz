import { describe, expect, it } from "vitest";
import { FX_FALLBACK, parseFxDefaults, parseFxOverride } from "@/lib/fx";

describe("parseFxDefaults", () => {
  it("returns a valid saved setting unchanged", () => {
    const saved = { cardfx: "peel", linkfx: "underline", scrollfx: "none", btnfx: "press", scale: 1.5 };
    expect(parseFxDefaults(saved)).toEqual(saved);
  });

  it("falls back when there is no row", () => {
    expect(parseFxDefaults(undefined)).toEqual(FX_FALLBACK);
  });

  it("falls back when a value isn't one of the choices", () => {
    expect(parseFxDefaults({ ...FX_FALLBACK, cardfx: "explode" })).toEqual(FX_FALLBACK);
    expect(parseFxDefaults({ ...FX_FALLBACK, scale: 0 })).toEqual(FX_FALLBACK);
  });
});

describe("parseFxOverride", () => {
  it("reads a partial override", () => {
    expect(parseFxOverride('{"cardfx":"glow","motion":"reduced"}')).toEqual({ cardfx: "glow", motion: "reduced" });
  });

  it("gives nothing for missing, broken or invalid data", () => {
    expect(parseFxOverride(null)).toEqual({});
    expect(parseFxOverride("not json")).toEqual({});
    expect(parseFxOverride('{"cardfx":"explode"}')).toEqual({});
  });
});
