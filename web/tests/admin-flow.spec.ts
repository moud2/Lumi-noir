import { test, expect } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;

test.describe("admin flow", () => {
  test.skip(!adminEmail || !adminPassword, "Missing E2E admin credentials");

  test("admin can log in and open products", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("Email").fill(adminEmail!);
    await page.getByPlaceholder("Password").fill(adminPassword!);
    await page.getByRole("button", { name: /login/i }).click();

    await page.goto("/admin/products");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/products/i);
  });
});
