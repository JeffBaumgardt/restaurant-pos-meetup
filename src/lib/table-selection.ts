import type { OrderRow, TableSessionRow } from "./types";

export function isTableOccupied(
  sessions: Record<string, TableSessionRow>,
  tableId: string,
): boolean {
  return Boolean(sessions[tableId]);
}

export function getSessionForTable(
  sessions: Record<string, TableSessionRow>,
  tableId: string,
): TableSessionRow | undefined {
  return sessions[tableId];
}

export function ordersForTable(orders: OrderRow[], tableId: string): OrderRow[] {
  return orders.filter((o) => o.tableId === tableId);
}

export function getDraftOrderForTable(
  orders: OrderRow[],
  tableId: string,
): OrderRow | undefined {
  return orders.find((o) => o.tableId === tableId && o.status === "draft");
}

export function tableHasKitchenWorkload(orders: OrderRow[], tableId: string): boolean {
  return orders.some(
    (o) => o.tableId === tableId && (o.status === "cooking" || o.status === "ready"),
  );
}

/** Whether clicking a table should open the order composer */
export function canComposeOrder(session: TableSessionRow | undefined): boolean {
  return session !== undefined;
}
