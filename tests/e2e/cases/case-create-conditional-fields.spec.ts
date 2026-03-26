import { expect, test } from "@playwright/test";

test("new case conditional fields", async ({ page }) => {
  await page.goto("/cases/new");
  await expect(page.getByText("Product Line")).toBeVisible();
});
