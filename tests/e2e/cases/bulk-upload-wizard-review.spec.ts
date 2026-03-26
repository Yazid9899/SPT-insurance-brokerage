import { expect, test } from "@playwright/test";

test("bulk upload review shell is reachable", async ({ page }) => {
  await page.goto("/cases/bulk-upload");
  await expect(page.locator("text=1. Setup")).toBeVisible();
});

