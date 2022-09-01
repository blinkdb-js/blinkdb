import { SyncKey, SyncTable } from "../../core";
import { And } from "../types";
import { selectOrFilterItems } from "./or";
import { selectWhereFilterItems } from "./where";

/**
 * Select all items for `filter`.
 *
 * @returns the selected items from the database, or `null` in case a full table scan is required.
 */
export async function selectAndFilterItems<T, P extends keyof T>(
  table: SyncTable<T, P>,
  filter: And<T>
): Promise<T[] | null> {
  if (filter.$and.length === 0) {
    return [];
  }

  if (filter.$and.length === 1) {
    const childFilter = filter.$and[0];
    return "$or" in childFilter
      ? await selectOrFilterItems(table, childFilter)
      : await selectWhereFilterItems(table, childFilter);
  }

  const primaryKeyProperty = table[SyncKey].options.primary;
  let childFiltersWithFullTableScan = 0;

  // Fill array with items of first filter
  const firstChildFilter = filter.$and[0];
  let filterItems =
    "$or" in firstChildFilter
      ? await selectOrFilterItems(table, firstChildFilter)
      : await selectWhereFilterItems(table, firstChildFilter);

  if (!filterItems) {
    childFiltersWithFullTableScan++;
  }

  // Iterate over all items from the other filters and delete from map
  for (let childFilter of filter.$and.slice(1)) {
    let childFilterItems =
      "$or" in childFilter
        ? await selectOrFilterItems(table, childFilter)
        : await selectWhereFilterItems(table, childFilter);

    if (!childFilterItems) {
      childFiltersWithFullTableScan++;
      continue;
    }

    if(childFilterItems.length === 0) {
      return [];
    }

    if(!filterItems) {
      filterItems = childFilterItems;
      continue;
    }

    let itemsMap: Map<string, T> = new Map(
      childFilterItems.map((item) => {
        const primaryKey = String(item[primaryKeyProperty]);
        return [primaryKey, item];
      })
    );

    for (let [index, item] of Array.from(filterItems.entries())) {
      const primaryKey = String(item[primaryKeyProperty]);
      if (!itemsMap.has(primaryKey)) {
        filterItems.splice(index, 1);
      }
    }
  }

  return filterItems;
}
