import { BlinkKey, Table } from "../core";
import { matches } from "./filter";
import { limitItems } from "./limit";
import { select } from "./select";
import { sortItems } from "./sort";
import { Query } from "./types";

/**
 * retrieve all items matching the given `filter`.
 */
export function get<T extends object, P extends keyof T>(
  table: Table<T, P>,
  filter: Query<T, P>
): T[] {
  let items: T[] = [];

  if (filter.where) {
    // Retrieve items
    select(table, filter.where, (item) => {
      if (matches(item, filter.where!)) {
        items.push(item);
      }
    });
  } else {
    // Retrieve all items
    items = table[BlinkKey].storage.primary.valuesArray();
  }

  if (filter.sort) {
    // Sort items
    items = sortItems(items, filter.sort);
  }

  if (filter.limit) {
    // Limit items
    items = limitItems(table, items, filter.limit);
  }

  return items;
}
