import { describe, expect, it } from "vitest";
import {
  addMealLine,
  countLines,
  decrementMealLine,
  setMealQuantity,
} from "@/lib/meal-draft";

describe("meal draft mutations", () => {
  /**
   * Adding the same dish again should bump the quantity; adding a different dish should appear as a separate line on the in-progress order.
   */
  it("adds new meals or increments quantities", () => {
    let lines = addMealLine([], "meal-a");
    expect(lines).toEqual([{ mealId: "meal-a", quantity: 1 }]);

    lines = addMealLine(lines, "meal-a");
    expect(lines).toEqual([{ mealId: "meal-a", quantity: 2 }]);

    lines = addMealLine(lines, "meal-b");
    expect(lines).toEqual([
      { mealId: "meal-a", quantity: 2 },
      { mealId: "meal-b", quantity: 1 },
    ]);
  });

  /**
   * Servers often remove one plate at a time; dropping the last plate should remove that dish line entirely so the ticket stays tidy.
   */
  it("decrements quantities or removes meals entirely", () => {
    let lines = [
      { mealId: "meal-a", quantity: 2 },
      { mealId: "meal-b", quantity: 1 },
    ];
    lines = decrementMealLine(lines, "meal-a");
    expect(lines.find((l) => l.mealId === "meal-a")?.quantity).toBe(1);

    lines = decrementMealLine(lines, "meal-b");
    expect(lines.some((l) => l.mealId === "meal-b")).toBe(false);
  });

  /**
   * The UI sometimes shows “how many plates total” across every line item before an order is sent.
   */
  it("counts plated quantity totals", () => {
    expect(
      countLines([
        { mealId: "a", quantity: 2 },
        { mealId: "b", quantity: 3 },
      ]),
    ).toBe(5);
  });

  /**
   * Quantity boxes should support typing an exact number, including clearing the dish entirely when the quantity goes to zero.
   */
  it("supports explicit quantity sets", () => {
    expect(setMealQuantity([], "meal-a", 0)).toHaveLength(0);
    expect(setMealQuantity([], "meal-a", 3)).toEqual([
      { mealId: "meal-a", quantity: 3 },
    ]);
  });
});
