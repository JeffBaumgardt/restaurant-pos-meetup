import { expect, test, type Page } from "@playwright/test";

function diningFloor(page: Page) {
  return page.getByRole("region", { name: /dining room layout/i });
}

test.describe("Floor POS UX stories", () => {
  /**
   * Opens the floor map, taps a table, rings in two dishes, and confirms the ticket flows into the kitchen queue so cooks see work starting.
   */
  test("server selects a table and builds an unpaid ticket", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(diningFloor(page)).toBeVisible({
      timeout: 60_000,
    });

    await diningFloor(page).getByRole("button", { name: /table t10/i }).click();
    await expect(page.getByRole("heading", { name: /table t10/i })).toBeVisible();

    await page.getByRole("button", { name: /add classic burger/i }).click();
    await page.getByRole("button", { name: /add caesar salad/i }).click();

    await expect(page.getByText("Classic Burger ×")).toBeVisible();
    await expect(page.getByText("Caesar Salad ×")).toBeVisible();

    await page.getByRole("button", { name: /submit to kitchen/i }).click();
    await expect(
      page.getByRole("region", { name: /kitchen queue/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("region", { name: /kitchen queue/i }),
    ).toContainText("cooking");
  });

  /**
   * Sends multiple rounds of food for one party and opens the preview receipt to prove the running total matches everything currently on the check.
   */
  test("ticket preview sums meals currently on the check", async ({ page }) => {
    await page.goto("/");
    await expect(diningFloor(page)).toBeVisible({
      timeout: 60_000,
    });

    await diningFloor(page).getByRole("button", { name: /table t11/i }).click();
    await page.getByRole("button", { name: /add pasta carbonara/i }).click();
    await page.getByRole("button", { name: /add pasta carbonara/i }).click();
    await page.getByRole("button", { name: /submit to kitchen/i }).click();

    await page.getByRole("button", { name: /add grilled salmon/i }).click();
    await page.getByRole("button", { name: /submit to kitchen/i }).click();

    await page.getByRole("button", { name: /ticket preview/i }).click();
    const ticketDialog = page.getByRole("dialog", { name: /guest ticket/i });
    await expect(ticketDialog).toBeVisible();
    await expect(
      ticketDialog.getByRole("definition"),
    ).toContainText("$44");
  });
});
