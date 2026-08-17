export const CATEGORIES = [
  "Breakfast",
  "Appetizer",
  "Soup",
  "Salad",
  "Main Dish",
  "Side Dish",
  "Bread",
  "Dessert",
  "Snack",
  "Drink",
  "Sauce & Condiment",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const DEFAULT_CATEGORY: Category = "Other";

export function isCategory(value: unknown): value is Category {
  return typeof value === "string" && (CATEGORIES as readonly string[]).includes(value);
}
