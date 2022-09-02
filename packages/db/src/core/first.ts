import { Filter } from "../query/types";
import { clone } from "./clone";
import { SyncKey } from "./createDB";
import { many } from "./many";
import { SyncTable } from "./createTable";

/**
 * Retrieves the first entity from `table`.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * // Retrieve the first user
 * const firstUser = await first(userTable);
 */
export async function first<T, P extends keyof T>(
  table: SyncTable<T, P>
): Promise<T | null>;

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
  table: SyncTable<T, P>,
  filter: Filter<T>
): Promise<T | null>;

export async function first<T, P extends keyof T>(
  table: SyncTable<T, P>,
  filter?: Filter<T>
): Promise<T | null> {
  if (filter === undefined) {
    const btree = table[SyncKey].storage.primary;
    const minKey = btree.minKey();
    return minKey ? btree.get(minKey) ?? null : null;
  }

  const res = await many(table, filter);
  const entity = table[SyncKey].db[SyncKey].options.clone ? clone(res[0]) : res[0];
  return entity ?? null;
}
