import { expect, test } from "@playwright/test";

test("reports page renders loading-safe shell", async ({ page }) => {
  await page.goto("/reports");
  await expect(page.getByText("Reports")).toBeVisible();
});
