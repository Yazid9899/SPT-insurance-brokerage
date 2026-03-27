import { expect, test } from "@playwright/test";

test("open-cover flow exposes linked-client selector", async ({ page }) => {
  await page.goto("/cases/new");
  await page.selectOption('select[name="coverType"]', "OPEN_COVER");
  await expect(page.getByText("Open Cover Agreement")).toBeVisible();
  await expect(page.getByText("Client")).toBeVisible();
});
