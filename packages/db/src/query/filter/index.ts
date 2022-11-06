import { And, Or, Where } from "../types";
import { matchesAnd } from "./and";
import { matchesOr } from "./or";
import { matchesWhere } from "./where";

/**
 * @returns whether the given `item` matches the filter.
 */
export function matches<T>(item: T, filter: Where<T> | And<T> | Or<T>): boolean {
  if ("AND" in filter) {
    return matchesAnd(item, filter);
  } else if ("OR" in filter) {
    return matchesOr(item, filter);
  } else {
    return matchesWhere(item, filter);
  }
}
