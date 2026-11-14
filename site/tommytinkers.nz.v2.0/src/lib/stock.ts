// Works out what a customer sees for a product's availability.
// Kept free of database types so it can be unit tested on its own.

export type StockStatus = "made_to_order" | "in_stock" | "low_stock" | "out_of_stock";

export function stockStatus(
  stockMode: "TRACKED" | "MADE_TO_ORDER",
  stockOnHand: number | null,
  lowThreshold: number,
): StockStatus {
  // Made to order is printed after the order, so it can never sell out.
  if (stockMode === "MADE_TO_ORDER") return "made_to_order";
  const onHand = stockOnHand ?? 0;
  if (onHand <= 0) return "out_of_stock";
  // "Low" means at or under the threshold set in admin (default 3).
  if (onHand <= lowThreshold) return "low_stock";
  return "in_stock";
}

export const STOCK_LABEL: Record<StockStatus, string> = {
  made_to_order: "Made to order",
  in_stock: "In stock",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
};
