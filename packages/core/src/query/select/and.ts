import { SyncKey, SyncTable } from "../../core";
import { And } from "../types";
import { selectOrFilterItems } from "./or";
import { selectWhereFilterItems } from "./where";

/**
 * Select all items for `filter`.
 *
 * @returns the selected items from the database, or `null` in case a full table scan is required.
 */
export async function selectAndFilterItems<T, P extends keyof T>(
  table: SyncTable<T, P>,
  filter: And<T>
): Promise<T[] | null> {
  if(filter.$and.length === 0) {
    return [];
  }

  let itemsMap: Map<string, T> = new Map();
  let childFiltersWithFullTableScan = 0;

  for (let childFilter of filter.$and) {
    let childFilterItems =
      "$or" in childFilter
        ? await selectOrFilterItems(table, childFilter)
        : await selectWhereFilterItems(table, childFilter);

    if (!childFilterItems) {
      childFiltersWithFullTableScan++;
      continue;
    }

    if(childFilterItems.length === 0) {
      return [];
    }

    const childItemsMap: Map<string, T> = new Map();

    for (let childItem of childFilterItems) {
      const primaryKeyProperty = table[SyncKey].options.primary;
      const primaryKey = String(childItem[primaryKeyProperty]);
      childItemsMap.set(primaryKey, childItem);
    }

    if (itemsMap.size === 0) {
      itemsMap = childItemsMap;
    } else {
      for (let key of Array.from(itemsMap.keys())) {
        if (!childItemsMap.has(key)) {
          itemsMap.delete(key);
        }
      }
    }
  }

  if (filter.$and.length === childFiltersWithFullTableScan) {
    return null;
  } else {
    return Array.from(itemsMap.values());
  }
}
