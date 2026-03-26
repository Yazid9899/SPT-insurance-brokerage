import { expect, test } from "@playwright/test";

test("case list filters via url params", async ({ page }) => {
  await page.goto("/cases?status=DRAFT&page=1");
  await expect(page).toHaveURL(/status=DRAFT/);
});
