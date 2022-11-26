import { Table } from "../../core";
import { And, Or, Where } from "../types";
import { analyzeAnd } from "./and";
import { analyzeOr } from "./or";
import { analyzeWhere } from "./where";

/**
 * @returns the theoretical complexity of a given filter.
 */
export function analyze<T, P extends keyof T>(
  table: Table<T, P>,
  filter: Where<T> | And<T> | Or<T>
): number {
  if ("AND" in filter) {
    return analyzeAnd(table, filter);
  } else if ("OR" in filter) {
    return analyzeOr(table, filter);
  } else {
    return analyzeWhere(table, filter);
  }
}
