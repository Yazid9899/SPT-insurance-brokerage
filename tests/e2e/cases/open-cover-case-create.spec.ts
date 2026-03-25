import { expect, test } from "@playwright/test";

test("open cover case create placeholder", async ({ page }) => {
  await page.goto("/cases/new");
  await expect(page).toHaveURL(/cases\/new/);
});
