import { expect, test } from "@playwright/test";

test("reports party filter controls are visible", async ({ page }) => {
  await page.goto("/reports");
  await expect(page.getByText("Client ID")).toBeVisible();
  await expect(page.getByText("Insurer ID")).toBeVisible();
});
