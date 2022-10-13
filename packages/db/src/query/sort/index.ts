import { defaultComparator } from "sorted-btree";
import { Filter, Sort, ValidSortKeyType } from "../types";

/**
 * @returns all items from `items` sorted according to the given `sort` object.
 */
export function sortItems<T>(items: T[], sort: Sort<T>): T[] {
  items.sort((a, b) => {
    const aKey = a[sort.key] as unknown as ValidSortKeyType;
    const bKey = b[sort.key] as unknown as ValidSortKeyType;
    return sort.order === "asc"
      ? defaultComparator(aKey, bKey)
      : defaultComparator(bKey, aKey);
  });
  return items;
}
