import { expect, test } from "@playwright/test";

test("case lifecycle transition dialog placeholder", async ({ page }) => {
  await page.goto("/cases");
  await expect(page.getByText("Cases")).toBeVisible();
});
