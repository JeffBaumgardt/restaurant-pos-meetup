import { getMealById } from "./meals";
import type { OrderRow } from "./types";

/** Everything except drafts counts toward the open check */
export function tabOrdersForTable(orders: OrderRow[], tableId: string): OrderRow[] {
  return orders.filter((o) => o.tableId === tableId && o.status !== "draft");
}

export function orderLinesSubtotalCents(order: OrderRow): number {
  let total = 0;
  for (const line of order.lines) {
    const meal = getMealById(line.mealId);
    if (!meal) continue;
    total += meal.priceCents * line.quantity;
  }
  return total;
}

export function tableTabTotalCents(orders: OrderRow[], tableId: string): number {
  return tabOrdersForTable(orders, tableId).reduce(
    (acc, o) => acc + orderLinesSubtotalCents(o),
    0,
  );
}
