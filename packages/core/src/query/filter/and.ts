import { SyncKey, SyncTable } from "../../core";
import { And, Matchers } from "../types";
import { matchesMatcher } from "./matchers";
import { filterOrItems } from "./or";
import { filterWhereItems } from "./where";

/**
 * @returns all items from `items` that match the given `filter`.
 */
export function filterAndItems<T, P extends keyof T>(
  table: SyncTable<T, P>,
  items: T[],
  filter: And<T>
): T[] {
  if (items.length === 0 || filter.$and.length === 0) {
    return [];
  }

  let itemsMap: Map<string, T> = new Map();

  for (let childFilter of filter.$and) {
    let childFilterItems =
      "$or" in childFilter
        ? filterOrItems(table, items, childFilter)
        : filterWhereItems(items, childFilter);

    if (childFilterItems.length === 0) {
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

  return Array.from(itemsMap.values());
}
