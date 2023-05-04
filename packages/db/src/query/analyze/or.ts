import { Table } from "../../core";
import { Or, PrimaryKeyIndexable, PrimaryKeyProps } from "../types";
import { analyzeAnd } from "./and";
import { analyzeWhere } from "./where";

export function analyzeOr<T extends PrimaryKeyIndexable<T>, P extends PrimaryKeyProps<T>>(
  table: Table<T, P>,
  or: Or<T>,
  from?: T[P]
): number {
  let complexity = 0;

  for (const key in or.OR) {
    const filter = or.OR[key];
    const filterComplexity =
      "AND" in filter
        ? analyzeAnd(table, filter, from)
        : analyzeWhere(table, filter, from);
    complexity += filterComplexity;
  }

  return complexity;
}
