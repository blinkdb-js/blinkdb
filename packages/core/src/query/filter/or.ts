import { SyncKey, SyncTable } from "../../core";
import { Or } from "../types";
import { filterAndItems } from "./and";
import { filterWhereItems } from "./where";

export function filterOrItems<T, P extends keyof T>(
  table: SyncTable<T, P>,
  items: T[],
  filter: Or<T>
): T[] {
  if (items.length === 0 || filter.$or.length === 0) {
    return [];
  }

  let itemsMap: Map<string, T> = new Map();

  for (let childFilter of filter.$or) {
    let childFilterItems =
      "$and" in childFilter
        ? filterAndItems(table, items, childFilter)
        : filterWhereItems(items, childFilter);

    for (let childItem of childFilterItems) {
      const primaryKeyProperty = table[SyncKey].options.primary;
      const primaryKey = String(childItem[primaryKeyProperty]);
      itemsMap.set(primaryKey, childItem);
    }
  }

  return Array.from(itemsMap.values());
}