import { defaultComparator } from "sorted-btree";
import { Table, ThunderKey } from "../../core";
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

  const primaryKeyProperty = table[ThunderKey].options.primary;

  if (limit.from !== undefined) {
    while (defaultComparator(items[0][primaryKeyProperty] as string | number, limit.from as string | number) < 0) {
      items.shift();
    }
  }

  if (limit.skip !== undefined) {
    for (let i = 0; i < limit.skip; i++) {
      items.shift();
    }
  }

  if (limit.take !== undefined) {
    while (items.length > limit.take) {
      items.pop();
    }
  }

  return items;
}