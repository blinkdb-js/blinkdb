import { BlinkKey, Table } from "../../core";
import { compare } from "../compare";
import { SelectResult } from "../select/types";
import { OrdProps, Sort } from "../types";

/**
 * @returns all items from `items` sorted according to the given `sort` object.
 */
export function sortItems<T extends object, P extends keyof T>(
  table: Table<T, P>,
  items: T[],
  sort: Sort<T>,
  selectResult?: SelectResult<T>
): T[] {
  // In the event we want to sort by id and the select engine scanned only the id column, it's already sorted
  const primaryKey = table[BlinkKey].options.primary;
  if ((sort.key as keyof T) === primaryKey) {
    if (selectResult && !selectResult.fullTableScan) {
      const rowsScanned = selectResult.rowsScanned;
      if (rowsScanned && rowsScanned.length === 1 && rowsScanned[0] === primaryKey) {
        switch (sort.order) {
          case "asc":
            return items;
          case "desc":
            items.reverse();
            return items;
        }
      }
    }
  }

  items.sort((a, b) => {
    const aKey = a[sort.key] as OrdProps;
    const bKey = b[sort.key] as OrdProps;
    return sort.order === "asc" ? compare(aKey, bKey) : compare(bKey, aKey);
  });
  return items;
}
