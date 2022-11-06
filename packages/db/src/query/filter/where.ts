import { Where } from "../types";
import { matches } from "./matchers";

/**
 * @returns whether the given `item` matches all matchers in `where`.
 */
export function matchesWhere<T>(item: T, where: Where<T>): boolean {
  for (const property in where) {
    const matcher = where[property];
    if (
      matcher !== undefined &&
      matcher !== null &&
      !matches(item[property], matcher as any)
    ) {
      return false;
    }
  }
  return true;
}
