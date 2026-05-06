import { expect, test, type Page } from "@playwright/test";

function diningFloor(page: Page) {
  return page.getByRole("region", { name: /dining room layout/i });
}

async function openCardPaymentFromDeliveredCheck(page: Page) {
  await page.goto("/");
  await expect(diningFloor(page)).toBeVisible({
    timeout: 60_000,
  });

  await diningFloor(page).getByRole("button", { name: /table t12/i }).click();
  await page.getByRole("button", { name: /add margherita pizza/i }).click();
  await page.getByRole("button", { name: /submit to kitchen/i }).click();

  await expect
    .poll(
      async () =>
        page.getByRole("button", { name: /deliver to floor/i }).count(),
      { timeout: 25_000 },
    )
    .toBeGreaterThan(0);

  await page.getByRole("button", { name: /deliver to floor/i }).first().click();
  await expect(
    page
      .getByRole("complementary", { name: /orders for selected table/i })
      .getByText(/\$14/),
  ).toBeVisible();

  await page.getByRole("button", { name: /pay tab/i }).click();
  await page
    .getByRole("dialog", { name: /take payment/i })
    .getByRole("button", { name: /^card$/i })
    .click();
}

test.describe("Payment — card UX stories", () => {
  /**
   * Walks through charging a normal demo card so the payment window disappears and the floor goes back to asking which table to serve next.
   */
  test("successful card charge closes the modal and resets table selection", async ({
    page,
  }) => {
    await openCardPaymentFromDeliveredCheck(page);

    const payDialog = page.getByRole("dialog", { name: /take payment/i });
    await payDialog.getByLabel(/card number/i).fill("42424242");
    await payDialog.getByLabel(/^cvc$/i).fill("123");
    await payDialog.getByLabel(/zip code/i).fill("94107");
    await payDialog.getByRole("button", { name: /charge card/i }).click();

    await expect(
      page.getByRole("dialog", { name: /take payment/i }),
    ).toHaveCount(0, {
      timeout: 15_000,
    });
    await expect(page.getByText(/select a table/i)).toBeVisible();
  });

  /**
   * Makes sure the charge button stays grayed out until every card field has the right number of digits, then unlocks once the last digit lands.
   */
  test("Charge card stays disabled until card number, security code, and ZIP are complete", async ({
    page,
  }) => {
    await openCardPaymentFromDeliveredCheck(page);

    const payDialog = page.getByRole("dialog", { name: /take payment/i });
    const submit = payDialog.getByRole("button", { name: /charge card/i });
    await expect(submit).toBeDisabled();

    await payDialog.getByLabel(/card number/i).fill("4242424");
    await payDialog.getByLabel(/^cvc$/i).fill("123");
    await payDialog.getByLabel(/zip code/i).fill("94107");
    await expect(submit).toBeDisabled();

    await payDialog.getByLabel(/card number/i).fill("42424242");
    await expect(submit).toBeEnabled();
  });

  /**
   * Uses the built-in “always decline” demo card number to prove guests see an error, then can jump back to try another card without closing the whole sale flow.
   */
  test("declined demo card number shows an alert and recovery actions", async ({
    page,
  }) => {
    await openCardPaymentFromDeliveredCheck(page);

    const payDialog = page.getByRole("dialog", { name: /take payment/i });
    await payDialog.getByLabel(/card number/i).fill("11111111");
    await payDialog.getByLabel(/^cvc$/i).fill("123");
    await payDialog.getByLabel(/zip code/i).fill("94107");
    await payDialog.getByRole("button", { name: /charge card/i }).click();

    await expect(
      page.getByRole("status", { name: /processing card payment/i }),
    ).toBeVisible();
    await expect(payDialog.getByRole("alert")).toBeVisible({
      timeout: 10_000,
    });

    await expect(payDialog.getByRole("alert")).toContainText(/payment declined/i);

    await page.getByRole("button", { name: /try again/i }).click();
    await expect(payDialog.getByLabel(/card number/i)).toBeVisible();
    await expect(payDialog.getByLabel(/card number/i)).toHaveValue("11111111");
    await expect(payDialog.getByRole("button", { name: /charge card/i })).toBeEnabled();
  });

  /**
   * Confirms screen readers get a named dialog and each field is reachable by its visible label text.
   */
  test("payment dialog exposes labels and an accessible name", async ({
    page,
  }) => {
    await openCardPaymentFromDeliveredCheck(page);

    const dialog = page.getByRole("dialog", { name: /take payment/i });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("aria-modal", "true");

    await expect(dialog.getByLabel(/card number/i)).toBeVisible();
    await expect(dialog.getByLabel(/^cvc$/i)).toBeVisible();
    await expect(dialog.getByLabel(/zip code/i)).toBeVisible();
  });
});
