import { expect, test } from "@playwright/test";

test("settlement create and match page shell", async ({ page }) => {
  await page.goto("/settlements");
  await expect(page).toHaveURL(/\/settlements/);
});

