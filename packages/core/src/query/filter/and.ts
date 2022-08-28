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

  if (filter.$and.length === 1) {
    const childFilter = filter.$and[0];
    return "$or" in childFilter
      ? filterOrItems(table, items, childFilter)
      : filterWhereItems(items, childFilter);
  }

  const primaryKeyProperty = table[SyncKey].options.primary;

  // Fill array with items of first filter
  const firstChildFilter = filter.$and[0];
  const filterItems =
    "$or" in firstChildFilter
      ? filterOrItems(table, items, firstChildFilter)
      : filterWhereItems(items, firstChildFilter);

  // Iterate over all items from the other filters and delete from map
  for (let childFilter of filter.$and.slice(1)) {
    let childFilterItems =
      "$or" in childFilter
        ? filterOrItems(table, items, childFilter)
        : filterWhereItems(items, childFilter);

    if (childFilterItems.length === 0) {
      return [];
    }

    let itemsMap: Map<string, T> = new Map(childFilterItems.map(item => {
      const primaryKey = String(item[primaryKeyProperty]);
      return [primaryKey, item];
    }));

    for (let [index, item] of Array.from(filterItems.entries())) {
      const primaryKey = String(item[primaryKeyProperty]);
      if(!itemsMap.has(primaryKey)) {
        filterItems.splice(index, 1);
      }
    }
  }

  return filterItems;
}
