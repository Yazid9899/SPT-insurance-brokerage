import { expect, test } from "@playwright/test";

test("open cover CRUD journey placeholder", async ({ page }) => {
  await page.goto("/login");
  await expect(page).toHaveURL(/login/);
});
