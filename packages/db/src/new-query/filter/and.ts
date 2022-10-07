import { And } from "../types";
import { matchesOr } from "./or";
import { matchesWhere } from "./where";

/**
 * @returns whether the given `item` matches `and`.
 */
export function matchesAnd<T>(item: T, and: And<T>): boolean {
  for (const childFilter of and.$and) {
    const matches =
      "$or" in childFilter
        ? matchesOr(item, childFilter)
        : matchesWhere(item, childFilter);
    if (!matches) {
      return false;
    }
  }
  return true;
}
