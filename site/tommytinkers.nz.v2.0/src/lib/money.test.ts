import { describe, expect, it } from "vitest";
import { formatNZD } from "@/lib/money";

describe("formatNZD", () => {
  it("formats whole cents as dollars and cents", () => {
    expect(formatNZD(1850)).toBe("$18.50");
    expect(formatNZD(2000)).toBe("$20.00");
    expect(formatNZD(5)).toBe("$0.05");
    expect(formatNZD(0)).toBe("$0.00");
  });

  it("groups thousands", () => {
    expect(formatNZD(1750000)).toBe("$17,500.00");
  });

  it("shows a discount as a negative amount", () => {
    expect(formatNZD(-500)).toBe("-$5.00");
  });

  it("refuses fractions of a cent, which would mean a float crept in", () => {
    expect(() => formatNZD(18.5)).toThrow();
  });
});
