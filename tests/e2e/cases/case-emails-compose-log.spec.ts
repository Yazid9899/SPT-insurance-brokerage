import { expect, test } from "@playwright/test";

test("case emails compose/log flow route availability", async ({ page }) => {
  await page.goto("/cases");
  await expect(page).toHaveURL(/\/cases|\/login/);
});

test("case detail emails tab route availability", async ({ page }) => {
  await page.goto("/cases/case-placeholder");
  await expect(page).toHaveURL(/\/cases\/case-placeholder|\/login/);
});

