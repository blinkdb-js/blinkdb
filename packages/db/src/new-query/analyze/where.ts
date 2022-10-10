import BTree from "sorted-btree";
import { BlinkKey, Table } from "../../core";
import { Where } from "../types";
import { analyzeMatcher } from "./matchers";

export function analyzeWhere<T, P extends keyof T>(
  table: Table<T, P>,
  where: Where<T>
): number {
  if (Object.keys(where).length === 0) return 0;

  let primaryKeyProperty = table[BlinkKey].options.primary;
  let minComplexity = Number.MAX_SAFE_INTEGER;

  for (const key in where) {
    const matcher = where[key];
    let btree: BTree<T[keyof T], T[]> | undefined;
    if ((key as string) === primaryKeyProperty) {
      btree = table[BlinkKey].storage.primary as any;
    } else {
      btree = table[BlinkKey].storage.indexes[key];
    }
    if (btree) {
      const complexity = analyzeMatcher(btree, matcher as any);
      if (complexity < minComplexity) {
        minComplexity = complexity;
      }
    }
  }

  return minComplexity;
}
