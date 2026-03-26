import { expect, test } from "@playwright/test";

test("bulk upload setup route loads", async ({ page }) => {
  await page.goto("/cases/bulk-upload");
  await expect(page).toHaveURL(/\/cases\/bulk-upload/);
});

