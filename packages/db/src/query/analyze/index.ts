import { Table } from "../../core";
import { And, Or, Where } from "../types";
import { analyzeAnd } from "./and";
import { analyzeOr } from "./or";
import { analyzeWhere } from "./where";

/**
 * @returns the theoretical complexity of a given filter.
 */
export function analyze<T extends object, P extends keyof T>(
  table: Table<T, P>,
  filter: Where<T> | And<T> | Or<T>,
  from?: T[P]
): number {
  if ("AND" in filter) {
    return analyzeAnd(table, filter, from);
  } else if ("OR" in filter) {
    return analyzeOr(table, filter, from);
  } else {
    return analyzeWhere(table, filter, from);
  }
}
