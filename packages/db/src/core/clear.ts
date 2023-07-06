import { middleware } from "../events/Middleware";
import { Entity, PrimaryKeyOf } from "../types";
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
export function clear<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>
): Promise<void> {
  return Promise.resolve(
    middleware<T, P, "clear">(table, { action: "clear", params: [table] }, (table) =>
      internalClear(table)
    )
  );
}

export function internalClear<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>
): Promise<void> {
  table[BlinkKey].storage.primary.clear();
  for (const key in table[BlinkKey].storage.indexes) {
    const btree = table[BlinkKey].storage.indexes[key]!;
    btree.clear();
    btree.totalItemSize = 0;
  }
  void table[BlinkKey].events.onClear.dispatch();
  return Promise.resolve();
}
