import { SyncKey } from "./createDB";
import { SyncTable } from "./createTable";

/**
 * Removes all entities from `table`.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * clear(userTable);
 */
export async function clear<T, P extends keyof T>(table: SyncTable<T, P>): Promise<void> {
  table[SyncKey].storage.primary.clear();
}
