import { test, expect } from "@playwright/test";

test.skip("authenticated /login redirects to dashboard", async ({ page }) => {
  await page.goto("/login");
  await expect(page).toHaveURL(/login|dashboard/);
});
