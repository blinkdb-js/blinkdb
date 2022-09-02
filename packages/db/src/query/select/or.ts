import { SyncKey, SyncTable } from "../../core";
import { Or } from "../types";
import { selectAndFilterItems } from "./and";
import { selectWhereFilterItems } from "./where";

/**
 * Select all items for `filter`.
 *
 * @returns the selected items from the database, or `null` in case a full table scan is required.
 */
export async function selectOrFilterItems<T, P extends keyof T>(
  table: SyncTable<T, P>,
  filter: Or<T>
): Promise<T[] | null> {
  if (filter.$or.length === 0) {
    return [];
  }

  let itemsMap: Map<T[P], T> = new Map();

  for (let childFilter of filter.$or) {
    let childFilterItems =
      "$and" in childFilter
        ? await selectAndFilterItems(table, childFilter)
        : await selectWhereFilterItems(table, childFilter);

    if (childFilterItems === null) {
      return null;
    }

    for (let childItem of childFilterItems) {
      const primaryKeyProperty = table[SyncKey].options.primary;
      const primaryKey = childItem[primaryKeyProperty];
      itemsMap.set(primaryKey, childItem);
    }
  }

  return Array.from(itemsMap.values());
}
