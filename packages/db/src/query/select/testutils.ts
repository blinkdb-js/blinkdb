import { SelectCallback } from "./types";

/**
 * Collects the items returned from a select function.
 */
export function collect<T>(select: (fn: SelectCallback<T>) => void): T[] {
  const items: T[] = [];
  const fn: SelectCallback<T> = (i) => {
    items.push(i);
  };
  select(fn);
  return items;
}
