import { Where } from "../types";
import { matches } from "./matchers";

/**
 * @returns whether the given `item` matches all matchers in `where`.
 */
export function matchesWhere<T>(item: T, where: Where<T>): boolean {
  for (const property in where) {
    const matcher = where[property];
    if (matcher && !matches(item[property], matcher)) {
      return false;
    }
  }
  return true;
}
