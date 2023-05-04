import { BlinkKey, Table } from "../../core";
import { analyzeAnd } from "../analyze/and";
import { analyzeWhere } from "../analyze/where";
import { EntityWithPk, Or, PrimaryKeyProps } from "../types";
import { selectForAnd } from "./and";
import { SelectCallback, SelectResult } from "./types";
import { selectForWhere } from "./where";

/**
 * Select all items for `filter`.
 *
 * @returns the selected items from the database, or `null` in case a full table scan is required.
 */
export function selectForOr<T extends EntityWithPk<T>, P extends PrimaryKeyProps<T>>(
  table: Table<T, P>,
  or: Or<T>,
  cb: SelectCallback<T>,
  from?: T[P]
): SelectResult<T> {
  if (or.OR.length === 0) {
    return { fullTableScan: false };
  }

  // If any of the queries require a full table scan, do a full table scan
  for (const filter of or.OR) {
    const complexity =
      "AND" in filter
        ? analyzeAnd(table, filter, from)
        : analyzeWhere(table, filter, from);
    if (complexity === Number.MAX_SAFE_INTEGER) {
      table[BlinkKey].storage.primary.valuesArray().forEach((v) => cb(v));
      return { fullTableScan: true };
    }
  }

  // Otherwise, emit for every item once
  let itemsMap: Map<T[P], T> = new Map();
  const selectResult: SelectResult<T> = { rowsScanned: [], fullTableScan: false };
  for (const filter of or.OR) {
    const childCb: SelectCallback<T> = (item) => {
      const primaryKeyProperty = table[BlinkKey].options.primary;
      const primaryKey = item[primaryKeyProperty];
      itemsMap.set(primaryKey, item);
    };
    const result =
      "AND" in filter
        ? selectForAnd(table, filter, childCb, from)
        : selectForWhere(table, filter, childCb, from);
    if (result.rowsScanned) {
      selectResult.rowsScanned!.push(...result.rowsScanned);
    }
  }
  itemsMap.forEach((val) => cb(val));
  return selectResult;
}
