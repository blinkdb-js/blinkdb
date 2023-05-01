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

  items.sort(sortWithSortQuery(sort));
  return items;
}

/**
 * Returns a comparison function that can be used to sort a list according to a sort query.
 */
export function sortWithSortQuery<T>(sort: Sort<T>): (a: T, b: T) => number {
  return (a, b) => {
    const aKey = a[sort.key] as OrdProps;
    const bKey = b[sort.key] as OrdProps;
    return sort.order === "asc" ? compare(aKey, bKey) : compare(bKey, aKey);
  };
}

/**
 * Inserts `item` into `arr` which is assumed to be sorted with `sort`.
 */
export function insertIntoSortedList<T>(arr: T[], item: T, sort: Sort<T>): void {
  function insertInIndex(index: number) {
    arr.splice(index, 0, item);
  }
  function getSortedIndex() {
    let low = 0;
    let high = arr.length;

    while (low < high) {
      const mid = (low + high) >>> 1;
      if (sortWithSortQuery<T>(sort)(arr[mid], item) < 0) low = mid + 1;
      else high = mid;
    }
    return low;
  }
  insertInIndex(getSortedIndex());
}