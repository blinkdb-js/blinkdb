import { middleware } from "../events/Middleware";
import { get } from "../query";
import { analyze } from "../query/analyze";
import { Filter } from "../query/types";
import { BlinkKey } from "./createDB";
import { Table } from "./createTable";

/**
 * Returns the total number of items in the given `table`.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * // Count how many entities exist in userTable
 * const count = await count(userTable);
 */
export async function count<T extends object, P extends keyof T>(
  table: Table<T, P>
): Promise<number>;

/**
 * Returns the total number of items which match the `filter`.
 *
 * The performance of count depends on the filter used. If you
 * have a large table and prefer performance over accuracy,
 * use `{ exact: false }`.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * // Count how many 22-year-olds users exist
 * const count = await count(userTable, {
 *   where: {
 *     age: 22
 *   }
 * });
 */
export async function count<T extends object, P extends keyof T>(
  table: Table<T, P>,
  filter: Filter<T>,
  options?: { exact: boolean }
): Promise<number>;

export async function count<T extends object, P extends keyof T>(
  table: Table<T, P>,
  filter?: Filter<T>,
  options: { exact: boolean } = { exact: true }
): Promise<number> {
  return middleware(
    table,
    {
      action: "count",
      params: [table, filter, options],
    },
    () => internalCount(table, filter, options)
  );
}

export async function internalCount<T extends object, P extends keyof T>(
  table: Table<T, P>,
  filter?: Filter<T>,
  options: { exact: boolean } = { exact: true }
): Promise<number> {
  const totalSize = table[BlinkKey].storage.primary.size;
  if (!filter || !filter.where) {
    return totalSize;
  }
  if (options.exact) {
    return get(table, filter).length;
  } else {
    return Math.min(analyze(table, filter.where), totalSize);
  }
}
