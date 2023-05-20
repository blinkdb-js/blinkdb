import { BlinkKey, Table } from "../../core";
import { Entity, PrimaryKeyOf } from "../../types";
import { compare } from "../compare";
import { Limit } from "../types";

/**
 * @returns all items from `items` limited according to the given `limit` object.
 */
export function limitItems<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  items: T[],
  limit: Limit<T, P>,
  skipFromStep = false
): T[] {
  if (items.length === 0) {
    return [];
  }

  const primaryKeyProperty = table[BlinkKey].options.primary;
  let fromIndex = 0;
  let toIndex = items.length;

  if (!skipFromStep && limit.from !== undefined) {
    fromIndex = items.findIndex(
      (item) => compare(item[primaryKeyProperty], limit.from) >= 0
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
