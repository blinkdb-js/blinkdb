import { Table } from "../../core";
import { Entity, PrimaryKeyOf } from "../../types";
import { And } from "../types";
import { analyzeOr } from "./or";
import { analyzeWhere } from "./where";

export function analyzeAnd<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  and: And<T>,
  from?: T[P]
): number {
  let minComplexity = Number.MAX_SAFE_INTEGER;

  if (and.AND.length === 0) return 0;

  for (const key in and.AND) {
    const filter = and.AND[key];
    const filterComplexity =
      "OR" in filter ? analyzeOr(table, filter, from) : analyzeWhere(table, filter, from);
    if (filterComplexity < minComplexity) {
      minComplexity = filterComplexity;
    }
  }

  return minComplexity;
}
