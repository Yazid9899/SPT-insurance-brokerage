import { expect, test } from "@playwright/test";

test("draft delete confirmation flow placeholder", async ({ page }) => {
  await page.goto("/cases");
  await expect(page.getByText("Cases")).toBeVisible();
});
