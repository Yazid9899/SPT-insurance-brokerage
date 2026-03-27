import { expect, test } from "@playwright/test";

test("single-shipment requires explicit party selectors", async ({ page }) => {
  await page.goto("/cases/new");
  await page.selectOption('select[name="coverType"]', "SINGLE_SHIPMENT");
  await expect(page.getByText("Client")).toBeVisible();
  await expect(page.getByText("Insurer")).toBeVisible();
});
