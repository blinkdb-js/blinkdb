import { BlinkKey, Table } from "../../core";
import { Entity, Ordinal, PrimaryKeyOf } from "../../types";
import { AllMatchers, Where } from "../types";
import { analyzeMatcher } from "./matchers";

export function analyzeWhere<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  where: Where<T>,
  from?: T[P]
): number {
  if (Object.keys(where).length === 0) return 0;

  let primaryKeyProperty = table[BlinkKey].options.primary;
  let minComplexity = Number.MAX_SAFE_INTEGER;

  for (const key in where) {
    const matcher = where[key];
    let complexity: number | undefined;
    if ((key as string) === primaryKeyProperty) {
      const btree = table[BlinkKey].storage.primary;
      complexity = analyzeMatcher(btree, matcher as AllMatchers<T[P]>, from);
    } else {
      const btree = table[BlinkKey].storage.indexes[key];
      if (btree) {
        const matcherComplexity = analyzeMatcher(
          btree,
          matcher as AllMatchers<T[typeof key] & Ordinal>
        );
        const itemsPerNode = btree.totalItemSize / btree.size;
        complexity = Math.round(matcherComplexity * itemsPerNode);
      }
    }
    if (complexity && complexity < minComplexity) {
      minComplexity = complexity;
    }
  }

  return minComplexity;
}
