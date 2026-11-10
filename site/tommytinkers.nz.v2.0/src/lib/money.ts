// Money is stored as integer cents everywhere (2000 = $20.00), because
// floating point can't hold 18.50 exactly. This is the one place that turns
// cents into text.
const nzd = new Intl.NumberFormat("en-NZ", {
  style: "currency",
  currency: "NZD",
  // "narrowSymbol" prints "$" rather than "NZ$"; every shop price is NZD.
  currencyDisplay: "narrowSymbol",
});

/** 1850 -> "$18.50" */
export function formatNZD(cents: number): string {
  if (!Number.isInteger(cents)) {
    throw new Error(`formatNZD expects whole cents, got ${cents}`);
  }
  return nzd.format(cents / 100);
}
