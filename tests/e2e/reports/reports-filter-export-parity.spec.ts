import { expect, test } from "@playwright/test";

test("reports filter and export shell", async ({ page }) => {
  await page.goto("/reports");
  await expect(page).toHaveURL(/\/reports/);
});
