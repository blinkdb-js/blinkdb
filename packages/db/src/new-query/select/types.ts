/**
 * The callback that can be supplied to a `select` function.
 * It will be synchronously called for each item POSSIBLY matching the given filter.
 * 
 * the callback provider can return { cancel: true } to stop selecting values.
 */
export type SelectCallback<T> = (item: T) => void | { cancel: true };