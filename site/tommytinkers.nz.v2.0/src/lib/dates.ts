// Dates are stored in UTC and shown in New Zealand time as DD/MM/YYYY.
// The time zone is fixed here, not taken from the server or the browser,
// so a date reads the same wherever the code runs.
const nzDate = new Intl.DateTimeFormat("en-NZ", {
  timeZone: "Pacific/Auckland",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** A UTC instant -> "10/11/2026" in NZ time. */
export function formatNZDate(date: Date): string {
  return nzDate.format(date);
}
