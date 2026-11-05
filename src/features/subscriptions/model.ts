export type Category = "Entertainment" | "Productivity" | "Design" | "Other";
export type BillingCycle = "monthly" | "yearly";
export type Subscription = {
  id: string;
  name: string;
  plan: string;
  price: number;
  cycle: BillingCycle;
  date: string;
  category: Category;
  brand:
    | "netflix"
    | "spotify"
    | "cloud"
    | "youtube"
    | "figma"
    | "notion"
    | "custom";
  active: boolean;
};

// A fixed sample clock keeps the supplied Figma amounts and payment dates reproducible.
export const DEMO_DATE = "2026-10-16";
export const BUDGET = 2000;
export type SubscriptionDraft = {
  name: string;
  amount: string;
  cycle: BillingCycle;
  date: string;
  category: Category;
};

export function readBudget(saved: string | null): number {
  const amount = Number(saved);
  return Number.isFinite(amount) && amount > 0 ? amount : BUDGET;
}
export const CATEGORIES: Category[] = [
  "Entertainment",
  "Productivity",
  "Design",
  "Other",
];
export const SAMPLE_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "1",
    name: "Netflix",
    plan: "Premium plan",
    price: 419,
    cycle: "monthly",
    date: "2026-10-18",
    category: "Entertainment",
    brand: "netflix",
    active: true,
  },
  {
    id: "2",
    name: "Spotify",
    plan: "Premium individual",
    price: 169,
    cycle: "monthly",
    date: "2026-10-20",
    category: "Entertainment",
    brand: "spotify",
    active: true,
  },
  {
    id: "3",
    name: "iCloud+",
    plan: "200 GB storage",
    price: 99,
    cycle: "monthly",
    date: "2026-10-22",
    category: "Productivity",
    brand: "cloud",
    active: true,
  },
  {
    id: "4",
    name: "YouTube",
    plan: "Premium individual",
    price: 179,
    cycle: "monthly",
    date: "2026-10-25",
    category: "Entertainment",
    brand: "youtube",
    active: true,
  },
  {
    id: "5",
    name: "Figma",
    plan: "Professional",
    price: 380,
    cycle: "monthly",
    date: "2026-10-28",
    category: "Design",
    brand: "figma",
    active: true,
  },
  {
    id: "6",
    name: "Notion",
    plan: "Plus plan",
    price: 330,
    cycle: "monthly",
    date: "2026-10-30",
    category: "Productivity",
    brand: "notion",
    active: true,
  },
];

export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T12:00:00Z");
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

export function readSubscriptions(saved: string | null): Subscription[] {
  if (!saved) return SAMPLE_SUBSCRIPTIONS;
  try {
    const value: unknown = JSON.parse(saved);
    if (
      Array.isArray(value) &&
      value.every(
        (s): s is Subscription =>
          s &&
          typeof s.id === "string" &&
          typeof s.name === "string" &&
          typeof s.plan === "string" &&
          Number.isFinite(s.price) &&
          s.price > 0 &&
          ["monthly", "yearly"].includes(s.cycle) &&
          typeof s.date === "string" &&
          isValidDate(s.date) &&
          CATEGORIES.includes(s.category) &&
          [
            "netflix",
            "spotify",
            "cloud",
            "youtube",
            "figma",
            "notion",
            "custom",
          ].includes(s.brand) &&
          typeof s.active === "boolean",
      )
    )
      return value;
  } catch {
    /* Corrupt persisted demo data falls back to the sample set. */
  }
  return SAMPLE_SUBSCRIPTIONS;
}

export function monthlySpending(subscriptions: Subscription[]): number {
  return subscriptions
    .filter((s) => s.active)
    .reduce((total, s) => total + s.price / (s.cycle === "yearly" ? 12 : 1), 0);
}

export function spendingByCategory(subscriptions: Subscription[]) {
  const total = monthlySpending(subscriptions);
  return CATEGORIES.map((category) => {
    const amount = monthlySpending(
      subscriptions.filter((item) => item.category === category),
    );
    return {
      category,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    };
  }).filter((group) => group.amount > 0);
}

export function daysUntil(date: string, from = DEMO_DATE): number {
  return Math.round(
    (Date.parse(date + "T12:00:00Z") - Date.parse(from + "T12:00:00Z")) /
      86400000,
  );
}

export function upcomingPayments(
  subscriptions: Subscription[],
): Subscription[] {
  return subscriptions
    .filter((s) => s.active && s.date >= DEMO_DATE)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function dueInWeek(subscriptions: Subscription[]): number {
  return upcomingPayments(subscriptions)
    .filter((s) => daysUntil(s.date) <= 7)
    .reduce((total, s) => total + s.price, 0);
}

export function money(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export type SubscriptionStatus = "all" | "active" | "paused";

export function filterSubscriptions(
  items: Subscription[],
  query: string,
  status: SubscriptionStatus,
): Subscription[] {
  const search = query.trim().toLocaleLowerCase();
  return items.filter(
    (item) =>
      (status === "all" || item.active === (status === "active")) &&
      (!search ||
        `${item.name} ${item.plan}`.toLocaleLowerCase().includes(search)),
  );
}
