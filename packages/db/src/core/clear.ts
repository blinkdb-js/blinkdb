import { BlinkKey } from "./createDB";
import { Table } from "./createTable";

/**
 * Removes all entities from `table`.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * await clear(userTable);
 */
export async function clear<T, P extends keyof T>(table: Table<T, P>): Promise<void> {
  table[BlinkKey].storage.primary.clear();
  for (const key in table[BlinkKey].storage.indexes) {
    table[BlinkKey].storage.indexes[key]!.clear();
  }
  table[BlinkKey].events.onClear.dispatch();
}
