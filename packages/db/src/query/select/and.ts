import { BlinkKey, Table } from "../../core";
import { analyzeOr } from "../analyze/or";
import { analyzeWhere } from "../analyze/where";
import { And, Or, Where } from "../types";
import { selectOrFilterItems } from "./or";
import { selectWhereFilterItems } from "./where";

/**
 * Select all items for `filter`.
 *
 * @returns the selected items from the database, or `null` in case a full table scan is required.
 */
export async function selectAndFilterItems<T, P extends keyof T>(
  table: Table<T, P>,
  and: And<T>
): Promise<T[] | null> {
  if (and.$and.length === 0) {
    return [];
  }

  let minComplexity = Number.MAX_SAFE_INTEGER;
  let bestFilter!: Where<T> | Or<T>;

  for (const key in and.$and) {
    const filter = and.$and[key];
    const complexity =
      "$or" in filter ? analyzeOr(table, filter) : analyzeWhere(table, filter);
    if (complexity < minComplexity) {
      minComplexity = complexity;
      bestFilter = filter;
    }
  }

  return "$or" in bestFilter
    ? await selectOrFilterItems(table, bestFilter)
    : await selectWhereFilterItems(table, bestFilter);
}
