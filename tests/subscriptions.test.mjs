import assert from "node:assert/strict";
import test from "node:test";
import {
  SAMPLE_SUBSCRIPTIONS as sample,
  monthlySpending,
  dueInWeek,
  upcomingPayments,
  readSubscriptions,
  isValidDate,
  daysUntil,
  spendingByCategory,
  readBudget,
} from "../src/features/subscriptions/model.ts";

test("saved budgets survive numeric round trips and invalid values fall back safely", () => {
  assert.equal(readBudget("1500.75"), 1500.75);
  for (const value of [null, "", "0", "-1", "NaN", "Infinity", "corrupt"]) {
    assert.equal(readBudget(value), 2000);
  }
});

test("Figma sample totals and upcoming rows", () => {
  assert.equal(monthlySpending(sample), 1576);
  assert.equal(dueInWeek(sample), 687);
  assert.deepEqual(
    upcomingPayments(sample)
      .slice(0, 3)
      .map((s) => s.name),
    ["Netflix", "Spotify", "iCloud+"],
  );
});

test("Insights category totals match the monthly summary and Figma percentages", () => {
  const breakdown = spendingByCategory(sample);
  assert.deepEqual(breakdown, [
    { category: "Entertainment", amount: 767, percentage: 49 },
    { category: "Productivity", amount: 429, percentage: 27 },
    { category: "Design", amount: 380, percentage: 24 },
  ]);
  assert.equal(
    breakdown.reduce((total, group) => total + group.amount, 0),
    monthlySpending(sample),
  );
});

test("Insights excludes paused charges and normalizes annual charges, including Other", () => {
  const items = [
    { ...sample[0], price: 1200, cycle: "yearly", category: "Other" },
    { ...sample[1], price: 100, category: "Design" },
    { ...sample[2], active: false, price: 999 },
  ];
  assert.equal(monthlySpending(items), 200);
  assert.deepEqual(spendingByCategory(items), [
    { category: "Design", amount: 100, percentage: 50 },
    { category: "Other", amount: 100, percentage: 50 },
  ]);
  assert.equal(monthlySpending(items) * 12, 2400);
});

test("Insights has no category bars for empty or entirely paused data", () => {
  assert.deepEqual(spendingByCategory([]), []);
  assert.deepEqual(
    spendingByCategory(sample.map((item) => ({ ...item, active: false }))),
    [],
  );
  assert.equal(monthlySpending([]), 0);
});
test("annual billing is amortized for spending but charged in full when due", () => {
  const annual = [{ ...sample[0], price: 1200, cycle: "yearly" }];
  assert.equal(monthlySpending(annual), 100);
  assert.equal(dueInWeek(annual), 1200);
});
test("paused and overdue subscriptions do not appear as upcoming", () => {
  const changed = sample.map((s) => ({ ...s, active: s.id !== "1" }));
  assert.equal(monthlySpending(changed), 1157);
  assert.equal(dueInWeek(changed), 268);
  assert.equal(
    upcomingPayments([{ ...sample[0], date: "2026-10-15" }]).length,
    0,
  );
  assert.equal(daysUntil("2026-10-18"), 2);
});
test("stored data preserves an intentionally empty list and rejects corrupt values", () => {
  assert.deepEqual(readSubscriptions("[]"), []);
  for (const invalid of [
    "invalid",
    "{}",
    JSON.stringify([{ ...sample[0], price: null }]),
    JSON.stringify([{ ...sample[0], date: "2026-02-30" }]),
  ]) {
    assert.deepEqual(readSubscriptions(invalid), sample);
  }
  assert.deepEqual(readSubscriptions(JSON.stringify(sample)), sample);
  assert.equal(isValidDate("2028-02-29"), true);
  assert.equal(isValidDate("2026-02-29"), false);
});

test("search and status filters combine without changing the saved list", async () => {
  const { filterSubscriptions } = await import(
    "../src/features/subscriptions/model.ts"
  );
  const items = sample.map((item) => ({ ...item, active: item.id !== "1" }));
  assert.deepEqual(
    filterSubscriptions(items, "  NETFLIX ", "paused").map((item) => item.id),
    ["1"],
  );
  assert.equal(filterSubscriptions(items, "netflix", "active").length, 0);
  assert.equal(filterSubscriptions(items, "premium", "all").length, 3);
  assert.equal(filterSubscriptions(items, "", "all").length, 6);
  assert.equal(monthlySpending(filterSubscriptions(items, "", "all")), 1157);
  assert.equal(items.length, 6);
  assert.equal(items[0].active, false);
});
