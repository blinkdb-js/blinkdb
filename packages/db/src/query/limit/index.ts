import { Table } from "../../core";
import { Limit } from "../types";

/**
 * @returns all items from `items` limited according to the given `limit` object.
 */
export function limitItems<T extends object, P extends keyof T>(
  table: Table<T, P>,
  items: T[],
  limit: Limit<T, P>
): T[] {
  if (items.length === 0) {
    return [];
  }

  let fromIndex = 0;
  let toIndex = items.length;

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
