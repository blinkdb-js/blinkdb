import { Table } from "../../core";
import { And } from "../types";
import { analyzeOr } from "./or";
import { analyzeWhere } from "./where";

export function analyzeAnd<T, P extends keyof T>(
  table: Table<T, P>,
  and: And<T>
): number {
  let minComplexity = Number.MAX_SAFE_INTEGER;

  if (and.AND.length === 0) return 0;

  for (const key in and.AND) {
    const filter = and.AND[key];
    const filterComplexity =
      "OR" in filter ? analyzeOr(table, filter) : analyzeWhere(table, filter);
    if (filterComplexity < minComplexity) {
      minComplexity = filterComplexity;
    }
  }

  return minComplexity;
}
