// Run with a Playwright Page against a signed-in Recur demo at 390 × 844.
// This exercises actual pointer events and the shared sheet, not a gesture mock.
export default async function checkSheetGestures(page) {
  const dialog = page.getByRole("dialog");
  async function drag(title, distance, grabber = false) {
    const heading = dialog.getByRole("heading", { name: title, exact: true });
    await heading.click({ trial: true }); // Wait for the opening transition to settle.
    const box = await (
      grabber ? dialog.getByTestId("sheet-drag-area") : heading
    ).boundingBox();
    if (!box) throw new Error(`Missing sheet header: ${title}`);
    const x = box.x + box.width / 2;
    const y = box.y + (grabber ? 12 : box.height / 2);
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x, y + distance, { steps: 12 });
    await page.mouse.up();
  }
  async function expectDismissed(title) {
    await dialog.waitFor({ state: "hidden", timeout: 1500 }).catch(() => {
      throw new Error(`${title}: downward header drag did not close the sheet`);
    });
  }

  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await drag("Settings", 160);
  await expectDismissed("Settings");

  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await drag("Settings", 16);
  if (!(await dialog.isVisible()))
    throw new Error("A short drag should return to the open position");
  await page.waitForFunction(() => {
    const panel = document.querySelector('[data-testid="sheet-panel"]');
    return (
      panel &&
      Math.abs(new DOMMatrixReadOnly(getComputedStyle(panel).transform).m42) <
        0.5
    );
  });
  await dialog.getByRole("button", { name: "Close sheet" }).click();
  await expectDismissed("Close button");

  await page
    .getByRole("button", { name: "Add subscription", exact: true })
    .click();
  await dialog
    .getByRole("textbox", { name: "Service name" })
    .fill("Draft gesture check");
  await drag("New subscription", 170);
  await expectDismissed("New subscription with a focused field");

  await page.getByRole("button", { name: "View all", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 500 });
  const lastItem = dialog.getByRole("button", { name: /^Notion,/ });
  await lastItem.scrollIntoViewIfNeeded();
  if (!(await dialog.isVisible()))
    throw new Error("Scrolling the list should not close the sheet");
  const didScroll = await dialog.evaluate((element) =>
    [...element.querySelectorAll("div")].some((node) => node.scrollTop > 0),
  );
  if (!didScroll)
    throw new Error("List check did not exercise actual scrolling");
  await lastItem.click();
  await drag("Subscription details", 170);
  await expectDismissed("Subscription details");
  await page.setViewportSize({ width: 390, height: 844 });

  await page.getByRole("button", { name: "View all", exact: true }).click();
  await drag("All subscriptions", 160, true);
  await expectDismissed("All subscriptions");

  await page
    .getByRole("button", { name: "Payment reminders", exact: true })
    .click();
  await drag("Payment reminders", 170);
  await expectDismissed("Payment reminders");
}
