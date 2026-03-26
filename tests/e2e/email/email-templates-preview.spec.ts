import { expect, test } from "@playwright/test";

test("email templates page route availability", async ({ page }) => {
  await page.goto("/email-templates");
  await expect(page).toHaveURL(/\/email-templates|\/login/);
});

