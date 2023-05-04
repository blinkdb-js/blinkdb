import { Table } from "../../core";
import { analyzeOr } from "../analyze/or";
import { analyzeWhere } from "../analyze/where";
import { And, PrimaryKeyIndexable, PrimaryKeyProps } from "../types";
import { selectForOr } from "./or";
import { SelectCallback, SelectResult } from "./types";
import { selectForWhere } from "./where";

/**
 * Select all items for `filter`.
 *
 * @returns the selected items from the database, or `null` in case a full table scan is required.
 */
export function selectForAnd<
  T extends PrimaryKeyIndexable<T>,
  P extends PrimaryKeyProps<T>
>(table: Table<T, P>, and: And<T>, cb: SelectCallback<T>, from?: T[P]): SelectResult<T> {
  if (and.AND.length === 0) {
    return { fullTableScan: false };
  }

  let minComplexity = Number.MAX_SAFE_INTEGER;
  let bestFilter = and.AND[0];

  for (const filter of and.AND) {
    const complexity =
      "OR" in filter ? analyzeOr(table, filter, from) : analyzeWhere(table, filter, from);
    if (complexity < minComplexity) {
      minComplexity = complexity;
      bestFilter = filter;
    }
  }

  return "OR" in bestFilter
    ? selectForOr(table, bestFilter, cb, from)
    : selectForWhere(table, bestFilter, cb, from);
}
