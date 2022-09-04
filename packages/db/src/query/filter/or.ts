import { Table } from "../../core";
import { And, Or, Where } from "../types";
import { filterAndItems } from "./and";
import { filterWhereItems } from "./where";

export function filterOrItems<T, P extends keyof T>(
  table: Table<T, P>,
  items: T[],
  filter: Or<T>
): T[] {
  if (items.length === 0 || filter.$or.length === 0) {
    return [];
  }

  if (filter.$or.length === 1) {
    const childFilter = filter.$or[0];
    return "$and" in childFilter
      ? filterAndItems(table, items, childFilter)
      : filterWhereItems(items, childFilter);
  }

  const returnItems: T[] = [];

  for (let item of items) {
    const itemInFilter = (childFilter: Where<T> | And<T>) => {
      const resultItems =
        "$and" in childFilter
          ? filterAndItems(table, [item], childFilter)
          : filterWhereItems([item], childFilter);
      return resultItems.length > 0;
    };
    if (filter.$or.some(itemInFilter)) {
      returnItems.push(item);
    } else {
      continue;
    }
  }

  return returnItems;
}
