import { expect, test } from "@playwright/test";

test("open cover detail filters placeholder", async ({ page }) => {
  await page.goto("/open-covers");
  await expect(page).toHaveURL(/open-covers/);
});
