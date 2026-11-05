import type { Subscription } from "./model";

export function shiftMonth(month: string, offset: number): string {
  const date = new Date(`${month}-01T12:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + offset);
  return date.toISOString().slice(0, 7);
}

function daysInMonth(month: string): number {
  const date = new Date(`${month}-01T12:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + 1, 0);
  return date.getUTCDate();
}

// Monday-first weeks; empty cells keep the first and last week aligned.
export function calendarDays(month: string): (string | null)[] {
  const start = new Date(`${month}-01T12:00:00Z`);
  const offset = (start.getUTCDay() + 6) % 7;
  const count = daysInMonth(month);
  return Array.from(
    { length: Math.ceil((offset + count) / 7) * 7 },
    (_, index) => {
      const day = index - offset + 1;
      return day > 0 && day <= count
        ? `${month}-${String(day).padStart(2, "0")}`
        : null;
    },
  );
}

// The stored date is the next payment, not a historical start date.
// Always project from its original day so Jan 31 -> Feb 28 -> Mar 31.
export function paymentsInMonth(
  subscriptions: Subscription[],
  month: string,
): Subscription[] {
  const lastDay = daysInMonth(month);
  return subscriptions
    .flatMap((item) => {
      if (!item.active || month < item.date.slice(0, 7)) return [];
      if (item.cycle === "yearly" && month.slice(5) !== item.date.slice(5, 7))
        return [];
      const day = Math.min(Number(item.date.slice(8)), lastDay);
      return [{ ...item, date: `${month}-${String(day).padStart(2, "0")}` }];
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function calendarLabel(
  date: string,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", {
    ...options,
    timeZone: "UTC",
  });
}
