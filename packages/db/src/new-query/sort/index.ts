import { defaultComparator } from "sorted-btree";
import { Filter, ValidSortKeyType } from "../types";

/**
 * @returns all items from `items` sorted according to the given `sort` object.
 */
export function sortItems<T, P extends keyof T>(
  items: T[],
  sort: NonNullable<Filter<T, P>["sort"]>
): T[] {
  items.sort((a, b) => {
    const aKey = a[sort.key] as unknown as ValidSortKeyType;
    const bKey = b[sort.key] as unknown as ValidSortKeyType;
    return sort.order === "asc"
      ? defaultComparator(aKey, bKey)
      : defaultComparator(bKey, aKey);
  });
  return items;
}
