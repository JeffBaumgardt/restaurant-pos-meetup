import type { OrderLine } from "./types";

export function addMealLine(lines: OrderLine[], mealId: string): OrderLine[] {
  const idx = lines.findIndex((l) => l.mealId === mealId);
  if (idx >= 0) {
    const next = [...lines];
    const prev = next[idx]!;
    next[idx] = { ...prev, quantity: prev.quantity + 1 };
    return next;
  }
  return [...lines, { mealId, quantity: 1 }];
}

export function decrementMealLine(lines: OrderLine[], mealId: string): OrderLine[] {
  const idx = lines.findIndex((l) => l.mealId === mealId);
  if (idx < 0) return lines;
  const prev = lines[idx]!;
  if (prev.quantity <= 1) {
    return lines.filter((_, i) => i !== idx);
  }
  const next = [...lines];
  next[idx] = { ...prev, quantity: prev.quantity - 1 };
  return next;
}

export function setMealQuantity(lines: OrderLine[], mealId: string, quantity: number): OrderLine[] {
  if (quantity <= 0) {
    return lines.filter((l) => l.mealId !== mealId);
  }
  const idx = lines.findIndex((l) => l.mealId === mealId);
  if (idx < 0) {
    return [...lines, { mealId, quantity }];
  }
  const next = [...lines];
  next[idx] = { mealId, quantity };
  return next;
}

export function countLines(lines: OrderLine[]): number {
  return lines.reduce((acc, l) => acc + l.quantity, 0);
}
