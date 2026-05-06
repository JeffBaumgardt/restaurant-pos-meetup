/** @vitest-environment jsdom */

import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { DayReceiptRow, OrderRow, TableSessionRow } from "@/lib/types";
import { usePosWorkspace } from "@/components/pos/usePosWorkspace";

const MOCK_NOW = 1_700_000_000_000;

vi.mock("@/lib/time", () => ({
  timestamp: vi.fn(() => MOCK_NOW),
  businessDayKeyLocal: vi.fn(() => "2023-11-15"),
}));

let sessionsStore: TableSessionRow[] = [];
let ordersStore: OrderRow[] = [];
let receiptsStore: DayReceiptRow[] = [];

vi.mock("@/lib/db", () => ({
  loadPosState: vi.fn(async () => ({
    sessions: [...sessionsStore],
    orders: [...ordersStore],
  })),
  upsertSession: vi.fn(async (row: TableSessionRow) => {
    sessionsStore = sessionsStore.filter((s) => s.tableId !== row.tableId);
    sessionsStore.push(row);
  }),
  putOrder: vi.fn(async (order: OrderRow) => {
    ordersStore = ordersStore.filter((o) => o.id !== order.id);
    ordersStore.push(order);
  }),
  deleteSession: vi.fn(async (tableId: string) => {
    sessionsStore = sessionsStore.filter((s) => s.tableId !== tableId);
  }),
  deleteOrdersForTable: vi.fn(async (tableId: string) => {
    ordersStore = ordersStore.filter((o) => o.tableId !== tableId);
  }),
  appendDayReceipt: vi.fn(async (row: DayReceiptRow) => {
    receiptsStore.push(row);
  }),
  loadReceiptsForBusinessDay: vi.fn(async (dayKey: string) =>
    receiptsStore.filter((r) => r.businessDayKey === dayKey),
  ),
  resetAllPosData: vi.fn(async () => {
    sessionsStore = [];
    ordersStore = [];
    receiptsStore = [];
  }),
}));

