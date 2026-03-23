import { test, expect } from "@playwright/test";

test("landing page renders search CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: /run research/i })).toBeVisible();
});
