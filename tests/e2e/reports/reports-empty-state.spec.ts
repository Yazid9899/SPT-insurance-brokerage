import { expect, test } from "@playwright/test";

test("reports empty state shell", async ({ page }) => {
  await page.goto("/reports?dateFrom=1990-01-01&dateTo=1990-01-31");
  await expect(page).toHaveURL(/\/reports/);
});
