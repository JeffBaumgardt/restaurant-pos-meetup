export interface MealDef {
  id: string;
  name: string;
  priceCents: number;
}

/** Five placeholder meals for the meetup demo */
export const MENU_MEALS: MealDef[] = [
  { id: "meal-burger", name: "Classic Burger", priceCents: 1200 },
  { id: "meal-salad", name: "Caesar Salad", priceCents: 900 },
  { id: "meal-pizza", name: "Margherita Pizza", priceCents: 1400 },
  { id: "meal-salmon", name: "Grilled Salmon", priceCents: 1800 },
  { id: "meal-pasta", name: "Pasta Carbonara", priceCents: 1300 },
];

const mealMap = new Map(MENU_MEALS.map((m) => [m.id, m]));

export function getMealById(mealId: string): MealDef | undefined {
  return mealMap.get(mealId);
}
