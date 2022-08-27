import { SyncKey, SyncTable } from "../../core";
import { Matchers, WhereFilter } from "../types";
import { selectMatcherItems } from "./matchers";

/**
 * Select all items for `filter`.
 *
 * @returns the selected items from the database, or `null` in case a full table scan is required.
 */
export async function selectWhereFilterItems<T, P extends keyof T>(
  table: SyncTable<T, P>,
  filter: WhereFilter<T>
): Promise<T[]|null> {
  // No matchers in filter? We can return early
  if (Object.keys(filter).length === 0) {
    return [];
  }

  const primaryKeyProperty = table[SyncKey].options.primary;

  // Check primary key for items to select
  if (primaryKeyProperty in filter) {
    const btree = table[SyncKey].storage.primary;
    const matcher = filter[primaryKeyProperty] as Matchers<T[P]>;
    return selectMatcherItems(btree, matcher);
  }

  // Otherwise, we need a full table scan
  return null;
}
