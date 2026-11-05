// Run against a signed-in six-item demo using a Playwright Page.
// Restores the original persisted subscriptions and budget, even after failure.
export default async function checkSubscriptionManagement(page) {
  const dialog = page.getByRole("dialog");
  const button = (name) => page.getByRole("button", { name, exact: true });
  const field = (name) => dialog.getByRole("textbox", { name, exact: true });
  const tab = (name) => page.getByRole("tab", { name, exact: true }).click();
  const text = (value) =>
    page.getByText(value, { exact: true }).filter({ visible: true }).waitFor();
  const close = async () => {
    await dialog
      .getByRole("button", { name: "Close sheet", exact: true })
      .click();
    await dialog.waitFor({ state: "hidden" });
  };
  const value = async (input, expected) => {
    if ((await input.inputValue()) !== expected)
      throw new Error(`Expected field value ${expected}`);
  };
  const choose = async (label, current, next) => {
    await dialog
      .getByRole("button", { name: `${label}: ${current}`, exact: true })
      .click();
    await dialog.getByRole("radio", { name: next, exact: true }).click();
  };
  const backup = await page.evaluate(() => ({
    subscriptions: localStorage.getItem("recur-subscriptions-v1"),
    budget: localStorage.getItem("recur-budget-v1"),
  }));
  try {
    await tab("Overview");
    await text("Sample data · Monthly equivalent");
    await button("Add subscription").click();
    await field("Service name").fill("QA Draft");
    await field("Amount in Thai baht").fill("1200");
    await choose("Billing cycle", "Monthly", "Yearly");
    await choose("Category", "Entertainment", "Other");
    await dialog
      .getByLabel("Next payment date", { exact: true })
      .fill("2026-12-31");
    await close();
    await text("Draft saved for this session");
    await tab("Calendar");
    await button("Add subscription").click();
    await text("Draft restored. Continue where you left off.");
    await value(field("Service name"), "QA Draft");
    await value(field("Amount in Thai baht"), "1200");
    await value(
      dialog.getByLabel("Next payment date", { exact: true }),
      "2026-12-31",
    );
    await dialog
      .getByRole("button", { name: "Billing cycle: Yearly", exact: true })
      .waitFor();
    await dialog
      .getByRole("button", { name: "Discard draft", exact: true })
      .click();
    await dialog
      .getByRole("button", { name: "Keep editing", exact: true })
      .click();
    const primary = dialog.getByRole("button", {
      name: "Add subscription",
      exact: true,
    });
    const colors = await primary.evaluate((element) => ({
      background: getComputedStyle(element).backgroundColor,
      text: getComputedStyle(element.lastElementChild).color,
    }));
    if (
      colors.background !== "rgb(255, 122, 26)" ||
      colors.text !== "rgb(255, 255, 255)"
    )
      throw Error("Primary brand or label color changed");
    await page.setViewportSize({ width: 360, height: 780 });
    await primary.scrollIntoViewIfNeeded();
    const bounds = await dialog.getByTestId("sheet-panel").boundingBox();
    if (
      !bounds ||
      bounds.x < 0 ||
      bounds.x + bounds.width > 361 ||
      bounds.y < 0
    )
      throw Error("Form overflows a small screen");
    await page.screenshot({ path: "output/playwright/recur-draft-360.png" });
    await primary.click();
    await dialog.waitFor({ state: "hidden" });
    await text("Subscription added");
    await tab("Subscriptions");
    await text("7 subscriptions");
    await text("฿1,676 / month");
    await page.getByRole("button", { name: /^QA Draft,/ }).click();
    await button("Edit subscription").click();
    await value(field("Service name"), "QA Draft");
    await field("Amount in Thai baht").fill("999");
    await button("Cancel").click();
    await text("฿1,200 / year");
    await button("Edit subscription").click();
    await field("Amount in Thai baht").fill("0");
    await button("Save changes").click();
    await text("Enter an amount greater than ฿0.");
    await field("Amount in Thai baht").fill("2400");
    await choose("Category", "Other", "Design");
    await dialog
      .getByLabel("Next payment date", { exact: true })
      .fill("2026-11-05");
    await button("Save changes").click();
    await dialog.waitFor({ state: "hidden" });
    await text("Changes saved");
    await text("฿1,776 / month");
    await tab("Overview");
    await page
      .getByLabel("Total month spending ฿1,776.00", { exact: true })
      .waitFor();
    await button("Settings").click();
    await button("Edit monthly budget").click();
    await field("Monthly budget in Thai baht").fill("0");
    await button("Save budget").click();
    await text("Enter a budget greater than ฿0.");
    await field("Monthly budget in Thai baht").fill("1800");
    await button("Save budget").click();
    await dialog.waitFor({ state: "hidden" });
    await text("99% of ฿1,800 monthly budget");
    await page.reload();
    await text("99% of ฿1,800 monthly budget");
    await tab("Insights");
    await text("฿24 left this month");
    await button("Edit monthly budget").click();
    await field("Monthly budget in Thai baht").fill("1500");
    await button("Save budget").click();
    await dialog.waitFor({ state: "hidden" });
    await text("฿276 over budget this month");
    await page
      .getByRole("button", { name: /^View Design subscriptions,/ })
      .click();
    await dialog
      .getByRole("heading", { name: "Design subscriptions", exact: true })
      .waitFor();
    await dialog.getByRole("button", { name: /^Figma,/ }).waitFor();
    await dialog.getByRole("button", { name: /^QA Draft,/ }).waitFor();
    if (await dialog.getByRole("button", { name: /^Netflix,/ }).count())
      throw Error("Category drill-down includes another category");
    await close();
    await tab("Calendar");
    await button("Next month").click();
    await page
      .getByRole("button", {
        name: "18 November 2026, payment due",
        exact: true,
      })
      .click();
    await page.getByRole("button", { name: /^Netflix,/ }).click();
    await text("Selected payment");
    await text("18 November 2026");
    await text("18 October 2026");
    await button("Edit subscription").click();
    await value(
      dialog.getByLabel("Next payment date", { exact: true }),
      "2026-10-18",
    );
    await button("Cancel").click();
    await text("18 November 2026");
    await page.waitForFunction(() => {
      const panel = document.querySelector('[data-testid="sheet-panel"]');
      return (
        panel &&
        Math.abs(new DOMMatrixReadOnly(getComputedStyle(panel).transform).m42) <
          0.5
      );
    });
    await page.screenshot({
      path: "output/playwright/recur-calendar-context-360.png",
    });
    await close();
    await button("Go to today").click();
    await page
      .getByRole("button", { name: "16 October 2026, today", exact: true })
      .waitFor();
    // Confirm explicit discard clears the draft, while closing alone preserved it.
    await button("Add subscription").click();
    await value(field("Service name"), "");
    await field("Service name").fill("Discard check");
    await button("Discard draft").click();
    await button("Confirm discard").click();
    await dialog.waitFor({ state: "hidden" });
    await button("Add subscription").click();
    await value(field("Service name"), "");
    await close();
    return {
      passed: [
        "primary orange and white label",
        "draft across tabs",
        "discard confirmation",
        "edit validation and cancel",
        "annual amount/category/date update",
        "budget validation and persistence",
        "cross-screen totals",
        "Insights category drill-down",
        "calendar occurrence context and Today",
        "360px sheet bounds",
      ],
    };
  } finally {
    await page.evaluate((original) => {
      for (const [key, value] of [
        ["recur-subscriptions-v1", original.subscriptions],
        ["recur-budget-v1", original.budget],
      ]) {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      }
    }, backup);
    await page.goto("http://localhost:8081/");
  }
}
