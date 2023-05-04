import { defaultComparator } from "sorted-btree";

import { Ordinal } from "../types";

export function compare<T extends Ordinal>(a: T, b: T) {
  if (typeof a === "bigint" && typeof b === "bigint") {
    return a - b;
  }
  return defaultComparator(a as Exclude<T, BigInt>, b as Exclude<T, BigInt>);
}

export function getBiggerKey<T extends Ordinal>(a: T, b: T) {
  return compare(a, b) >= 0 ? a : b;
}
