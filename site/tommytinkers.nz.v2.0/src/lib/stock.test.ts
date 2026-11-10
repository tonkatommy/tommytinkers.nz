import { describe, expect, it } from "vitest";
import { stockStatus } from "@/lib/stock";

describe("stockStatus", () => {
  it("made to order never sells out, whatever the count says", () => {
    expect(stockStatus("MADE_TO_ORDER", null, 3)).toBe("made_to_order");
    expect(stockStatus("MADE_TO_ORDER", 0, 3)).toBe("made_to_order");
  });

  it("tracked products sell out at zero", () => {
    expect(stockStatus("TRACKED", 0, 3)).toBe("out_of_stock");
    expect(stockStatus("TRACKED", null, 3)).toBe("out_of_stock");
    expect(stockStatus("TRACKED", -1, 3)).toBe("out_of_stock");
  });

  it("low stock is at or under the threshold", () => {
    expect(stockStatus("TRACKED", 1, 3)).toBe("low_stock");
    expect(stockStatus("TRACKED", 3, 3)).toBe("low_stock");
    expect(stockStatus("TRACKED", 4, 3)).toBe("in_stock");
  });

  it("a threshold of zero turns the low-stock warning off", () => {
    expect(stockStatus("TRACKED", 1, 0)).toBe("in_stock");
  });
});
