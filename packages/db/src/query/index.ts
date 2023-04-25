import { BlinkKey, Table } from "../core";
import { matches } from "./filter";
import { limitItems } from "./limit";
import { select } from "./select";
import { sortItems } from "./sort";
import { OrdProps, Query } from "./types";

/**
 * retrieve all items matching the given `filter`.
 */
export function get<T extends object, P extends keyof T>(
  table: Table<T, P>,
  filter: Query<T, P>
): T[] {
  let items: T[] = [];

  // Retrieve items
  if (filter.where) {
    select(
      table,
      filter.where,
      (item) => {
        if (matches(item, filter.where!)) {
          items.push(item);
        }
      },
      filter.limit?.from
    );
  } else {
    const btree = table[BlinkKey].storage.primary;
    if (filter.limit?.from) {
      const maxKey = btree.maxKey();
      if (maxKey) {
        btree.forRange(filter.limit.from as T[P] & OrdProps, maxKey, true, (_, item) => {
          items.push(item);
        });
      }
    } else {
      items = table[BlinkKey].storage.primary.valuesArray();
    }
  }

  // Sort items
  if (filter.sort) {
    items = sortItems(items, filter.sort);
  }

  // Limit items
  if (filter.limit) {
    items = limitItems(table, items, filter.limit);
  }

  return items;
}
