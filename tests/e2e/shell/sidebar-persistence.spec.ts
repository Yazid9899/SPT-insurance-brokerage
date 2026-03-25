import { test, expect } from "@playwright/test";

test.skip("sidebar remains persistent between module routes", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByText("CargoShield")).toBeVisible();
});
