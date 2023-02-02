import { Table } from "../../core";
import { Or } from "../types";
import { analyzeAnd } from "./and";
import { analyzeWhere } from "./where";

export function analyzeOr<T extends object, P extends keyof T>(
  table: Table<T, P>,
  or: Or<T>
): number {
  let complexity = 0;

  for (const key in or.OR) {
    const filter = or.OR[key];
    const filterComplexity =
      "AND" in filter ? analyzeAnd(table, filter) : analyzeWhere(table, filter);
    complexity += filterComplexity;
  }

  return complexity;
}
