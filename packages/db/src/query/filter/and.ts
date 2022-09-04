import { Table } from "../../core";
import { And, Or, Where } from "../types";
import { filterOrItems } from "./or";
import { filterWhereItems } from "./where";

/**
 * @returns all items from `items` that match the given `filter`.
 */
export function filterAndItems<T, P extends keyof T>(
  table: Table<T, P>,
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

  const returnItems: T[] = [];

  for (let item of items) {
    const itemNotInFilter = (childFilter: Where<T> | Or<T>) => {
      const resultItems =
        "$or" in childFilter
          ? filterOrItems(table, [item], childFilter)
          : filterWhereItems([item], childFilter);
      return resultItems.length === 0;
    };
    if (filter.$and.some(itemNotInFilter)) {
      continue;
    } else {
      returnItems.push(item);
    }
  }

  return returnItems;
}
