import { describe, expect, it, vi } from "vitest";
import { buildDayReceiptFromClosedTab } from "@/lib/day-receipts";
import type { OrderRow } from "@/lib/types";

describe("buildDayReceiptFromClosedTab", () => {
  /**
   * Closing out a table should produce a printable-style snapshot with friendly dish names, line totals, the payment type, and the business date derived from when the check was paid.
   */
  it("snapshots lines and totals from delivered orders", () => {
    vi.stubGlobal("crypto", { randomUUID: () => "receipt-test-id" });

    const tabOrders: OrderRow[] = [
      {
        id: "o1",
        tableId: "t01",
        lines: [
          { mealId: "meal-burger", quantity: 2 },
          { mealId: "meal-salad", quantity: 1 },
        ],
        status: "delivered",
        createdAt: 0,
      },
    ];

    const paidAt = new Date(2026, 4, 1, 14, 30, 0).getTime();
    const receipt = buildDayReceiptFromClosedTab(
      paidAt,
      "t01",
      "B1",
      "cash",
      tabOrders,
    );

    expect(receipt.id).toBe("receipt-test-id");
    expect(receipt.tableId).toBe("t01");
    expect(receipt.tableLabel).toBe("B1");
    expect(receipt.paymentMethod).toBe("cash");
    expect(receipt.businessDayKey).toBe("2026-05-01");
    expect(receipt.totalCents).toBe(12_00 * 2 + 9_00);
    expect(receipt.lines).toHaveLength(2);
    expect(receipt.lines[0]).toMatchObject({
      mealId: "meal-burger",
      quantity: 2,
      lineTotalCents: 2400,
      mealName: "Classic Burger",
    });
    expect(receipt.lines[1]).toMatchObject({
      mealId: "meal-salad",
      quantity: 1,
      lineTotalCents: 900,
    });
  });
});
