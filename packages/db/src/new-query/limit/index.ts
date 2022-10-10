import { defaultComparator } from "sorted-btree";
import { Table, BlinkKey } from "../../core";
import { Filter } from "../types";

/**
 * @returns all items from `items` limited according to the given `limit` object.
 */
export function limitItems<T, P extends keyof T>(
  table: Table<T, P>,
  items: T[],
  limit: NonNullable<Filter<T, P>["limit"]>
): T[] {
  if (items.length === 0) {
    return [];
  }

  const primaryKeyProperty = table[BlinkKey].options.primary;
  let fromIndex = 0;
  let toIndex = items.length;

  if (limit.from !== undefined) {
    fromIndex = items.findIndex(
      (item) =>
        defaultComparator(
          item[primaryKeyProperty] as unknown as string | number,
          limit.from as unknown as string | number
        ) >= 0
    );
  }

  if (limit.skip !== undefined) {
    fromIndex += limit.skip;
  }

  if (limit.take !== undefined) {
    toIndex = Math.min(fromIndex + limit.take, toIndex);
  }

  if (fromIndex === 0 && toIndex === items.length) {
    return items;
  }

  return items.slice(fromIndex, toIndex);
}
