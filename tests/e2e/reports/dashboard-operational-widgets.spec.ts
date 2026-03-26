import { expect, test } from "@playwright/test";

test("dashboard widgets shell", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/dashboard/);
});
