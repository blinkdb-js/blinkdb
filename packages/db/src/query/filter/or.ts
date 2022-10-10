import { Or } from "../types";
import { matchesAnd } from "./and";
import { matchesWhere } from "./where";

/**
 * @returns whether the given `item` matches `or`.
 */
export function matchesOr<T>(item: T, or: Or<T>): boolean {
  if (or.$or.length === 0) return true;

  for (const childFilter of or.$or) {
    const matches =
      "$and" in childFilter
        ? matchesAnd(item, childFilter)
        : matchesWhere(item, childFilter);
    if (matches) {
      return true;
    }
  }
  return false;
}
