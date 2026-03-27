import { expect, test } from "@playwright/test";

test("cases list supports client and insurer filters", async ({ page }) => {
  await page.goto("/cases");
  await expect(page.locator('input[name="clientId"]')).toBeVisible();
  await expect(page.locator('input[name="insurerId"]')).toBeVisible();
});
