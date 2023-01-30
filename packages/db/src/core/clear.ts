import { executeTableHooks } from "../events/Middleware";
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
export async function clear<T extends object, P extends keyof T>(
  table: Table<T, P>
): Promise<void> {
  return executeTableHooks<T, P, "clear">(
    table,
    { action: "clear", params: [table] },
    () => internalClear(table)
  );
}

export async function internalClear<T extends object, P extends keyof T>(
  table: Table<T, P>
): Promise<void> {
  table[BlinkKey].storage.primary.clear();
  for (const key in table[BlinkKey].storage.indexes) {
    const btree = table[BlinkKey].storage.indexes[key]!;
    btree.clear();
    btree.totalItemSize = 0;
  }
  table[BlinkKey].events.onClear.dispatch();
}
