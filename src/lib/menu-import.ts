/** Normalize Square / Excel export column names to our import shape */
export function pickImportField(
  row: Record<string, unknown>,
  keys: string[]
): string | undefined {
  for (const key of keys) {
    const val = row[key];
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      return String(val).trim();
    }
  }
  return undefined;
}

export const SQUARE_ITEM_NAME_KEYS = ["Item Name", "Name", "Item", "Product Name"];
export const SQUARE_CATEGORY_KEYS = [
  "Category",
  "Reporting Category",
  "Menu Category",
  "Department",
  "Subcategory",
];
export const SQUARE_PRICE_KEYS = [
  "Price",
  "Default Unit Price",
  "Unit Price",
  "Amount",
  "Default Price",
];
export const SQUARE_DESCRIPTION_KEYS = ["Description", "Item Description", "Details"];
