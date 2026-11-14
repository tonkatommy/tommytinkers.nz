import { describe, expect, it } from "vitest";
import { formatNZDate } from "@/lib/dates";

describe("formatNZDate", () => {
  it("formats as DD/MM/YYYY", () => {
    expect(formatNZDate(new Date("2026-11-10T00:00:00Z"))).toBe("10/11/2026");
  });

  it("uses New Zealand time, not UTC", () => {
    // 11:30 UTC on the 9th is already half past midnight on the 10th in NZ
    // (UTC+13 during daylight saving).
    expect(formatNZDate(new Date("2026-11-09T11:30:00Z"))).toBe("10/11/2026");
    // In winter NZ is UTC+12, so 11:30 UTC is still 11:30pm the same day.
    expect(formatNZDate(new Date("2026-06-09T11:30:00Z"))).toBe("09/06/2026");
  });
});
