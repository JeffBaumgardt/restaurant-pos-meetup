import type { OrderRow } from "./types";
import { KITCHEN_PREP_MS } from "./dwell-time";

export function cookingRemainingMs(order: OrderRow, now: number): number | null {
  if (order.status !== "cooking" || order.cookingStartedAt === undefined) {
    return null;
  }
  const elapsed = now - order.cookingStartedAt;
  return Math.max(0, KITCHEN_PREP_MS - elapsed);
}

export function shouldAdvanceCookingToReady(order: OrderRow, now: number): boolean {
  if (order.status !== "cooking" || order.cookingStartedAt === undefined) {
    return false;
  }
  return now - order.cookingStartedAt >= KITCHEN_PREP_MS;
}

export function transitionCookingOrder(order: OrderRow, now: number): OrderRow {
  if (!shouldAdvanceCookingToReady(order, now)) return order;
  return {
    ...order,
    status: "ready",
    readyAt: now,
  };
}
