/**
 * The callback that can be supplied to a `select` function.
 * It will be synchronously called for each item POSSIBLY matching the given filter.
 *
 * the callback provider can return { cancel: true } to stop selecting values.
 */
export type SelectCallback<T> = (item: T) => void | { cancel: true };

/**
 * Data concerning a successful select operation, and how the data was obtained.
 */
export interface SelectResult<T> {
  /** The row where items where selected from. */
  rowScanned?: keyof T;
  /** If true, a full table scan was performed. */
  fullTableScan: boolean;
}
