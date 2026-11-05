// Run with a signed-in Playwright Page on the Subscriptions route.
// The flow restores the six original sample subscriptions after testing edits.
export default async function checkSubscriptionsScreen(page) {
  const search = () =>
    page.getByRole("textbox", { name: "Find a subscription", exact: true });
  const filter = (name) => page.getByRole("tab", { name, exact: true });
  const dialog = page.getByRole("dialog");
  async function close() {
    await dialog
      .getByRole("button", { name: "Close sheet", exact: true })
      .click();
    await dialog.waitFor({ state: "hidden" });
  }
  await page.getByText("6 subscriptions", { exact: true }).waitFor();
  await page.getByText("฿1,576 / month", { exact: true }).waitFor();
  await search().fill("  NETFLIX  ");
  await page.getByText("1 subscription", { exact: true }).waitFor();
  await filter("Paused").click();
  await page.getByRole("heading", { name: "No subscriptions found" }).waitFor();
  await search().fill("");
  await page
    .getByRole("heading", { name: "No paused subscriptions" })
    .waitFor();
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();

  await page.getByRole("button", { name: /^Netflix,/ }).click();
  await dialog.getByRole("switch", { name: "Track subscription" }).uncheck();
  await close();
  await filter("Active").click();
  await page.getByText("5 subscriptions", { exact: true }).waitFor();
  await page.getByText("฿1,157 / month", { exact: true }).waitFor();
  await filter("Paused").click();
  await page
    .getByRole("button", { name: "Netflix, ฿419, Paused", exact: true })
    .waitFor();
  await filter("Overview").click();
  await page
    .getByLabel("Total month spending ฿1,157.00", { exact: true })
    .waitFor();
  await filter("Subscriptions").click();
  await filter("All").click();
  await page.getByRole("button", { name: /^Netflix,/ }).click();
  await dialog.getByRole("switch", { name: "Track subscription" }).check();
  await close();
  await page.getByText("฿1,576 / month", { exact: true }).waitFor();

  await page
    .getByRole("button", { name: "Add subscription", exact: true })
    .click();
  await dialog
    .getByRole("textbox", { name: "Service name", exact: true })
    .fill("QA Annual");
  await dialog
    .getByRole("textbox", { name: "Amount in Thai baht", exact: true })
    .fill("1200");
  await dialog
    .getByRole("button", { name: "Billing cycle: Monthly", exact: true })
    .click();
  await dialog.getByRole("radio", { name: "Yearly", exact: true }).click();
  await dialog
    .getByRole("button", { name: "Add subscription", exact: true })
    .click();
  await dialog.waitFor({ state: "hidden" });
  await page.getByText("7 subscriptions", { exact: true }).waitFor();
  await page.getByText("฿1,676 / month", { exact: true }).waitFor();
  await filter("Overview").click();
  await page
    .getByLabel("Total month spending ฿1,676.00", { exact: true })
    .waitFor();
  await filter("Subscriptions").click();
  await filter("All").click();
  await search().fill("qa annual");
  await page
    .getByRole("button", { name: /^QA Annual, ฿1,200, .*yearly$/ })
    .click();
  await dialog
    .getByRole("button", { name: "Remove subscription", exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "Confirm removal", exact: true })
    .click();
  await dialog.waitFor({ state: "hidden" });
  await page.getByRole("heading", { name: "No subscriptions found" }).waitFor();
  await search().fill("");
  await page.getByText("6 subscriptions", { exact: true }).waitFor();
  await page.reload();
  await page
    .getByRole("heading", { name: "Subscriptions", exact: true })
    .waitFor();
  await page.getByText("6 subscriptions", { exact: true }).waitFor();
  await page.getByText("฿1,576 / month", { exact: true }).waitFor();
  await page.getByRole("button", { name: /^Netflix,/ }).click({ trial: true });
  await page.screenshot({ path: "/tmp/recur-subscriptions-web-final.png" });
}
