import { Matchers, WhereFilter } from "../types";
import { matchesMatcher } from "./matchers";

/**
 * @returns all items from `items` that match the given `filter`.
 */
export function filterWhereItems<T>(
  items: T[],
  filter: WhereFilter<T>
): T[] {
  if (items.length === 0) {
    return [];
  }

  return items.filter((item) => {
    for (const property in filter) {
      if (
        !matchesMatcher(
          item[property],
          filter[property] as Matchers<T[typeof property]>
        )
      ) {
        return false;
      }
    }
    return true;
  });
}
