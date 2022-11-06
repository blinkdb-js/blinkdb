import { compare } from "../compare";
import { OrdProps, Sort } from "../types";

/**
 * @returns all items from `items` sorted according to the given `sort` object.
 */
export function sortItems<T>(items: T[], sort: Sort<T>): T[] {
  items.sort((a, b) => {
    const aKey = a[sort.key] as OrdProps;
    const bKey = b[sort.key] as OrdProps;
    return sort.order === "asc" ? compare(aKey, bKey) : compare(bKey, aKey);
  });
  return items;
}
