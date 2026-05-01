export type OrderStatus = "draft" | "cooking" | "ready" | "delivered";

export type PaymentMethod = "cash" | "card";

/** One saved line on a closed check (immutable snapshot for the day log). */
export interface DayReceiptLineSnapshot {
  mealId: string;
  mealName: string;
  quantity: number;
  lineTotalCents: number;
}

/** Closed check appended when a table pays (indexed by local business day). */
export interface DayReceiptRow {
  id: string;
  paidAt: number;
  /** Local calendar day key `YYYY-MM-DD` for filtering “today”. */
  businessDayKey: string;
  tableId: string;
  tableLabel: string;
  totalCents: number;
  paymentMethod: PaymentMethod;
  lines: DayReceiptLineSnapshot[];
}

export interface TableSessionRow {
  tableId: string;
  occupiedSince: number;
}

export interface OrderLine {
  mealId: string;
  quantity: number;
}

export interface OrderRow {
  id: string;
  tableId: string;
  lines: OrderLine[];
  status: OrderStatus;
  createdAt: number;
  submittedAt?: number;
  cookingStartedAt?: number;
  readyAt?: number;
  deliveredAt?: number;
}

export interface FloorTableDef {
  id: string;
  label: string;
  kind: "booth" | "table";
  /** Percent of canvas width */
  xPct: number;
  /** Percent of canvas height */
  yPct: number;
  wPct: number;
  hPct: number;
}
