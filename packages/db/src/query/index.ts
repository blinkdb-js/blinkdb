import { BlinkKey, Table } from "../core";
import { matches } from "./filter";
import { limitItems } from "./limit";
import { select } from "./select";
import { SelectResult } from "./select/types";
import { sortItems } from "./sort";
import { OrdProps, PrimaryKeyIndexable, PrimaryKeyProps, Query } from "./types";

/**
 * retrieve all items matching the given `filter`.
 */
export function get<T extends PrimaryKeyIndexable<T>, P extends PrimaryKeyProps<T>>(
  table: Table<T, P>,
  filter: Query<T, P>
): T[] {
  let skipFromStep = false;
  let items: T[] = [];
  let selectResult: SelectResult<T> | undefined;

  // Retrieve items
  if (filter.where) {
    selectResult = select(
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
        skipFromStep = true;
      }
      selectResult = {
        rowsScanned: [table[BlinkKey].options.primary],
        fullTableScan: false,
      };
    } else {
      items = table[BlinkKey].storage.primary.valuesArray();
      selectResult = {
        rowsScanned: [table[BlinkKey].options.primary],
        fullTableScan: false,
      };
    }
  }

  // Sort items
  if (filter.sort) {
    items = sortItems(table, items, filter.sort, selectResult);
  }

  // Limit items
  if (filter.limit) {
    items = limitItems(table, items, filter.limit, skipFromStep);
  }

  return items;
}
