import { Filter } from "../query/types";
import { SyncKey } from "./createDB";
import { many } from "./many";
import { SyncTable } from "./table";

/**
 * Retrieves the first entity from `table`.
 * 
 * @example
 * const db = createDB();
 * const userTable = table<User>(db, "users")();
 * // Retrieve the first user
 * const firstUser = await first(userTable);
 */
export async function first<T, P extends keyof T>(table: SyncTable<T, P>): Promise<T|null>;

/**
 * Retrieves the first entity from `table` matching the given `filter`.
 * 
 * @example
 * const db = createDB();
 * const userTable = table<User>(db, "users")();
 * // Retrieve the first user named 'Alice'
 * const firstUser = await first(userTable, { where: { name: "Alice" } });
 */
 export async function first<T, P extends keyof T>(table: SyncTable<T, P>, filter: Filter<T>): Promise<T|null>;

export async function first<T, P extends keyof T>(table: SyncTable<T, P>, filter?: Filter<T>): Promise<T|null> {
  if(!filter) {
    const btree = table[SyncKey].storage.primary;
    const minKey = btree.minKey();
    console.log('MINKEY', minKey);
    return minKey ? btree.get(minKey) ?? null : null;
  }

  const res = await many(table, filter);
  return res[0] ?? null;
}

