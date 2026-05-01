import { describe, expect, it } from "vitest";
import type { OrderRow, TableSessionRow } from "@/lib/types";
import {
  getDraftOrderForTable,
  getSessionForTable,
  isTableOccupied,
  ordersForTable,
  tableHasKitchenWorkload,
} from "@/lib/table-selection";

const sessionsFixture = (): Record<string, TableSessionRow> => ({
  t01: { tableId: "t01", occupiedSince: 1 },
});

const ordersFixture = (): OrderRow[] => [
  {
    id: "order-draft",
    tableId: "t01",
    lines: [{ mealId: "meal-burger", quantity: 1 }],
    status: "draft",
    createdAt: 2,
  },
  {
    id: "order-cook",
    tableId: "t02",
    lines: [{ mealId: "meal-salad", quantity: 1 }],
    status: "cooking",
    createdAt: 3,
    cookingStartedAt: 4,
  },
];

describe("table selection helpers", () => {
  it("detects occupancy via Indexed rows mirrored into maps", () => {
    const sessions = sessionsFixture();
    expect(isTableOccupied(sessions, "t01")).toBe(true);
    expect(isTableOccupied(sessions, "t02")).toBe(false);
    expect(getSessionForTable(sessions, "t01")?.tableId).toBe("t01");
  });

  it("scopes draft detection per physical table", () => {
    const orders = ordersFixture();
    expect(getDraftOrderForTable(orders, "t01")?.id).toBe("order-draft");
    expect(getDraftOrderForTable(orders, "t02")).toBeUndefined();
    expect(ordersForTable(orders, "t01")).toHaveLength(1);
    expect(ordersForTable(orders, "t02")).toHaveLength(1);
  });

  it("flags tables waiting on kitchen or expo pickup", () => {
    const orders = ordersFixture();
    expect(tableHasKitchenWorkload(orders, "t01")).toBe(false);
    expect(tableHasKitchenWorkload(orders, "t02")).toBe(true);

    const updated = orders.map((o) =>
      o.id === "order-cook" ? { ...o, status: "delivered" as const } : o,
    );
    expect(tableHasKitchenWorkload(updated, "t02")).toBe(false);
  });
});
