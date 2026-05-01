import { describe, expect, it } from "vitest";
import {
  addMealLine,
  countLines,
  decrementMealLine,
  setMealQuantity,
} from "@/lib/meal-draft";

describe("meal draft mutations", () => {
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

  it("counts plated quantity totals", () => {
    expect(
      countLines([
        { mealId: "a", quantity: 2 },
        { mealId: "b", quantity: 3 },
      ]),
    ).toBe(5);
  });

  it("supports explicit quantity sets", () => {
    expect(setMealQuantity([], "meal-a", 0)).toHaveLength(0);
    expect(setMealQuantity([], "meal-a", 3)).toEqual([
      { mealId: "meal-a", quantity: 3 },
    ]);
  });
});
