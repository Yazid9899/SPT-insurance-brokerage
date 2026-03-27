import { expect, test } from "@playwright/test";

test("case pages render loading-safe shell", async ({ page }) => {
  await page.goto("/cases");
  await expect(page.getByText("Cases")).toBeVisible();
});
