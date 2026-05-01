"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { findFloorTable } from "@/lib/table-layout";
import { addMealLine, decrementMealLine } from "@/lib/meal-draft";
import {
  getDraftOrderForTable,
  ordersForTable,
  tableHasKitchenWorkload,
} from "@/lib/table-selection";
import { transitionCookingOrder } from "@/lib/kitchen";
import { tableTabTotalCents, tabOrdersForTable } from "@/lib/tab-totals";
import type { OrderRow, PaymentMethod, TableSessionRow } from "@/lib/types";
import {
  deleteOrdersForTable,
  deleteSession,
  loadPosState,
  putOrder,
  resetAllPosData,
  upsertSession,
} from "@/lib/db";
import { timestamp } from "@/lib/time";

export type UsePosWorkspaceOptions = {
  /**
   * Kitchen timer polling interval. Use `false` in tests to avoid background
   * timers touching IndexedDB.
   */
  kitchenPollIntervalMs?: number | false;
};

export function usePosWorkspace(options: UsePosWorkspaceOptions = {}) {
  const { kitchenPollIntervalMs = 1000 } = options;

  const [sessions, setSessions] = useState<Record<string, TableSessionRow>>({});
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(() => timestamp());
  const [hydrated, setHydrated] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  const refresh = useCallback(async () => {
    const data = await loadPosState();
    setSessions(Object.fromEntries(data.sessions.map((s) => [s.tableId, s])));
    setOrders(data.orders);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await refresh();
      if (!cancelled) setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  useEffect(() => {
    if (kitchenPollIntervalMs === false) return undefined;

    const id = window.setInterval(() => {
      const now = timestamp();
      setNowMs(now);
      void (async () => {
        const latest = await loadPosState();
        let wrote = false;
        for (const order of latest.orders) {
          const advanced = transitionCookingOrder(order, now);
          if (advanced !== order) {
            await putOrder(advanced);
            wrote = true;
          }
        }
        if (wrote) await refresh();
      })();
    }, kitchenPollIntervalMs);
    return () => window.clearInterval(id);
  }, [refresh, kitchenPollIntervalMs]);

  const kitchenOrders = useMemo(
    () => orders.filter((o) => o.status === "cooking" || o.status === "ready"),
    [orders],
  );

  const selectedMeta = selectedTableId
    ? findFloorTable(selectedTableId)
    : undefined;
  const session = selectedTableId ? sessions[selectedTableId] : undefined;
  const draft = selectedTableId
    ? getDraftOrderForTable(orders, selectedTableId)
    : undefined;
  const selectedOrders = selectedTableId
    ? ordersForTable(orders, selectedTableId)
    : [];
  const tabTotal =
    selectedTableId !== null
      ? tableTabTotalCents(orders, selectedTableId)
      : 0;

  async function handleSelectTable(tableId: string) {
    setSelectedTableId(tableId);
  }

  async function handleEnsureSession(tableId: string) {
    if (sessions[tableId]) return;
    const row: TableSessionRow = {
      tableId,
      occupiedSince: timestamp(),
    };
    await upsertSession(row);
    await refresh();
  }

  async function handleAddMeal(mealId: string) {
    if (!selectedTableId) return;
    await handleEnsureSession(selectedTableId);
    const latest = await loadPosState();
    let draftOrder = getDraftOrderForTable(latest.orders, selectedTableId);
    if (!draftOrder) {
      draftOrder = {
        id: crypto.randomUUID(),
        tableId: selectedTableId,
        lines: [],
        status: "draft",
        createdAt: timestamp(),
      };
      await putOrder(draftOrder);
    }
    const nextLines = addMealLine(draftOrder.lines, mealId);
    await putOrder({ ...draftOrder, lines: nextLines });
    await refresh();
  }

  async function handleDecrementMeal(mealId: string) {
    if (!draft) return;
    const nextLines = decrementMealLine(draft.lines, mealId);
    await putOrder({ ...draft, lines: nextLines });
    await refresh();
  }

  async function handleSubmitOrder() {
    if (!selectedTableId || !draft || draft.lines.length === 0) return;
    const now = timestamp();
    await putOrder({
      ...draft,
      status: "cooking",
      submittedAt: now,
      cookingStartedAt: now,
    });
    await refresh();
  }

  async function handleMarkDelivered(order: OrderRow) {
    await putOrder({
      ...order,
      status: "delivered",
      deliveredAt: timestamp(),
    });
    await refresh();
  }

  async function handlePay(method: PaymentMethod) {
    if (!selectedTableId) return;
    await deleteSession(selectedTableId);
    await deleteOrdersForTable(selectedTableId);
    await refresh();
    setPayOpen(false);
    setTicketOpen(false);
    setSelectedTableId(null);
    void method;
  }

  async function handleResetDemo() {
    await resetAllPosData();
    await refresh();
    setSelectedTableId(null);
    setPayOpen(false);
    setTicketOpen(false);
  }

  return {
    sessions,
    orders,
    selectedTableId,
    nowMs,
    hydrated,
    ticketOpen,
    payOpen,
    setTicketOpen,
    setPayOpen,
    kitchenOrders,
    selectedMeta,
    session,
    draft,
    selectedOrders,
    tabTotal,
    tabReceiptOrders:
      selectedTableId !== null
        ? tabOrdersForTable(orders, selectedTableId)
        : [],
    tableHasKitchenWorkload:
      selectedTableId !== null &&
      tableHasKitchenWorkload(orders, selectedTableId),
    handleSelectTable,
    handleAddMeal,
    handleDecrementMeal,
    handleSubmitOrder,
    handleMarkDelivered,
    handlePay,
    handleResetDemo,
  };
}