describe("usePosWorkspace", () => {
  beforeEach(() => {
    sessionsStore = [];
    ordersStore = [];
    receiptsStore = [];
    vi.stubGlobal("crypto", { randomUUID: () => "order-fixed-id" });
  });

  /**
   * When saved tables exist on disk, the workspace should finish loading and mirror those seated tables without guessing extra orders or receipts.
   */
  it("hydrates from loadPosState", async () => {
    sessionsStore = [{ tableId: "t01", occupiedSince: MOCK_NOW - 60_000 }];

    const { result } = renderHook(() =>
      usePosWorkspace({ kitchenPollIntervalMs: false }),
    );

    await waitFor(() => expect(result.current.hydrated).toBe(true));
    expect(result.current.sessions.t01).toEqual({
      tableId: "t01",
      occupiedSince: MOCK_NOW - 60_000,
    });
    expect(result.current.orders).toEqual([]);
    expect(result.current.dayReceipts).toEqual([]);
  });

  /**
   * Choosing a table updates which party the POS thinks you are serving so menus and totals line up with that station.
   */
  it("handleSelectTable updates selection", async () => {
    const { result } = renderHook(() =>
      usePosWorkspace({ kitchenPollIntervalMs: false }),
    );
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    await act(async () => {
      await result.current.handleSelectTable("t05");
    });
    expect(result.current.selectedTableId).toBe("t05");
  });

  /**
   * Resetting the demo should wipe stored visits and checks and drop table selection so trainers start from a clean slate.
   */
  it("handleResetDemo clears stores and selection", async () => {
    sessionsStore = [{ tableId: "t01", occupiedSince: MOCK_NOW }];
    const { result } = renderHook(() =>
      usePosWorkspace({ kitchenPollIntervalMs: false }),
    );
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    await act(async () => {
      await result.current.handleSelectTable("t01");
    });
    await act(async () => {
      await result.current.handleResetDemo();
    });

    expect(result.current.selectedTableId).toBe(null);
    expect(result.current.sessions).toEqual({});
    await waitFor(() => expect(result.current.orders).toEqual([]));
    expect(result.current.dayReceipts).toEqual([]);
  });

  /**
   * Adding food on an empty table should seat that party automatically and build an unsent ticket line item list you can keep editing.
   */
  it("handleAddMeal seats table and appends a draft line", async () => {
    const { result } = renderHook(() =>
      usePosWorkspace({ kitchenPollIntervalMs: false }),
    );
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    await act(async () => {
      await result.current.handleSelectTable("t10");
    });
    await act(async () => {
      await result.current.handleAddMeal("meal-burger");
    });

    await waitFor(() =>
      expect(result.current.draft?.lines).toEqual([
        { mealId: "meal-burger", quantity: 1 },
      ]),
    );
    expect(result.current.session?.tableId).toBe("t10");
  });

  /**
   * Sending the ticket removes it from “still editing” state and turns it into an active kitchen job with timestamps filled in.
   */
  it("handleSubmitOrder sends draft to kitchen", async () => {
    const { result } = renderHook(() =>
      usePosWorkspace({ kitchenPollIntervalMs: false }),
    );
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    await act(async () => {
      await result.current.handleSelectTable("t11");
    });
    await act(async () => {
      await result.current.handleAddMeal("meal-pizza");
    });
    await act(async () => {
      await result.current.handleSubmitOrder();
    });

    await waitFor(() => expect(result.current.draft).toBeUndefined());
    const cooking = result.current.selectedOrders.filter(
      (o) => o.status === "cooking",
    );
    expect(cooking).toHaveLength(1);
    expect(cooking[0]?.lines).toEqual([{ mealId: "meal-pizza", quantity: 1 }]);
    expect(cooking[0]?.submittedAt).toBe(MOCK_NOW);
    expect(cooking[0]?.cookingStartedAt).toBe(MOCK_NOW);
  });

  /**
   * Taking payment closes modals, frees the table, clears checks for that visit, and writes an end-of-day style receipt using how they paid.
   */
  it("handlePay clears session, orders, and selection", async () => {
    sessionsStore = [{ tableId: "t12", occupiedSince: MOCK_NOW }];
    ordersStore = [
      {
        id: "ord-1",
        tableId: "t12",
        lines: [{ mealId: "meal-pizza", quantity: 1 }],
        status: "delivered",
        createdAt: MOCK_NOW,
        deliveredAt: MOCK_NOW,
      },
    ];

    const { result } = renderHook(() =>
      usePosWorkspace({ kitchenPollIntervalMs: false }),
    );
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    await act(async () => {
      await result.current.handleSelectTable("t12");
    });
    await act(async () => {
      await result.current.handlePay("card");
    });

    expect(result.current.selectedTableId).toBe(null);
    expect(result.current.payOpen).toBe(false);
    expect(result.current.ticketOpen).toBe(false);
    await waitFor(() => {
      expect(Object.keys(result.current.sessions)).toHaveLength(0);
      expect(result.current.orders).toHaveLength(0);
    });
    await waitFor(() => expect(result.current.dayReceipts).toHaveLength(1));
    const logged = result.current.dayReceipts[0];
    expect(logged?.tableId).toBe("t12");
    expect(logged?.tableLabel).toBe("T12");
    expect(logged?.paymentMethod).toBe("card");
    expect(logged?.totalCents).toBe(1400);
    expect(logged?.lines).toEqual([
      expect.objectContaining({
        mealId: "meal-pizza",
        quantity: 1,
        lineTotalCents: 1400,
      }),
    ]);
  });

  /**
   * Removing plates from the draft drops quantities until the dish disappears entirely once count hits zero.
   */
  it("handleDecrementMeal removes quantity from draft", async () => {
    const { result } = renderHook(() =>
      usePosWorkspace({ kitchenPollIntervalMs: false }),
    );
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    await act(async () => {
      await result.current.handleSelectTable("t13");
    });
    await act(async () => {
      await result.current.handleAddMeal("meal-salad");
    });
    await act(async () => {
      await result.current.handleAddMeal("meal-salad");
    });
    expect(result.current.draft?.lines).toEqual([
      { mealId: "meal-salad", quantity: 2 },
    ]);

    await act(async () => {
      await result.current.handleDecrementMeal("meal-salad");
    });

    await waitFor(() =>
      expect(result.current.draft?.lines).toEqual([
        { mealId: "meal-salad", quantity: 1 },
      ]),
    );
  });

  /**
   * Marking food delivered updates the runner board so everyone sees that table’s plates reached the dining room.
   */
  it("handleMarkDelivered updates order status", async () => {
    sessionsStore = [{ tableId: "t14", occupiedSince: MOCK_NOW }];
    ordersStore = [
      {
        id: "ready-1",
        tableId: "t14",
        lines: [{ mealId: "meal-burger", quantity: 1 }],
        status: "ready",
        createdAt: MOCK_NOW,
        readyAt: MOCK_NOW,
      },
    ];

    const { result } = renderHook(() =>
      usePosWorkspace({ kitchenPollIntervalMs: false }),
    );
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    const readyOrder = result.current.orders.find((o) => o.id === "ready-1");
    expect(readyOrder).toBeDefined();

    await act(async () => {
      await result.current.handleMarkDelivered(readyOrder!);
    });

    await waitFor(() => {
      const updated = result.current.orders.find((o) => o.id === "ready-1");
      expect(updated?.status).toBe("delivered");
      expect(updated?.deliveredAt).toBe(MOCK_NOW);
    });
  });
});
