import { expect, test } from "@playwright/test";

test.describe("Floor POS UX stories", () => {
  test("server selects a table and builds an unpaid ticket", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByTestId("floor-canvas")).toBeVisible({
      timeout: 60_000,
    });

    await page.getByTestId("table-t10").click();
    await expect(page.getByRole("heading", { name: /table t10/i })).toBeVisible();

    await page.getByTestId("meal-meal-burger").click();
    await page.getByTestId("meal-meal-salad").click();

    await expect(page.getByText("Classic Burger ×")).toBeVisible();
    await expect(page.getByText("Caesar Salad ×")).toBeVisible();

    await page.getByTestId("btn-submit-order").click();
    await expect(page.getByTestId("kitchen-dock")).toBeVisible();
    await expect(page.getByTestId("kitchen-dock")).toContainText("cooking");
  });

  test("ticket preview sums meals currently on the check", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("floor-canvas")).toBeVisible({
      timeout: 60_000,
    });

    await page.getByTestId("table-t11").click();
    await page.getByTestId("meal-meal-pasta").click();
    await page.getByTestId("meal-meal-pasta").click();
    await page.getByTestId("btn-submit-order").click();

    await page.getByTestId("meal-meal-salmon").click();
    await page.getByTestId("btn-submit-order").click();

    await page.getByTestId("btn-generate-ticket").click();
    await expect(page.getByTestId("ticket-modal")).toBeVisible();
    await expect(page.getByTestId("ticket-total")).toContainText("$44");
  });

  test("servers charge cards after walking checks through expo", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByTestId("floor-canvas")).toBeVisible({
      timeout: 60_000,
    });

    await page.getByTestId("table-t12").click();
    await page.getByTestId("meal-meal-pizza").click();
    await page.getByTestId("btn-submit-order").click();

    await expect
      .poll(
        async () =>
          page.getByRole("button", { name: /deliver to floor/i }).count(),
        { timeout: 25_000 },
      )
      .toBeGreaterThan(0);

    await page.getByRole("button", { name: /deliver to floor/i }).first().click();
    await expect(page.getByTestId("tab-total")).toContainText("$14");

    await page.getByTestId("btn-pay-tab").click();
    await page.getByTestId("payment-card").click();

    await expect(page.getByTestId("payment-modal")).toHaveCount(0);
    await expect(page.getByText(/select a table/i)).toBeVisible();
  });
});
