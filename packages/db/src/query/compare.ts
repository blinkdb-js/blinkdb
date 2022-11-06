import { defaultComparator } from "sorted-btree";
import { OrdProps } from "./types";

export function compare<T extends OrdProps>(a: T, b: T) {
  if (typeof a === "bigint" && typeof b === "bigint") {
    return a - b;
  }
  return defaultComparator(a as Exclude<T, BigInt>, b as Exclude<T, BigInt>);
}
