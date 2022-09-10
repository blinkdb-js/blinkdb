import BTree from "sorted-btree";
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
  for (const index of Object.values<BTree>(table[BlinkKey].storage.indexes as any)) {
    index.clear();
  }
  table[BlinkKey].events.onClear.dispatch();
}
