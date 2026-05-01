import { getMealById } from "@/lib/meals";
import { businessDayKeyLocal } from "@/lib/time";
import type {
  DayReceiptLineSnapshot,
  DayReceiptRow,
  OrderRow,
  PaymentMethod,
} from "@/lib/types";

export function sortReceiptsNewestFirst(rows: DayReceiptRow[]): DayReceiptRow[] {
  return [...rows].sort((a, b) => b.paidAt - a.paidAt);
}

/** Snapshot of non-draft tab orders at close-out time (before DB deletes). */
export function buildDayReceiptFromClosedTab(
  paidAt: number,
  tableId: string,
  tableLabel: string,
  paymentMethod: PaymentMethod,
  tabOrders: OrderRow[],
): DayReceiptRow {
  const lines: DayReceiptLineSnapshot[] = [];
  let totalCents = 0;

  for (const order of tabOrders) {
    for (const line of order.lines) {
      const meal = getMealById(line.mealId);
      const unit = meal?.priceCents ?? 0;
      const lineTotalCents = unit * line.quantity;
      totalCents += lineTotalCents;
      lines.push({
        mealId: line.mealId,
        mealName: meal?.name ?? line.mealId,
        quantity: line.quantity,
        lineTotalCents,
      });
    }
  }

  return {
    id: crypto.randomUUID(),
    paidAt,
    businessDayKey: businessDayKeyLocal(paidAt),
    tableId,
    tableLabel,
    totalCents,
    paymentMethod,
    lines,
  };
}
