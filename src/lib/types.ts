export type OrderStatus = "draft" | "cooking" | "ready" | "delivered";

export type PaymentMethod = "cash" | "card";

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
