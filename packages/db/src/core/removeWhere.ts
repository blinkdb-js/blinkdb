import { middleware } from "../events/Middleware";
import { get } from "../query";
import { Filter } from "../query/types";
import { Table } from "./createTable";
import { Ids } from "./remove";
import { internalRemoveMany } from "./removeMany";

/**
 * Removes all entities that match the given `filter`.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * const userId = await insert(userTable, { id: uuid(), name: 'Alice', age: 15 });
 * // Remove all users older than 15
 * await removeMany(userTable, {
 *   where: {
 *     age: { gt: 15 }
 *   }
 * });
 */
export async function removeWhere<T extends object, P extends keyof T>(
  table: Table<T, P>,
  filter: Filter<T>
): Promise<void> {
  return middleware<T, P, "removeWhere">(
    table,
    { action: "removeWhere", params: [table, filter] },
    (table, filter) => internalRemoveWhere(table, filter)
  );
}

export async function internalRemoveWhere<T extends object, P extends keyof T>(
  table: Table<T, P>,
  filter: Filter<T>
): Promise<void> {
  await internalRemoveMany(table, get(table, filter) as Ids<T, P>[]);
}
