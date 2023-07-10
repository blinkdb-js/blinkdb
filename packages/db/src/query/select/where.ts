import BTree from "sorted-btree";
import { BlinkKey, Table } from "../../core";
import { Entity, Ordinal, PrimaryKeyOf } from "../../types";
import { analyzeMatcher } from "../analyze/matchers";
import { AllMatchers, Where } from "../types";
import { selectForMatcher } from "./matchers";
import { SelectCallback, SelectResult } from "./types";

/**
 * Select all items for `filter`.
 *
 * @returns the selected items from the database, or `null` in case a full table scan is required.
 */
export function selectForWhere<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  filter: Where<T>,
  cb: SelectCallback<T>,
  from?: T[P]
): SelectResult<T> {
  // No matchers in filter? We can return early
  if (Object.keys(filter).length === 0) return { fullTableScan: false };

  const primaryKeyProperty = table[BlinkKey].options.primary;

  // Check for primary key index
  if (primaryKeyProperty in filter) {
    const btree = table[BlinkKey].storage.primary;
    const matcher = filter[primaryKeyProperty];
    selectForMatcher(btree, matcher as AllMatchers<T[P]>, cb, from);
    return { rowsScanned: [primaryKeyProperty], fullTableScan: false };
  }

  let minComplexity = Number.MAX_SAFE_INTEGER;
  let bestFilter: BestFilter<T> | undefined = undefined;

  // Analyze performance of other indexes and use the most performant one
  for (const property in table[BlinkKey].storage.indexes) {
    const btree = table[BlinkKey].storage.indexes[property]!;
    if (property in filter) {
      const matcher = filter[property] as AllMatchers<T[typeof property] & Ordinal>;
      const complexity = analyzeMatcher(btree, matcher);
      if (complexity < minComplexity) {
        minComplexity = complexity;
        bestFilter = { btree, matcher, property };
      }
    }
  }

  // If we have at least one filter, use it
  if (bestFilter) {
    selectForMatcher(bestFilter.btree, bestFilter.matcher, (items) => {
      for (const item of items) {
        cb(item);
      }
    });
    return {
      rowsScanned: [bestFilter.property],
      fullTableScan: false,
    };
  }

  // Otherwise, we need a full table scan
  table[BlinkKey].storage.primary.valuesArray().forEach((v) => cb(v));
  return { fullTableScan: true };
}

interface BestFilter<T, K extends keyof T = keyof T> {
  btree: BTree<T[K], T[]>;
  matcher: AllMatchers<T[K]>;
  property: K;
}
