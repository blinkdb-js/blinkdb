import { ThunderKey } from "./createDB";
import { Table } from "./createTable";

/**
 * Removes all entities from `table`.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * clear(userTable);
 */
export async function clear<T, P extends keyof T>(table: Table<T, P>): Promise<void> {
  table[ThunderKey].storage.primary.clear();
  table[ThunderKey].events.onClear.dispatch();
}
