import { Or } from "../types";
import { matchesAnd } from "./and";
import { matchesWhere } from "./where";

/**
 * @returns whether the given `item` matches `or`.
 */
export function matchesOr<T>(item: T, or: Or<T>): boolean {
  if (or.OR.length === 0) return true;

  for (const childFilter of or.OR) {
    const matches =
      "AND" in childFilter
        ? matchesAnd(item, childFilter)
        : matchesWhere(item, childFilter);
    if (matches) {
      return true;
    }
  }
  return false;
}
