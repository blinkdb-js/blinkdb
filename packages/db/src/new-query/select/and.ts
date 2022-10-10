import { Table } from "../../core";
import { analyzeOr } from "../analyze/or";
import { analyzeWhere } from "../analyze/where";
import { And, Or, Where } from "../types";
import { selectForOr } from "./or";
import { SelectCallback, SelectResult } from "./types";
import { selectForWhere } from "./where";

/**
 * Select all items for `filter`.
 *
 * @returns the selected items from the database, or `null` in case a full table scan is required.
 */
export function selectForAnd<T, P extends keyof T>(
  table: Table<T, P>,
  and: And<T>,
  cb: SelectCallback<T>
): SelectResult<T> {
  if (and.$and.length === 0) {
    return { fullTableScan: false };
  }

  let minComplexity = Number.MAX_SAFE_INTEGER;
  let bestFilter!: Where<T> | Or<T>;

  for (const filter of and.$and) {
    const complexity =
      "$or" in filter ? analyzeOr(table, filter) : analyzeWhere(table, filter);
    if (complexity < minComplexity) {
      minComplexity = complexity;
      bestFilter = filter;
    }
  }

  return "$or" in bestFilter
    ? selectForOr(table, bestFilter, cb)
    : selectForWhere(table, bestFilter, cb);
}
