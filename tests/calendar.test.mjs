import assert from "node:assert/strict";
import test from "node:test";
import { SAMPLE_SUBSCRIPTIONS as sample } from "../src/features/subscriptions/model.ts";
import {
  calendarDays,
  paymentsInMonth,
  shiftMonth,
  calendarLabel,
} from "../src/features/subscriptions/calendar-model.ts";

test("Monday-first calendar handles five and six weeks, leap years, and year boundaries", () => {
  const october = calendarDays("2026-10");
  assert.equal(october.length, 35);
  assert.deepEqual(october.slice(0, 4), [null, null, null, "2026-10-01"]);
  assert.equal(october.filter(Boolean).length, 31);
  assert.equal(calendarDays("2026-11").length, 42);
  assert.equal(calendarDays("2028-02").filter(Boolean).length, 29);
  assert.equal(calendarDays("2027-02").filter(Boolean).length, 28);
  assert.equal(shiftMonth("2026-12", 1), "2027-01");
  assert.equal(shiftMonth("2027-01", -1), "2026-12");
  assert.equal(
    calendarLabel("2026-10-18", { day: "numeric", month: "short" }),
    "18 Oct",
  );
});

test("sample monthly charges recur, exclude paused items, and never invent payment history", () => {
  assert.equal(paymentsInMonth(sample, "2026-09").length, 0);
  const october = paymentsInMonth(sample, "2026-10");
  assert.equal(october.length, 6);
  assert.equal(
    october.reduce((total, item) => total + item.price, 0),
    1576,
  );
  const november = paymentsInMonth(sample, "2026-11");
  assert.equal(november.length, 6);
  assert.equal(november[0].date, "2026-11-18");
  const paused = paymentsInMonth(
    sample.map((item) => ({ ...item, active: item.id !== "1" })),
    "2026-10",
  );
  assert.equal(paused.length, 5);
  assert.equal(
    paused.reduce((total, item) => total + item.price, 0),
    1157,
  );
  assert.equal(sample[0].date, "2026-10-18");
});

test("month-end recurrence retains the anchor day after short months", () => {
  const items = [{ ...sample[0], date: "2027-01-31" }];
  assert.equal(paymentsInMonth(items, "2027-02")[0].date, "2027-02-28");
  assert.equal(paymentsInMonth(items, "2027-03")[0].date, "2027-03-31");
  assert.equal(paymentsInMonth(items, "2028-02")[0].date, "2028-02-29");
});

test("annual charges appear in their billing month at full price, including leap-day renewals", () => {
  const annual = [
    { ...sample[0], date: "2028-02-29", cycle: "yearly", price: 1200 },
  ];
  assert.equal(paymentsInMonth(annual, "2027-02").length, 0);
  assert.equal(paymentsInMonth(annual, "2028-03").length, 0);
  assert.equal(paymentsInMonth(annual, "2029-02")[0].date, "2029-02-28");
  assert.equal(paymentsInMonth(annual, "2029-02")[0].price, 1200);
  assert.equal(paymentsInMonth(annual, "2032-02")[0].date, "2032-02-29");
  const sameDay = paymentsInMonth(
    [sample[0], { ...sample[1], date: sample[0].date }],
    "2026-10",
  );
  assert.equal(sameDay.filter((item) => item.date === "2026-10-18").length, 2);
});
