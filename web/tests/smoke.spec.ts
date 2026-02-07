import { test, expect } from "@playwright/test";

test("home renders hero", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("shop page loads", async ({ page }) => {
  await page.goto("/shop");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/shop/i);
});

test("cart page loads", async ({ page }) => {
  await page.goto("/cart");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/cart/i);
});

test("login page loads", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
