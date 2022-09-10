import BTree from "sorted-btree";
import { BlinkKey, Table } from "../../core";
import { Matchers, Where } from "../types";
import { selectMatcherItems } from "./matchers";

/**
 * Select all items for `filter`.
 *
 * @returns the selected items from the database, or `null` in case a full table scan is required.
 */
export async function selectWhereFilterItems<T, P extends keyof T>(
  table: Table<T, P>,
  filter: Where<T>
): Promise<T[] | null> {
  // No matchers in filter? We can return early
  if (Object.keys(filter).length === 0) {
    return [];
  }

  const primaryKeyProperty = table[BlinkKey].options.primary;

  // Check primary key for items to select
  if (primaryKeyProperty in filter) {
    const btree = table[BlinkKey].storage.primary;
    const matcher = filter[primaryKeyProperty] as Matchers<T[P]>;
    return selectMatcherItems(btree, matcher);
  }

  // Check if any other index is available to select
  for (const [property, btree] of Object.entries<BTree<any, T[]>>(
    table[BlinkKey].storage.indexes
  )) {
    if (property in filter) {
      const matcher = filter[property as keyof T] as any;
      const items = await selectMatcherItems(btree, matcher);
      return items !== null ? items.flat(1) : null;
    }
  }

  // Otherwise, we need a full table scan
  return null;
}
