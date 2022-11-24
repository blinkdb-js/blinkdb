import { Query } from "../query/types";
import { clone } from "./clone";
import { BlinkKey } from "./createDB";
import { Table } from "./createTable";
import { many } from "./many";

/**
 * Retrieves the first entity from `table`.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * // Retrieve the first user
 * const firstUser = await first(userTable);
 */
export async function first<T, P extends keyof T>(table: Table<T, P>): Promise<T | null>;

/**
 * Retrieves the first entity from `table` matching the given `filter`.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * // Retrieve the first user named 'Alice'
 * const firstUser = await first(userTable, { where: { name: "Alice" } });
 */
export async function first<T, P extends keyof T>(
  table: Table<T, P>,
  query: Query<T, P>
): Promise<T | null>;

export async function first<T, P extends keyof T>(
  table: Table<T, P>,
  query?: Query<T, P>
): Promise<T | null> {
  if (query === undefined) {
    const btree = table[BlinkKey].storage.primary;
    const minKey = btree.minKey();
    return minKey ? btree.get(minKey) ?? null : null;
  }

  const res = await many(table, query);
  const entity = table[BlinkKey].db[BlinkKey].options.clone ? clone(res[0]) : res[0];
  return entity ?? null;
}
