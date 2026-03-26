import { expect, test } from "@playwright/test";

test("bulk upload confirm shell placeholder", async ({ page }) => {
  await page.goto("/cases/bulk-upload");
  await expect(page.locator("text=3. Confirm")).toBeVisible();
});

