import { BlinkKey, Table } from "../../core";
import { Where } from "../types";
import { selectForMatcher } from "./matchers";
import { SelectCallback, SelectResult } from "./types";

/**
 * Select all items for `filter`.
 *
 * @returns the selected items from the database, or `null` in case a full table scan is required.
 */
export function selectForWhere<T, P extends keyof T>(
  table: Table<T, P>,
  filter: Where<T>,
  cb: SelectCallback<T>
): SelectResult<T> {
  // No matchers in filter? We can return early
  if (Object.keys(filter).length === 0) return { fullTableScan: false };

  const primaryKeyProperty = table[BlinkKey].options.primary;

  // Check primary key for items to select
  // TODO: Instead of first checking for the primary key, use either
  // the column specified in `sort` or use the best one as determined bv
  // analyzing
  if (primaryKeyProperty in filter) {
    const btree = table[BlinkKey].storage.primary;
    const matcher = filter[primaryKeyProperty]!;
    selectForMatcher(btree, matcher, cb);
    return { rowScanned: primaryKeyProperty, fullTableScan: false };
  }

  // Check if any other index is available to select
  for (const property in table[BlinkKey].storage.indexes) {
    const btree = table[BlinkKey].storage.indexes[property]!;
    if (property in filter) {
      const matcher = filter[property]!;
      selectForMatcher(btree, matcher, (items) => {
        for (const item of items) {
          cb(item);
        }
      });
      return {
        rowScanned: property,
        fullTableScan: false,
      };
    }
  }

  // Otherwise, we need a full table scan
  table[BlinkKey].storage.primary.valuesArray().forEach((v) => cb(v));
  return { fullTableScan: true };
}
