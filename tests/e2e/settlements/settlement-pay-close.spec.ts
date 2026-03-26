import { expect, test } from "@playwright/test";

test("settlement pay close shell", async ({ page }) => {
  await page.goto("/settlements");
  await expect(page).toHaveURL(/\/settlements/);
});

